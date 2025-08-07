import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SofiaMessage {
  id: string;
  user_id: string;
  message_type: 'chat' | 'food_analysis' | 'mission_update' | 'goal_progress' | 'challenge_update';
  content: string;
  metadata: any;
  created_at: string;
}

interface MissionUpdate {
  section: string;
  question_id: string;
  answer: string;
  text_response?: string;
  points_earned: number;
}

interface GoalProgress {
  goal_id: string;
  current_value: number;
  progress_percentage: number;
  points_earned: number;
}

interface ChallengeUpdate {
  challenge_id: string;
  progress: number;
  daily_log: any;
  points_earned: number;
}

interface GoogleFitHealthProfile {
  weeklyStats: {
    totalSteps: number;
    totalCalories: number;
    avgHeartRate: number;
    totalActiveMinutes: number;
    avgSleepDuration: number;
    currentWeight?: number;
    weightTrend?: number;
  };
  healthClassifications: {
    activityLevel: 'sedentario' | 'leve' | 'moderado' | 'ativo' | 'muito_ativo';
    sleepQuality: 'insuficiente' | 'regular' | 'bom' | 'excelente';
    heartRateHealth: 'baixa' | 'normal' | 'alta' | 'nao_medido';
    weightStatus: 'perdendo' | 'estavel' | 'ganhando' | 'nao_disponivel';
  };
  recommendations: string[];
}

