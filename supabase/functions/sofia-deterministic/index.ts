import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NUTRITION_DEBUG = Deno.env.get('NUTRITION_DEBUG') === 'true';

// Normalizar texto
function normalize(text: string): string {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9 ]/g, ' ') // remove pontuação
    .trim()
    .replace(/\s+/g, ' '); // normaliza espaços
}

interface DetectedFood {
  name: string;
  grams?: number;
  ml?: number;
  state?: 'cru' | 'cozido' | 'grelhado' | 'frito';
}

interface NutritionCalculation {
  total_kcal: number;
  total_proteina: number;
  total_carbo: number;
  total_gordura: number;
  total_fibras: number;
  total_sodio: number;
  matched_count: number;
  total_count: number;
  unmatched_items: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { detected_foods, user_id, analysis_type = 'nutritional_sum', request_id } = await req.json();
    
    console.log('🔥 Sofia Deterministic - Cálculo nutricional exato');
    console.log(`📊 Processando ${detected_foods?.length || 0} alimentos`);
    if (request_id) {
      console.log(`🆔 Request ID: ${request_id}`);
    }

    if (!detected_foods || !Array.isArray(detected_foods)) {
      throw new Error('detected_foods deve ser um array');
    }

    // Buscar nome do usuário para resposta personalizada
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user_id)
      .single();
    
    const userName = profile?.full_name?.split(' ')[0] || 'querido(a)';

    // Calcular nutrição determinística
    const nutrition = await calculateDeterministicNutrition(supabase, detected_foods);
    
    // Gerar resposta única formatada
    const response = generateSofiaResponse(userName, nutrition, detected_foods);
    
    // Salvar dados no banco antes de responder
    if (user_id && analysis_type === 'nutritional_sum') {
      await saveFoodAnalysis(supabase, user_id, detected_foods, nutrition);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis_type: 'nutritional_sum',
      sofia_response: response,
      nutrition_data: nutrition,
      deterministic: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro Sofia Deterministic:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      sofia_response: 'Ops! Tive um problema ao analisar sua refeição. Tente novamente! 😅'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculateDeterministicNutrition(supabase: any, foods: DetectedFood[]): Promise<NutritionCalculation> {
  const result: NutritionCalculation = {
    total_kcal: 0,
    total_proteina: 0,
    total_carbo: 0,
    total_gordura: 0,
    total_fibras: 0,
    total_sodio: 0,
    matched_count: 0,
    total_count: foods.length,
    unmatched_items: []
  };

  for (const food of foods) {
    const normalized = normalize(food.name);
    let grams = Number(food.grams || 100); // Default 100g se não especificado

    if (NUTRITION_DEBUG) {
      console.log(`🔍 Buscando: ${food.name} (${grams}g)`);
    }

    // 1) Tentar tabelataco primeiro (fonte primária)
    const { data: tacoMatch } = await supabase
      .from('valores_nutricionais_completos')
      .select('*')
      .or(`alimento_nome.ilike.%${food.name}%,alimento_nome.ilike.%${normalized}%`)
      .limit(5);

    let foodData = null;
    let source = '';

    if (tacoMatch?.length > 0) {
      // Escolher melhor match da tabelataco
      foodData = tacoMatch.reduce((best: any, curr: any) => {
        const bestScore = (best.kcal || 0) + (best.proteina || 0) + (best.carboidratos || 0);
        const currScore = (curr.kcal || 0) + (curr.proteina || 0) + (curr.carboidratos || 0);
        return currScore > bestScore ? curr : best;
      });
      source = 'tabelataco';
      
      if (NUTRITION_DEBUG) {
        console.log(`✅ TACO: ${foodData.alimento_nome}`);
      }
    } else {
      // 2) Fallback para nutrition_foods se não encontrou na tabelataco
      const { data: nutritionMatch } = await supabase
        .from('nutrition_foods')
        .select('*')
        .ilike('canonical_name', `%${food.name}%`)
        .eq('locale', 'pt-BR')
        .limit(5);

      if (nutritionMatch?.length > 0) {
        const nonZero = nutritionMatch.filter(f => (Number(f.kcal)||0) > 0);
        foodData = nonZero.length > 0 ? nonZero[0] : nutritionMatch[0];
        source = 'nutrition_foods';
        
        // Aplicar fatores se necessário
        if (foodData.edible_portion_factor) {
          grams = grams * Number(foodData.edible_portion_factor);
        }
        if (foodData.density_g_ml && food.ml) {
          grams = Number(food.ml) * Number(foodData.density_g_ml);
        }
        
        if (NUTRITION_DEBUG) {
          console.log(`✅ NUTRITION_FOODS: ${foodData.canonical_name}`);
        }
      }
    }

    if (foodData) {
      // Calcular nutrientes por grama
      const factor = grams / 100.0;
      
      if (source === 'tabelataco') {
        result.total_kcal += (Number(foodData.kcal) || 0) * factor;
        result.total_proteina += (Number(foodData.proteina) || 0) * factor;
        result.total_carbo += (Number(foodData.carboidratos) || 0) * factor;
        result.total_gordura += (Number(foodData.gorduras) || 0) * factor;
        result.total_fibras += (Number(foodData.fibras) || 0) * factor;
        result.total_sodio += (Number(foodData.sodio) || 0) * factor;
      } else {
        result.total_kcal += (Number(foodData.kcal) || 0) * factor;
        result.total_proteina += (Number(foodData.protein_g) || 0) * factor;
        result.total_carbo += (Number(foodData.carbs_g) || 0) * factor;
        result.total_gordura += (Number(foodData.fat_g) || 0) * factor;
        result.total_fibras += (Number(foodData.fiber_g) || 0) * factor;
        result.total_sodio += (Number(foodData.sodium_mg) || 0) * factor;
      }
      
      result.matched_count++;
    } else {
      result.unmatched_items.push(food.name);
      console.warn(`⚠️ Alimento não encontrado: ${food.name}`);
    }
  }

  // Arredondar valores finais
  result.total_kcal = Math.round(result.total_kcal);
  result.total_proteina = Math.round(result.total_proteina * 10) / 10;
  result.total_carbo = Math.round(result.total_carbo * 10) / 10;
  result.total_gordura = Math.round(result.total_gordura * 10) / 10;
  result.total_fibras = Math.round(result.total_fibras * 10) / 10;
  result.total_sodio = Math.round(result.total_sodio * 10) / 10;

  console.log(`✅ Cálculo concluído: ${result.matched_count}/${result.total_count} alimentos processados`);
  
  return result;
}

function generateSofiaResponse(userName: string, nutrition: NutritionCalculation, foods: DetectedFood[]): string {  
  return `💪 Proteínas: ${nutrition.total_proteina} g
🍞 Carboidratos: ${nutrition.total_carbo} g  
🥑 Gorduras: ${nutrition.total_gordura} g
🔥 Estimativa calórica: ${nutrition.total_kcal} kcal

✅ Obrigado! Seus dados estão salvos.`;
}

async function saveFoodAnalysis(supabase: any, user_id: string, foods: DetectedFood[], nutrition: NutritionCalculation) {
  try {
    const { error } = await supabase
      .from('food_analysis')
      .insert({
        user_id,
        meal_type: 'refeicao',
        food_items: foods,
        nutrition_analysis: {
          totalCalories: nutrition.total_kcal,
          totalProtein: nutrition.total_proteina,
          totalCarbs: nutrition.total_carbo,
          totalFat: nutrition.total_gordura,
          totalFiber: nutrition.total_fibras,
          totalSodium: nutrition.total_sodio,
          deterministic: true,
          matched_count: nutrition.matched_count,
          total_count: nutrition.total_count
        },
        sofia_analysis: {
          analysis: 'Análise nutricional determinística por grama',
          deterministic: true
        },
        emotional_state: 'satisfeita'
      });
    
    if (error) {
      console.error('Erro ao salvar food_analysis:', error);
    } else {
      console.log('✅ Dados salvos no food_analysis');
    }
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
}