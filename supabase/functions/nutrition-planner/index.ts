import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Intake = {
  objetivo?: string;
  alergias?: string;
  restricoesReligiosas?: string;
  preferencias?: string;
  naoGosta?: string;
  rotinaHorarios?: string;
  orcamento?: 'baixo' | 'médio' | 'alto';
  tempoPreparoMin?: number;
  utensilios?: string;
};

type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'supper';

type PlannerInput = {
  user_id?: string; // required when save=true
  intake: Intake;
  save?: boolean;
  plan_date?: string; // YYYY-MM-DD
};

type Totals = { kcal: number; protein_g: number; fat_g: number; carbs_g: number; fiber_g: number; sodium_mg: number };

type PlannerItem = {
  slot: MealSlot;
  item_name: string;
  grams: number;
  state?: string;
};

function decideDailyCalories(intake: Intake): number {
  const obj = (intake.objetivo || '').toLowerCase();
  if (/emagrec|perder/.test(obj)) return 1800;
  if (/(ganhar|hipertrof|massa)/.test(obj)) return 2300;
  return 2000;
}

function baseTemplate(intake: Intake): Array<PlannerItem> {
  // Safe seed-based template (uses foods present in seed migration)
  // breakfast kept empty for now due to limited seed; focus on lunch/dinner
  return [
    { slot: 'lunch', item_name: 'arroz', grams: 120 },
    { slot: 'lunch', item_name: 'frango', grams: 150, state: 'grelhado' },
    { slot: 'lunch', item_name: 'molho de tomate', grams: 40 },
    { slot: 'lunch', item_name: 'azeite', grams: 5 },
    { slot: 'dinner', item_name: 'arroz', grams: 120 },
    { slot: 'dinner', item_name: 'frango', grams: 150, state: 'grelhado' },
    { slot: 'dinner', item_name: 'molho de tomate', grams: 40 },
    { slot: 'dinner', item_name: 'azeite', grams: 5 },
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PlannerInput = await req.json();
    if (!payload || !payload.intake) throw new Error('intake é obrigatório');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('authorization') || '';
    let userIdFromAuth: string | null = null;
    
    // Somente tenta resolver usuário se necessário salvar
    if (payload.save) {
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
      if (!anonKey || !authHeader) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized to save' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: userData } = await userClient.auth.getUser();
      userIdFromAuth = userData?.user?.id || null;
    }

    // Authorization to save: must be authenticated and match provided user_id when saving
    if (payload.save) {
      if (!userIdFromAuth) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized to save' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (payload.user_id && payload.user_id !== userIdFromAuth) {
        return new Response(JSON.stringify({ success: false, error: 'Forbidden: user mismatch' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      payload.user_id = userIdFromAuth;
    }

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes');
    }
    const service = createClient(supabaseUrl, serviceKey);

    const items = baseTemplate(payload.intake);

    // Group items by slot
    const bySlot = new Map<MealSlot, PlannerItem[]>();
    for (const it of items) {
      const list = bySlot.get(it.slot) || [];
      list.push(it);
      bySlot.set(it.slot, list);
    }

    const slotEntries = Array.from(bySlot.entries());

    const slotResults: Record<string, { totals: Totals; resolved: any[] }> = {};
    let dayTotals: Totals = { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };

    for (const [slot, list] of slotEntries) {
      const invokeBody = {
        items: list.map((l) => ({ name: l.item_name, grams: l.grams, state: l.state })),
        locale: 'pt-BR'
      };
      const { data, error } = await service.functions.invoke('nutrition-calc', { body: invokeBody });
      let slotTotals: Totals;
      if (error || !data) {
        console.warn('nutrition-planner: fallback simple calc due to error or empty data from nutrition-calc');
        // Fallback simples: estimar macros por regras básicas
        const resolved = list.map((l) => ({
          input: { name: l.item_name, grams: l.grams, state: l.state },
          matched_food_id: null,
          base_state: l.state || null,
          effective_grams: l.grams,
          nutrients: (() => {
            const g = l.grams;
            const name = (l.item_name || '').toLowerCase();
            if (name.includes('arroz')) return { kcal: g * 1.3, protein_g: g * 0.027, fat_g: g * 0.003, carbs_g: g * 0.28, fiber_g: g * 0.004, sodium_mg: g * 0.01 };
            if (name.includes('frango')) return { kcal: g * 1.1, protein_g: g * 0.206, fat_g: g * 0.036, carbs_g: 0, fiber_g: 0, sodium_mg: 74/100 * g };
            if (name.includes('azeite')) return { kcal: g * 8.84, protein_g: 0, fat_g: g * 1.0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
            if (name.includes('molho')) return { kcal: g * 0.29, protein_g: g * 0.015, fat_g: g * 0.002, carbs_g: g * 0.05, fiber_g: g * 0.015, sodium_mg: 400/100 * g };
            return { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
          })()
        }));
        slotTotals = resolved.reduce((acc, r) => ({
          kcal: acc.kcal + (r.nutrients.kcal || 0),
          protein_g: acc.protein_g + (r.nutrients.protein_g || 0),
          fat_g: acc.fat_g + (r.nutrients.fat_g || 0),
          carbs_g: acc.carbs_g + (r.nutrients.carbs_g || 0),
          fiber_g: acc.fiber_g + (r.nutrients.fiber_g || 0),
          sodium_mg: acc.sodium_mg + (r.nutrients.sodium_mg || 0),
        }), { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 } as Totals);
        slotResults[slot] = { totals: slotTotals, resolved };
      } else {
        slotTotals = data?.totals || { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
        slotResults[slot] = { totals: slotTotals, resolved: data?.resolved || [] };
      }
      dayTotals.kcal += slotTotals.kcal;
      dayTotals.protein_g += slotTotals.protein_g;
      dayTotals.fat_g += slotTotals.fat_g;
      dayTotals.carbs_g += slotTotals.carbs_g;
      dayTotals.fiber_g += slotTotals.fiber_g;
      dayTotals.sodium_mg += slotTotals.sodium_mg;
    }

    const targetKcal = decideDailyCalories(payload.intake);
    const guarantee = Math.abs(dayTotals.kcal - targetKcal) / targetKcal <= 0.2; // ±20% for prototype

    let savedPlanId: string | null = null;
    if (payload.save && payload.user_id) {
      const planDate = payload.plan_date ? new Date(payload.plan_date) : new Date();
      const { data: planRows, error: insErr } = await service
        .from('meal_plans')
        .insert({
          user_id: payload.user_id,
          plan_date: planDate.toISOString().slice(0, 10),
          status: 'draft',
          context: payload.intake as unknown as Record<string, unknown>,
          source: 'planner_v1',
          model_version: 'v0.1',
          verified: guarantee,
          total_kcal: dayTotals.kcal,
          protein_g: dayTotals.protein_g,
          fat_g: dayTotals.fat_g,
          carbs_g: dayTotals.carbs_g,
          fiber_g: dayTotals.fiber_g,
          sodium_mg: dayTotals.sodium_mg
        })
        .select('id')
        .single();
      if (insErr) throw insErr;
      savedPlanId = planRows?.id || null;

      if (savedPlanId) {
        const toInsert = slotEntries.flatMap(([slot, list]) => list.map((l) => {
          // Find matching resolved item for macro snapshot
          const res = (slotResults[slot]?.resolved || []).find((r: any) => (r?.input?.name || '').toLowerCase() === l.item_name.toLowerCase());
          const n = res?.nutrients || { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
          return {
            meal_plan_id: savedPlanId,
            slot,
            item_name: l.item_name,
            food_id: res?.matched_food_id || null,
            grams: res?.effective_grams ?? l.grams,
            ml: null,
            state: l.state || res?.base_state || null,
            kcal: n.kcal,
            protein_g: n.protein_g,
            fat_g: n.fat_g,
            carbs_g: n.carbs_g,
            fiber_g: n.fiber_g,
            sodium_mg: n.sodium_mg
          };
        }));
        const { error: itemsErr } = await service.from('meal_plan_items').insert(toInsert);
        if (itemsErr) throw itemsErr;
      }
    }

    // Substituições simples por categoria para o frontend (protótipo)
    const swap_suggestions = {
      proteina: [
        { name: 'frango', grams: 150 },
        { name: 'peixe', grams: 150 },
        { name: 'atum', grams: 120 },
        { name: 'ovos', grams: 100 }
      ],
      carboidrato: [
        { name: 'arroz', grams: 120 },
        { name: 'batata', grams: 150 },
        { name: 'batata doce', grams: 150 },
        { name: 'pão', grams: 50 },
        { name: 'aveia', grams: 40 }
      ],
      vegetal: [
        { name: 'salada', grams: 120 },
        { name: 'legumes', grams: 150 }
      ]
    } as const;

    return new Response(JSON.stringify({
      success: true,
      target_kcal: targetKcal,
      totals: dayTotals,
      guarantee,
      by_slot: slotResults,
      swap_suggestions,
      plan_id: savedPlanId
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('nutrition-planner error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


