import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleFitData {
  steps: number;
  calories: number;
  distance: number;
  heartRate: number;
  weight?: number;
  height?: number;
  activeMinutes?: number;
  sleepDuration?: number;
  heartRateZones?: {
    restingHeartRate?: number;
    averageHeartRate?: number;
    maxHeartRate?: number;
  };
  workouts?: Array<{
    activity: string;
    duration: number;
    calories: number;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabaseClient.auth.getUser(token);

    if (!user.user) {
      throw new Error('Unauthorized');
    }

    const { access_token, refresh_token, date_range } = await req.json();

    console.log('Sincronizando dados do Google Fit para usuário:', user.user.id);

    // Buscar dados do Google Fit API
    const fitData = await fetchGoogleFitData(access_token, date_range);

    // Salvar dados no Supabase usando a estrutura expandida da tabela
    if (fitData.steps > 0 || fitData.calories > 0 || fitData.heartRate > 0) {
      const googleFitRecord = {
        user_id: user.user.id,
        data_date: new Date().toISOString().split('T')[0],
        steps_count: fitData.steps,
        calories_burned: fitData.calories,
        distance_meters: fitData.distance,
        heart_rate_avg: fitData.heartRate,
        active_minutes: fitData.activeMinutes || 0,
        sleep_duration_hours: fitData.sleepDuration || 0,
        weight_kg: fitData.weight,
        height_cm: fitData.height ? fitData.height * 100 : undefined, // Converter de metros para cm
        heart_rate_resting: fitData.heartRateZones?.restingHeartRate,
        heart_rate_max: fitData.heartRateZones?.maxHeartRate,
        sync_timestamp: new Date().toISOString(),
        raw_data: {
          heartRateZones: fitData.heartRateZones,
          workouts: fitData.workouts,
          synced_at: new Date().toISOString()
        }
      };

      console.log('💾 Salvando dados no Supabase:', googleFitRecord);
      
      await supabaseClient
        .from('google_fit_data')
        .upsert(googleFitRecord);
    }

    console.log('Dados sincronizados com sucesso:', fitData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: fitData,
        message: 'Dados do Google Fit sincronizados com sucesso'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro na sincronização do Google Fit:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function fetchGoogleFitData(accessToken: string, dateRange: { startDate: string, endDate: string }): Promise<GoogleFitData> {
  const baseUrl = 'https://www.googleapis.com/fitness/v1/users/me';
  
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const startTimeMillis = new Date(dateRange.startDate).getTime();
  const endTimeMillis = new Date(dateRange.endDate).getTime();

  // Função auxiliar para fazer requisições
  const fetchFitnessData = async (dataTypeName: string, dataSourceId?: string) => {
    const body: any = {
      aggregateBy: [{
        dataTypeName,
        ...(dataSourceId && { dataSourceId })
      }],
      bucketByTime: { durationMillis: 86400000 }, // 1 dia
      startTimeMillis,
      endTimeMillis,
    };

    const response = await fetch(`${baseUrl}/dataset:aggregate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return response.json();
  };

  try {
    // Buscar todos os dados em paralelo
    const [
      stepsData,
      caloriesData,
      distanceData,
      heartRateData,
      activeMinutesData,
      weightData,
      heightData,
      sleepData
    ] = await Promise.all([
      // Passos
      fetchFitnessData('com.google.step_count.delta', 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'),
      
      // Calorias
      fetchFitnessData('com.google.calories.expended', 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'),
      
      // Distância
      fetchFitnessData('com.google.distance.delta', 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta'),
      
      // Frequência Cardíaca
      fetchFitnessData('com.google.heart_rate.bpm'),
      
      // Minutos Ativos
      fetchFitnessData('com.google.active_minutes'),
      
      // Peso
      fetchFitnessData('com.google.weight'),
      
      // Altura
      fetchFitnessData('com.google.height'),
      
      // Sono
      fetchFitnessData('com.google.sleep.segment')
    ]);

    console.log('📊 Dados recebidos do Google Fit:', {
      steps: !!stepsData.bucket?.[0]?.dataset?.[0]?.point?.[0],
      calories: !!caloriesData.bucket?.[0]?.dataset?.[0]?.point?.[0],
      distance: !!distanceData.bucket?.[0]?.dataset?.[0]?.point?.[0],
      heartRate: !!heartRateData.bucket?.[0]?.dataset?.[0]?.point?.[0],
      activeMinutes: !!activeMinutesData.bucket?.[0]?.dataset?.[0]?.point?.[0],
      weight: !!weightData.bucket?.[0]?.dataset?.[0]?.point?.[0],
      height: !!heightData.bucket?.[0]?.dataset?.[0]?.point?.[0],
      sleep: !!sleepData.bucket?.[0]?.dataset?.[0]?.point?.[0]
    });

    // Processar dados com fallbacks seguros
    const steps = stepsData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
    const calories = caloriesData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
    const distance = distanceData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
    
    // Frequência cardíaca - pode ter múltiplos pontos, calcular média
    let heartRate = 0;
    const heartRatePoints = heartRateData.bucket?.[0]?.dataset?.[0]?.point || [];
    if (heartRatePoints.length > 0) {
      const totalHeartRate = heartRatePoints.reduce((sum: number, point: any) => 
        sum + (point.value?.[0]?.fpVal || 0), 0);
      heartRate = Math.round(totalHeartRate / heartRatePoints.length);
    }
    
    // Minutos ativos
    const activeMinutes = activeMinutesData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
    
    // Peso (mais recente)
    const weight = weightData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal;
    
    // Altura (mais recente)
    const height = heightData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal;
    
    // Sono - somar duração de todos os segmentos
    let sleepDuration = 0;
    const sleepPoints = sleepData.bucket?.[0]?.dataset?.[0]?.point || [];
    if (sleepPoints.length > 0) {
      sleepDuration = sleepPoints.reduce((total: number, point: any) => {
        const startTime = point.startTimeNanos ? parseInt(point.startTimeNanos) / 1000000 : 0;
        const endTime = point.endTimeNanos ? parseInt(point.endTimeNanos) / 1000000 : 0;
        return total + (endTime - startTime);
      }, 0);
      sleepDuration = Math.round(sleepDuration / (1000 * 60 * 60)); // Converter para horas
    }

    console.log('✅ Dados processados:', {
      steps,
      calories: Math.round(calories),
      distance: Math.round(distance),
      heartRate,
      activeMinutes,
      weight,
      height,
      sleepDuration
    });

    return {
      steps,
      calories: Math.round(calories),
      distance: Math.round(distance),
      heartRate,
      weight,
      height,
      activeMinutes,
      sleepDuration,
      heartRateZones: heartRate > 0 ? {
        averageHeartRate: heartRate,
        restingHeartRate: Math.max(50, heartRate - 20), // Estimativa
        maxHeartRate: Math.min(200, heartRate + 30) // Estimativa
      } : undefined
    };

  } catch (error) {
    console.error('❌ Erro ao buscar dados do Google Fit:', error);
    
    // Retornar dados básicos em caso de erro
    return {
      steps: 0,
      calories: 0,
      distance: 0,
      heartRate: 0,
    };
  }
}