import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisId, confirmed, userCorrections, userId } = await req.json();
    
    console.log('✅ Sofia Food Confirmation recebida:', { analysisId, confirmed, userCorrections, userId });

    // Verificar se o analysisId é válido
    if (!analysisId || analysisId === 'undefined' || analysisId._type === 'undefined') {
      console.log('⚠️ analysisId inválido, gerando resposta de fallback');
      
      // Gerar resposta de fallback quando não há analysisId válido
      let fallbackResponse = '';
      let fallbackCalories = 0;
      
      if (confirmed) {
        fallbackCalories = 600; // Estimativa padrão
        fallbackResponse = `Perfeito! ✅

🔥 Estimativa calórica: aproximadamente ${fallbackCalories} kcal

Obrigada por confirmar! Continue compartilhando suas refeições comigo para análises mais precisas! 😉✨`;
      } else if (userCorrections?.alimentos) {
        const correctedFoods = userCorrections.alimentos;
        fallbackCalories = Math.max(300, correctedFoods.length * 150);
        fallbackResponse = `Obrigada pelas correções! ✅

✏️ Anotei: ${correctedFoods.join(', ')}

🔥 Estimativa calórica: aproximadamente ${fallbackCalories} kcal

Isso me ajuda a melhorar! Continue enviando suas refeições! 🤖💡`;
      } else {
        fallbackResponse = `Obrigada pelo feedback! 😊

Vou ajustar minha análise para ser mais precisa na próxima vez! Continue enviando suas refeições! ✨`;
      }
      
      return new Response(JSON.stringify({
        success: true,
        sofia_response: fallbackResponse,
        estimated_calories: fallbackCalories,
        confirmed: confirmed || !!userCorrections?.alimentos
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Helpers para gerar itens determinísticos
    function isLiquidName(name: string): boolean {
      const n = (name || '').toLowerCase();
      return n.includes('suco') || n.includes('refrigerante') || n.includes('água') || n.includes('agua') || n.includes('café') || n.includes('cafe') || n.includes('leite') || n.includes('vitamina') || n.includes('chá') || n.includes('cha');
    }
    const DEFAULT_PORTIONS: Record<string, number> = {
      'ovo': 50,
      'ovos': 100,
      'arroz': 100,
      'feijão': 80,
      'feijao': 80,
      'frango grelhado': 150,
      'carne bovina': 150,
      'salada': 50,
      'batata': 150
    };
    function guessPortion(name: string): number {
      const key = (name || '').toLowerCase().trim();
      if (DEFAULT_PORTIONS[key]) return DEFAULT_PORTIONS[key];
      if (isLiquidName(key)) return 200; // mL
      if (key.includes('carne') || key.includes('frango') || key.includes('peixe')) return 150;
      if (key.includes('arroz') || key.includes('massa') || key.includes('macarr') || key.includes('batata')) return 100;
      if (key.includes('salada') || key.includes('verdura') || key.includes('legume')) return 50;
      return 100; // padrão
    }
    async function calcDeterministicTotals(names: string[]): Promise<{kcal:number, protein_g:number, carbs_g:number, fat_g:number, fiber_g:number, sodium_mg:number} | null> {
      try {
        const items = names.map((n) => ({
          name: n,
          grams: isLiquidName(n) ? undefined : guessPortion(n),
          ml: isLiquidName(n) ? guessPortion(n) : undefined
        }));
        const res = await fetch(`${supabaseUrl}/functions/v1/nutrition-calc`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${supabaseServiceKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, locale: 'pt-BR' })
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.totals || null;
      } catch (_e) {
        return null;
      }
    }

    // Buscar a análise original
    const { data: originalAnalysis, error: fetchError } = await supabase
      .from('sofia_food_analysis')
      .select('*')
      .eq('id', analysisId)
      .single();

    console.log('🔍 Buscando análise:', analysisId, 'Resultado:', originalAnalysis, 'Erro:', fetchError);

    if (!originalAnalysis) {
      console.error('❌ Análise não encontrada para ID:', analysisId);
      console.log('📊 Verificando últimas análises na tabela...');
      
      // Verificar últimas análises para debug
      const { data: lastAnalyses } = await supabase
        .from('sofia_food_analysis')
        .select('id, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('📋 Últimas análises:', lastAnalyses);
      
      throw new Error(`Análise não encontrada para ID: ${analysisId}`);
    }

    const userName = originalAnalysis.user_name || 'usuário';
    let sofiaResponse = '';
    let estimatedCalories = 0;
    let deterministicTotals: any = null;

    if (confirmed) {
      // USUÁRIO CONFIRMOU - Calcular determinístico via nutrition-calc
      const confirmedFoods = originalAnalysis.foods_detected || [];
      deterministicTotals = await calcDeterministicTotals(confirmedFoods);
      estimatedCalories = deterministicTotals ? Math.round(deterministicTotals.kcal) : (originalAnalysis.total_calories || Math.max(300, confirmedFoods.length * 150 + Math.floor(Math.random() * 150)));
      
      // Gerar resposta nutricional detalhada (determinístico se disponível)
      const hasLiquids = confirmedFoods.some(food => 
        food.toLowerCase().includes('suco') || 
        food.toLowerCase().includes('água') || 
        food.toLowerCase().includes('chá') || 
        food.toLowerCase().includes('café') || 
        food.toLowerCase().includes('leite') ||
        food.toLowerCase().includes('refrigerante') ||
        food.toLowerCase().includes('vitamina')
      );

      // Números determinísticos ou estimativa por macros
      const carbs = deterministicTotals ? Number(deterministicTotals.carbs_g).toFixed(1) : Math.round(estimatedCalories * 0.5 / 4).toString();
      const proteins = deterministicTotals ? Number(deterministicTotals.protein_g).toFixed(1) : Math.round(estimatedCalories * 0.25 / 4).toString();
      const fats = deterministicTotals ? Number(deterministicTotals.fat_g).toFixed(1) : Math.round(estimatedCalories * 0.25 / 9).toString();

      const liquidsList = hasLiquids ? confirmedFoods.filter(food => 
        food.toLowerCase().includes('suco') || 
        food.toLowerCase().includes('água') || 
        food.toLowerCase().includes('chá') || 
        food.toLowerCase().includes('café') || 
        food.toLowerCase().includes('leite') ||
        food.toLowerCase().includes('refrigerante') ||
        food.toLowerCase().includes('vitamina')
      ) : [];

      const solidFoods = confirmedFoods.filter(food => !liquidsList.includes(food));

      sofiaResponse = `🍽️ Prato identificado: ${solidFoods.join(', ')}${hasLiquids ? `\n💧 Líquidos: ${liquidsList.join(', ')}` : ''}

🔍 Estimativa nutricional${deterministicTotals ? ' (determinístico)' : ''}:
• Carboidratos: ${carbs}g  
• Proteínas: ${proteins}g  
• Gorduras: ${fats}g  
• Calorias totais: ${Math.round(estimatedCalories)} kcal

🔒 Salvo com sucesso. Você está no controle!`;

      // Atualizar análise com confirmação
      await supabase
        .from('sofia_food_analysis')
        .update({
          confirmed_by_user: true,
          total_calories: Math.round(estimatedCalories),
          analysis_result: {
            ...originalAnalysis.analysis_result,
            user_confirmed: true,
            confirmation_timestamp: new Date().toISOString(),
            final_calories: Math.round(estimatedCalories)
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId);

      // Salvar na tabela food_analysis para compatibilidade
      await supabase.from('food_analysis').insert({
        user_id: userId,
        meal_type: originalAnalysis.meal_type || 'refeicao',
        food_items: {
          detected_foods: confirmedFoods,
          image_url: originalAnalysis.image_url,
          confirmed: true
        },
        nutrition_analysis: {
          estimated_calories: Math.round(estimatedCalories),
          confirmed_by_user: true,
          totals: deterministicTotals || null
        },
        sofia_analysis: {
          analysis: sofiaResponse,
          foods: confirmedFoods,
          calories: Math.round(estimatedCalories),
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });

    } else {
      // USUÁRIO NÃO CONFIRMOU - Fluxo de correção
      sofiaResponse = `Obrigada pelo feedback, ${userName}! 📝 `;

      if (userCorrections && userCorrections.alimentos) {
        const correctedFoods = userCorrections.alimentos;
        deterministicTotals = await calcDeterministicTotals(correctedFoods);
        estimatedCalories = deterministicTotals ? Math.round(deterministicTotals.kcal) : Math.max(300, correctedFoods.length * 140 + Math.floor(Math.random() * 200));
        
        // Usar função SQL para resposta formatada das calorias
        const { data: formattedResponse } = await supabase
          .rpc('format_sofia_calories_response', {
            user_name: userName,
            calories: Math.round(estimatedCalories),
            foods: correctedFoods
          });

        const carbs2 = deterministicTotals ? Number(deterministicTotals.carbs_g).toFixed(1) : undefined;
        const proteins2 = deterministicTotals ? Number(deterministicTotals.protein_g).toFixed(1) : undefined;
        const fats2 = deterministicTotals ? Number(deterministicTotals.fat_g).toFixed(1) : undefined;
        const detBlock = deterministicTotals ? `\n\n🔍 Estimativa nutricional (determinístico):\n• Carboidratos: ${carbs2}g\n• Proteínas: ${proteins2}g\n• Gorduras: ${fats2}g\n• Calorias totais: ${Math.round(estimatedCalories)} kcal` : '';

        sofiaResponse = formattedResponse || `Perfeito, ${userName}! ✅

✏️ Anotei suas correções: ${correctedFoods.join(', ')}${detBlock}

Isso me ajuda muito a melhorar! 🤖💡 Continue compartilhando suas refeições comigo! ✨`;

        // Atualizar com correções
        await supabase
          .from('sofia_food_analysis')
          .update({
            foods_detected: correctedFoods,
            total_calories: Math.round(estimatedCalories),
            confirmed_by_user: true,
            analysis_result: {
              ...originalAnalysis.analysis_result,
              user_corrected: true,
              corrected_foods: correctedFoods,
              correction_timestamp: new Date().toISOString(),
              final_calories: Math.round(estimatedCalories)
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', analysisId);

        // Salvar na tabela food_analysis com correções
        await supabase.from('food_analysis').insert({
          user_id: userId,
          meal_type: originalAnalysis.meal_type || 'refeicao',
          food_items: {
            detected_foods: correctedFoods,
            image_url: originalAnalysis.image_url,
            corrected: true
          },
          nutrition_analysis: {
            estimated_calories: Math.round(estimatedCalories),
            corrected_by_user: true,
            totals: deterministicTotals || null
          },
          sofia_analysis: {
            analysis: sofiaResponse,
            foods: correctedFoods,
            calories: Math.round(estimatedCalories),
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });

      } else {
        sofiaResponse += `

Vou ajustar minha análise para ser mais precisa na próxima vez! 🎯

Continue enviando suas refeições - estou sempre aprendendo para te ajudar melhor! 😊✨`;
      }
    }

    // Salvar conversa de confirmação
    await supabase.from('sofia_conversations').insert({
      user_id: userId,
      user_message: confirmed ? 'Confirmou análise' : 'Fez correções na análise',
      sofia_response: sofiaResponse,
      context_data: {
        type: 'food_confirmation',
        analysis_id: analysisId,
        confirmed: confirmed,
        corrections: userCorrections,
        final_calories: Math.round(estimatedCalories)
      },
      conversation_type: 'confirmation',
      related_analysis_id: analysisId,
      created_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      sofia_response: sofiaResponse,
      estimated_calories: Math.round(estimatedCalories),
      totals: deterministicTotals || null,
      confirmed: confirmed || !!userCorrections?.alimentos
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na confirmação da Sofia:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Ops! Tive um problema para processar sua confirmação. Tente novamente! 😊',
      error: error.message
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});