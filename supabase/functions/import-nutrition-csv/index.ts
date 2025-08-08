import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Row = Record<string, string>;

function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCSV(text: string, delimiter = ','): Row[] {
  // Minimal CSV parser with quotes support
  const rows: Row[] = [];
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return rows;

  // Detect delimiter if not provided
  if (!delimiter) {
    const first = lines[0];
    delimiter = first.includes(';') && !first.includes(',') ? ';' : ',';
  }

  function splitLine(line: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (c === delimiter && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  }

  const headers = splitLine(lines[0]).map(h => normalize(h));
  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const row: Row = {};
    headers.forEach((h, idx) => row[h] = cols[idx] ?? '');
    rows.push(row);
  }
  return rows;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvText, csvUrl, delimiter, defaults } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load CSV text
    let text: string = csvText;
    if (!text && csvUrl) {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`Falha ao baixar CSV: ${res.status}`);
      text = await res.text();
    }
    if (!text) throw new Error('csvText ou csvUrl é obrigatório');

    const rows = parseCSV(text, delimiter || ',');
    if (rows.length === 0) return new Response(JSON.stringify({ success: false, error: 'CSV vazio' }), { headers: corsHeaders, status: 400 });

    // Check required schema on DB
    let schemaOk = true;
    try {
      await supabase.from('valores_nutricionais_completos').select('kcal, carboidratos, proteina, gorduras, fibra, sodio_mg').limit(1);
    } catch (_) {
      schemaOk = false;
    }
    if (!schemaOk) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Estrutura nutricional incompleta. Aplique a migração idempotente no SQL Editor.',
        migration: 'supabase/migrations/20250808120000_nutrition_deterministic_patch.sql'
      }), { headers: corsHeaders, status: 400 });
    }

    const results: any[] = [];
    const errors: any[] = [];
    const stats = { upsertedFoods: 0, insertedValues: 0, insertedAliases: 0, insertedDensities: 0, insertedEPF: 0, insertedYields: 0 };

    for (const r of rows) {
      try {
        const name = r['name'] || r['nome'] || r['canonical_name'] || r['nome_canonico'] || '';
        const alias = r['alias'] || r['aliases'] || '';
        const categoria = r['categoria'] || defaults?.categoria || 'desconhecida';
        const subcategoria = r['subcategoria'] || defaults?.subcategoria || 'desconhecida';
        const state = r['state'] || r['estado'] || '';

        if (!name) throw new Error('Linha sem nome');

        // Upsert alimento
        let alimentoId: number | null = null;
        {
          // try find existing by nome ILIKE
          const { data: found } = await supabase
            .from('alimentos_completos')
            .select('id')
            .ilike('nome', name)
            .maybeSingle();

          if (found?.id) alimentoId = found.id;
          else {
            const { data: ins, error: insErr } = await supabase
              .from('alimentos_completos')
              .insert({ nome: name, categoria, subcategoria })
              .select('id')
              .single();
            if (insErr) throw insErr;
            alimentoId = ins!.id;
            stats.upsertedFoods++;
          }
        }

        // Valores por 100g
        const carbs = Number(r['carbs_g'] || r['carboidratos'] || r['carb'] || 0);
        const prot = Number(r['protein_g'] || r['proteina'] || r['protein'] || 0);
        const fat = Number(r['fat_g'] || r['gorduras'] || r['fat'] || 0);
        const fiber = Number(r['fiber_g'] || r['fibra'] || 0);
        const sodium = Number(r['sodium_mg'] || r['sodio_mg'] || 0);
        let kcal = Number(r['kcal'] || r['calorias'] || 0);
        if (!kcal && (carbs || prot || fat)) {
          kcal = Math.round(4 * carbs + 4 * prot + 9 * fat);
        }

        if (carbs || prot || fat || fiber || sodium || kcal) {
          // upsert by alimento_id (if exists, update)
          const { data: existsVal } = await supabase
            .from('valores_nutricionais_completos')
            .select('alimento_id')
            .eq('alimento_id', alimentoId)
            .maybeSingle();
          if (existsVal) {
            const { error: updErr } = await supabase
              .from('valores_nutricionais_completos')
              .update({ carboidratos: carbs, proteina: prot, gorduras: fat, fibra: fiber, sodio_mg: sodium, kcal })
              .eq('alimento_id', alimentoId);
            if (updErr) throw updErr;
          } else {
            const { error: insValErr } = await supabase
              .from('valores_nutricionais_completos')
              .insert({ alimento_id: alimentoId, carboidratos: carbs, proteina: prot, gorduras: fat, fibra: fiber, sodio_mg: sodium, kcal });
            if (insValErr) throw insValErr;
          }
          stats.insertedValues++;
        }

        // Aliases
        if (alias) {
          const aliasParts = alias.split('|').map(a => normalize(a)).filter(Boolean);
          for (const a of aliasParts) {
            // insert ignore duplicates
            const { error: aliasErr } = await supabase
              .from('alimentos_alias')
              .insert({ alimento_id: alimentoId!, alias_norm: a });
            if (aliasErr && !`${aliasErr.message}`.includes('duplicate key')) throw aliasErr;
            else stats.insertedAliases++;
          }
        }

        // Densidade g/ml
        if (r['density_g_ml']) {
          const density = Number(r['density_g_ml']);
          if (!Number.isNaN(density) && density > 0) {
            const { data: dExists } = await supabase.from('alimentos_densidades').select('alimento_id').eq('alimento_id', alimentoId).maybeSingle();
            if (dExists) {
              await supabase.from('alimentos_densidades').update({ densidade_g_ml: density }).eq('alimento_id', alimentoId);
            } else {
              await supabase.from('alimentos_densidades').insert({ alimento_id: alimentoId, densidade_g_ml: density });
            }
            stats.insertedDensities++;
          }
        }

        // EPF
        if (r['epf']) {
          const epf = Number(r['epf']);
          if (!Number.isNaN(epf) && epf > 0) {
            const { data: eExists } = await supabase.from('alimentos_epf').select('alimento_id').eq('alimento_id', alimentoId).maybeSingle();
            if (eExists) {
              await supabase.from('alimentos_epf').update({ epf }).eq('alimento_id', alimentoId);
            } else {
              await supabase.from('alimentos_epf').insert({ alimento_id: alimentoId, epf });
            }
            stats.insertedEPF++;
          }
        }

        // Yield
        if (r['yield_from_state'] && r['yield_to_state'] && r['yield_factor']) {
          const fromState = normalize(r['yield_from_state']);
          const toState = normalize(r['yield_to_state']);
          const factor = Number(r['yield_factor']);
          if (!Number.isNaN(factor) && factor > 0) {
            // upsert via delete/insert unique
            await supabase
              .from('alimentos_yield')
              .upsert({ alimento_id: alimentoId, from_state: fromState, to_state: toState, factor }, { onConflict: 'alimento_id,from_state,to_state' } as any);
            stats.insertedYields++;
          }
        }

        results.push({ name, alimento_id: alimentoId });
      } catch (err) {
        errors.push({ row: r, error: (err as Error).message });
      }
    }

    return new Response(JSON.stringify({ success: errors.length === 0, stats, imported: results.length, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


