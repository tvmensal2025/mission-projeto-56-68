import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MacroRow {
  day: string; // yyyy-mm-dd
  meal_type: MealSlot;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sodium_mg?: number;
  items?: Array<{ name?: string; quantity?: number; unit?: string }>;
}

export interface DailyAggregates {
  byMeal: Record<MealSlot, { kcal: number; protein_g: number; carbs_g: number; fat_g: number }>;
  totals: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
}

export function useDailyNutritionReport(date: Date) {
  const [rows, setRows] = useState<MacroRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user?.id;
        if (!userId) {
          setRows([]);
          setLoading(false);
          return;
        }
        const dayStr = date.toISOString().slice(0, 10);
        // Buscar direto de food_analysis para manter RLS; poderíamos usar a view no futuro
        const { data, error } = await supabase
          .from('food_analysis')
          .select('created_at, meal_type, nutrition_analysis, food_items')
          .eq('user_id', userId)
          .gte('created_at', `${dayStr}T00:00:00+00`)
          .lte('created_at', `${dayStr}T23:59:59+00`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const parsed: MacroRow[] = (data || []).map((r: any) => ({
          day: r.created_at.slice(0, 10),
          meal_type: r.meal_type,
          kcal: Number(r.nutrition_analysis?.totalCalories || 0),
          protein_g: Number(r.nutrition_analysis?.totalProtein || 0),
          carbs_g: Number(r.nutrition_analysis?.totalCarbs || 0),
          fat_g: Number(r.nutrition_analysis?.totalFat || 0),
          fiber_g: Number(r.nutrition_analysis?.totalFiber || 0),
          sodium_mg: Number(r.nutrition_analysis?.totalSodium || 0),
          items: Array.isArray(r.food_items) ? r.food_items : [],
        }));

        if (!mounted) return;
        setRows(parsed);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Erro ao carregar dados');
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [date]);

  const aggregates: DailyAggregates = useMemo(() => {
    const init = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    const byMeal: DailyAggregates['byMeal'] = {
      breakfast: { ...init },
      lunch: { ...init },
      snack: { ...init },
      dinner: { ...init },
    };
    for (const r of rows) {
      const m = byMeal[r.meal_type as MealSlot] || (byMeal.snack);
      m.kcal += r.kcal;
      m.protein_g += r.protein_g;
      m.carbs_g += r.carbs_g;
      m.fat_g += r.fat_g;
    }
    const totals = Object.values(byMeal).reduce((acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein_g: acc.protein_g + m.protein_g,
      carbs_g: acc.carbs_g + m.carbs_g,
      fat_g: acc.fat_g + m.fat_g,
    }), { ...init });
    return { byMeal, totals };
  }, [rows]);

  return { rows, aggregates, loading, error };
}