// Função para buscar e analisar dados do Google Fit
async function getGoogleFitHealthProfile(supabase: any, userId: string): Promise<GoogleFitHealthProfile | null> {
  try {
    console.log('📊 Buscando dados Google Fit para análise Sofia...');
    
    // Buscar dados dos últimos 7 dias
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const { data: googleFitData, error } = await supabase
      .from('google_fit_data')
      .select('*')
      .eq('user_id', userId)
      .gte('data_date', startDate.toISOString().split('T')[0])
      .order('data_date', { ascending: false });

    if (error || !googleFitData || googleFitData.length === 0) {
      console.log('⚠️ Nenhum dado Google Fit encontrado para o usuário');
      return null;
    }

    // Calcular estatísticas semanais
    const weeklyStats = {
      totalSteps: googleFitData.reduce((sum, d) => sum + (d.steps_count || 0), 0),
      totalCalories: googleFitData.reduce((sum, d) => sum + (d.calories_burned || 0), 0),
      avgHeartRate: Math.round(
        googleFitData.filter(d => d.heart_rate_avg > 0)
          .reduce((sum, d, _, arr) => sum + (d.heart_rate_avg || 0) / arr.length, 0)
      ),
      totalActiveMinutes: googleFitData.reduce((sum, d) => sum + (d.active_minutes || 0), 0),
      avgSleepDuration: Math.round(
        (googleFitData.reduce((sum, d) => sum + (d.sleep_duration_hours || 0), 0) / googleFitData.length) * 10
      ) / 10,
      currentWeight: googleFitData.find(d => d.weight_kg)?.weight_kg,
      weightTrend: 0 // Calcular tendência se há dados suficientes
    };

    // Calcular tendência de peso
    const weightData = googleFitData.filter(d => d.weight_kg).sort((a, b) => 
      new Date(a.data_date).getTime() - new Date(b.data_date).getTime()
    );
    if (weightData.length >= 2) {
      weeklyStats.weightTrend = weightData[weightData.length - 1].weight_kg! - weightData[0].weight_kg!;
    }

    // Classificações de saúde
    const healthClassifications = {
      activityLevel: weeklyStats.totalSteps >= 70000 ? 'muito_ativo' :
                    weeklyStats.totalSteps >= 50000 ? 'ativo' :
                    weeklyStats.totalSteps >= 35000 ? 'moderado' :
                    weeklyStats.totalSteps >= 21000 ? 'leve' : 'sedentario' as const,
      
      sleepQuality: weeklyStats.avgSleepDuration >= 7.5 ? 'excelente' :
                   weeklyStats.avgSleepDuration >= 7 ? 'bom' :
                   weeklyStats.avgSleepDuration >= 6 ? 'regular' : 'insuficiente' as const,
      
      heartRateHealth: weeklyStats.avgHeartRate === 0 ? 'nao_medido' :
                      weeklyStats.avgHeartRate < 60 ? 'baixa' :
                      weeklyStats.avgHeartRate <= 100 ? 'normal' : 'alta' as const,
      
      weightStatus: !weeklyStats.weightTrend ? 'nao_disponivel' :
                   weeklyStats.weightTrend < -0.5 ? 'perdendo' :
                   weeklyStats.weightTrend > 0.5 ? 'ganhando' : 'estavel' as const
    };

    // Gerar recomendações baseadas nos dados
    const recommendations = [];
    
    if (healthClassifications.activityLevel === 'sedentario' || healthClassifications.activityLevel === 'leve') {
      recommendations.push('Aumente gradualmente sua atividade física - tente caminhar 10 minutos a mais por dia');
    }
    
    if (healthClassifications.sleepQuality === 'insuficiente' || healthClassifications.sleepQuality === 'regular') {
      recommendations.push('Melhore sua qualidade de sono - estabeleça uma rotina regular e evite telas antes de dormir');
    }
    
    if (healthClassifications.heartRateHealth === 'alta') {
      recommendations.push('Sua frequência cardíaca está elevada - considere exercícios de relaxamento e consulte um profissional');
    }
    
    if (weeklyStats.totalActiveMinutes < 150) {
      recommendations.push('Meta OMS: 150 minutos de atividade moderada por semana - você está progredindo!');
    }

    if (healthClassifications.weightStatus === 'ganhando' && weeklyStats.weightTrend > 1) {
      recommendations.push('Monitore sua alimentação e mantenha-se ativo para equilibrar o ganho de peso');
    }

    console.log('✅ Perfil Google Fit analisado:', { 
      weeklyStats, 
      healthClassifications, 
      recommendationsCount: recommendations.length 
    });

    return {
      weeklyStats,
      healthClassifications,
      recommendations
    };

  } catch (error) {
    console.error('❌ Erro ao analisar dados Google Fit:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🎯 Sofia Integration iniciada')
    
    const { 
      userId, 
      messageType, 
      content, 
      metadata,
      missionUpdate,
      goalProgress,
      challengeUpdate
    } = await req.json()
    
    if (!userId) {
      throw new Error('userId é obrigatório')
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados do usuário
    let userName = "Amigo";
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();
      
      if (profile?.full_name) {
        userName = profile.full_name.split(' ')[0];
      }
    } catch (profileError) {
      console.log('⚠️ Não foi possível buscar nome do usuário');
    }

    // 1. SALVAR MENSAGEM DA SOFIA
    const sofiaMessage: SofiaMessage = {
      id: crypto.randomUUID(),
      user_id: userId,
      message_type: messageType || 'chat',
      content: content,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    };

    // Salvar na tabela de mensagens da Sofia
    await supabase
      .from('sofia_messages')
      .insert(sofiaMessage);

    // 2. ATUALIZAR MISSÃO DO DIA (se aplicável)
    if (missionUpdate) {
      const update: MissionUpdate = missionUpdate;
      
      // Salvar resposta na tabela daily_responses
      await supabase
        .from('daily_responses')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          section: update.section,
          question_id: update.question_id,
          answer: update.answer,
          text_response: update.text_response,
          points_earned: update.points_earned
        }, {
          onConflict: 'user_id,date,question_id'
        });

      // Atualizar sessão da missão do dia
      const { data: session } = await supabase
        .from('daily_mission_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (session) {
        // Atualizar sessão existente
        await supabase
          .from('daily_mission_sessions')
          .update({
            total_points: session.total_points + update.points_earned,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);
      } else {
        // Criar nova sessão
        await supabase
          .from('daily_mission_sessions')
          .insert({
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            total_points: update.points_earned,
            completed_sections: [update.section]
          });
      }

      console.log('✅ Missão do dia atualizada');
    }

    // 3. ATUALIZAR PROGRESSO DE META (se aplicável)
    if (goalProgress) {
      const progress: GoalProgress = goalProgress;
      
      // Atualizar meta do usuário
      await supabase
        .from('user_goals')
        .update({
          current_value: progress.current_value,
          updated_at: new Date().toISOString()
        })
        .eq('id', progress.goal_id)
        .eq('user_id', userId);

      // Adicionar pontos se houver progresso
      if (progress.points_earned > 0) {
        // Atualizar pontos do usuário no perfil
        await supabase
          .from('profiles')
          .update({
            points: supabase.sql`points + ${progress.points_earned}`
          })
          .eq('user_id', userId);
      }

      console.log('✅ Progresso de meta atualizado');
    }

    // 4. ATUALIZAR DESAFIO (se aplicável)
    if (challengeUpdate) {
      const update: ChallengeUpdate = challengeUpdate;
      
      // Atualizar participação no desafio
      await supabase
        .from('challenge_participations')
        .update({
          progress: update.progress,
          daily_logs: supabase.sql`daily_logs || ${JSON.stringify([update.daily_log])}`,
          updated_at: new Date().toISOString()
        })
        .eq('challenge_id', update.challenge_id)
        .eq('user_id', userId);

      // Adicionar pontos se houver progresso
      if (update.points_earned > 0) {
        await supabase
          .from('profiles')
          .update({
            points: supabase.sql`points + ${update.points_earned}`
          })
          .eq('user_id', userId);
      }

      console.log('✅ Desafio atualizado');
    }

    // 5. BUSCAR DADOS GOOGLE FIT PARA ANÁLISE
    const googleFitProfile = await getGoogleFitHealthProfile(supabase, userId);
    
    // 6. GERAR RELATÓRIO PARA DR. VITAL COM DADOS GOOGLE FIT
    const reportData = {
      user_id: userId,
      user_name: userName,
      message_type: messageType,
      content: content,
      timestamp: new Date().toISOString(),
      mission_update: missionUpdate || null,
      goal_progress: goalProgress || null,
      challenge_update: challengeUpdate || null,
      google_fit_analysis: googleFitProfile ? {
        activity_level: googleFitProfile.healthClassifications.activityLevel,
        sleep_quality: googleFitProfile.healthClassifications.sleepQuality,
        heart_rate_status: googleFitProfile.healthClassifications.heartRateHealth,
        weight_trend: googleFitProfile.healthClassifications.weightStatus,
        weekly_summary: {
          steps: googleFitProfile.weeklyStats.totalSteps,
          calories: googleFitProfile.weeklyStats.totalCalories,
          active_minutes: googleFitProfile.weeklyStats.totalActiveMinutes,
          sleep_hours: googleFitProfile.weeklyStats.avgSleepDuration,
          heart_rate: googleFitProfile.weeklyStats.avgHeartRate,
          current_weight: googleFitProfile.weeklyStats.currentWeight,
          weight_trend_kg: googleFitProfile.weeklyStats.weightTrend
        },
        recommendations: googleFitProfile.recommendations,
        analysis_timestamp: new Date().toISOString()
      } : null
    };

    // Salvar relatório para Dr. Vital
    await supabase
      .from('dr_vital_reports')
      .insert({
        user_id: userId,
        report_type: 'sofia_interaction',
        report_data: reportData,
        created_at: new Date().toISOString()
      });

    const response = {
      success: true,
      message: 'Integração concluída com sucesso',
      sofia_message: sofiaMessage,
      mission_updated: !!missionUpdate,
      goal_updated: !!goalProgress,
      challenge_updated: !!challengeUpdate,
      google_fit_analyzed: !!googleFitProfile,
      health_insights: googleFitProfile ? {
        activity_level: googleFitProfile.healthClassifications.activityLevel,
        sleep_quality: googleFitProfile.healthClassifications.sleepQuality,
        recommendations_count: googleFitProfile.recommendations.length
      } : null,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Integração Sofia concluída')

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Erro na integração Sofia:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: "Erro na integração. Tente novamente."
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
}) 