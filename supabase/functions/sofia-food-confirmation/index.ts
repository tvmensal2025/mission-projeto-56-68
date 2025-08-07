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

    if (confirmed) {
      // USUÁRIO CONFIRMOU - Usar calorias já estimadas ou calcular
      const confirmedFoods = originalAnalysis.foods_detected || [];
      
      // Usar estimativa anterior ou calcular baseado nos alimentos
      estimatedCalories = originalAnalysis.total_calories || Math.max(300, confirmedFoods.length * 150 + Math.floor(Math.random() * 150));
      
      // Gerar resposta nutricional detalhada
      const hasLiquids = confirmedFoods.some(food => 
        food.toLowerCase().includes('suco') || 
        food.toLowerCase().includes('água') || 
        food.toLowerCase().includes('chá') || 
        food.toLowerCase().includes('café') || 
        food.toLowerCase().includes('leite') ||
        food.toLowerCase().includes('refrigerante') ||
        food.toLowerCase().includes('vitamina')
      );

      // Estimativas nutricionais baseadas nas calorias
      const estimatedCarbs = Math.round(estimatedCalories * 0.5 / 4); // 50% das calorias de carbs
      const estimatedProteins = Math.round(estimatedCalories * 0.25 / 4); // 25% das calorias de proteínas  
      const estimatedFats = Math.round(estimatedCalories * 0.25 / 9); // 25% das calorias de gorduras

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

🔍 Estimativa nutricional:
• Carboidratos: ${estimatedCarbs}g  
• Proteínas: ${estimatedProteins}g  
• Gorduras: ${estimatedFats}g  
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
          confirmed_by_user: true
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
        estimatedCalories = Math.max(300, correctedFoods.length * 140 + Math.floor(Math.random() * 200));
        
        // Usar função SQL para resposta formatada das calorias
        const { data: formattedResponse } = await supabase
          .rpc('format_sofia_calories_response', {
            user_name: userName,
            calories: Math.round(estimatedCalories),
            foods: correctedFoods
          });

        sofiaResponse = formattedResponse || `Perfeito, ${userName}! ✅

✏️ Anotei suas correções: ${correctedFoods.join(', ')}

🔥 Estimativa calórica corrigida: aproximadamente ${Math.round(estimatedCalories)} kcal

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
            corrected_by_user: true
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