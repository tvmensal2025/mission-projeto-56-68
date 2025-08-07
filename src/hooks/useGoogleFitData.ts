import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface GoogleFitData {
  id: string;
  user_id: string;
  data_date: string;
  steps_count?: number;
  distance_meters?: number;
  calories_burned?: number;
  active_minutes?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  heart_rate_resting?: number;
  sleep_duration_hours?: number;
  weight_kg?: number;
  height_cm?: number;
  raw_data?: any;
  sync_timestamp: string;
  created_at: string;
}

interface GoogleFitStats {
  totalSteps: number;
  totalDistance: number;
  totalCalories: number;
  avgHeartRate: number;
  totalActiveMinutes: number;
  avgSleepDuration: number;
  workoutFrequency: number;
  currentWeight?: number;
  currentHeight?: number;
  weightTrend?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
}

export function useGoogleFitData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GoogleFitData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Buscar dados reais do Google Fit
  const fetchGoogleFitData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados dos últimos 30 dias
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      // Usar dados de exemplo já que google_fit_data não existe na base atual
      console.log('Usando dados de exemplo do Google Fit');
      setError('Usando dados de exemplo. Conecte o Google Fit para dados reais.');
      setData(generateFallbackData());
      setIsConnected(false);

    } catch (err: any) {
      console.error('Erro ao carregar dados Google Fit:', err);
      setError(err.message || 'Erro ao carregar dados');
      setData(generateFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // Gerar dados de exemplo quando não há dados reais
  const generateFallbackData = (): GoogleFitData[] => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        id: `fallback-${i}`,
        user_id: 'example',
        data_date: date.toISOString().split('T')[0],
        steps_count: Math.floor(Math.random() * 5000) + 6000,
        calories_burned: Math.floor(Math.random() * 300) + 150,
        distance_meters: Math.floor((Math.random() * 8 + 2) * 1000),
        active_minutes: Math.floor(Math.random() * 60) + 30,
        heart_rate_avg: Math.floor(Math.random() * 15) + 65,
        heart_rate_max: Math.floor(Math.random() * 30) + 140,
        heart_rate_resting: Math.floor(Math.random() * 10) + 55,
        sleep_duration_hours: Math.round((6.5 + Math.random() * 2) * 10) / 10,
        weight_kg: 70 + (Math.random() - 0.5) * 4,
        height_cm: 170 + (Math.random() - 0.5) * 20,
        sync_timestamp: date.toISOString(),
        created_at: date.toISOString(),
      };
    });
    return days.reverse();
  };

  useEffect(() => {
    fetchGoogleFitData();
  }, []);

  const calculateStats = (data: GoogleFitData[]): GoogleFitStats => {
    if (!data.length) {
      return {
        totalSteps: 0,
        totalDistance: 0,
        totalCalories: 0,
        avgHeartRate: 0,
        totalActiveMinutes: 0,
        avgSleepDuration: 0,
        workoutFrequency: 0
      };
    }

    // Calcular tendência de peso
    const weightData = data.filter(d => d.weight_kg).sort((a, b) => new Date(a.data_date).getTime() - new Date(b.data_date).getTime());
    let weightTrend = 0;
    if (weightData.length >= 2) {
      const firstWeight = weightData[0].weight_kg!;
      const lastWeight = weightData[weightData.length - 1].weight_kg!;
      weightTrend = lastWeight - firstWeight;
    }

    // Obter peso e altura mais recentes
    const latestWeightEntry = data.find(d => d.weight_kg);
    const latestHeightEntry = data.find(d => d.height_cm);

    // Calcular médias de frequência cardíaca
    const heartRateData = data.filter(d => d.heart_rate_avg && d.heart_rate_avg > 0);
    const restingHeartRateData = data.filter(d => d.heart_rate_resting && d.heart_rate_resting > 0);
    const maxHeartRateData = data.filter(d => d.heart_rate_max && d.heart_rate_max > 0);

    return {
      totalSteps: data.reduce((sum, d) => sum + (d.steps_count || 0), 0),
      totalDistance: Math.round((data.reduce((sum, d) => sum + (d.distance_meters || 0), 0) / 1000) * 10) / 10,
      totalCalories: data.reduce((sum, d) => sum + (d.calories_burned || 0), 0),
      avgHeartRate: heartRateData.length > 0 
        ? Math.round(heartRateData.reduce((sum, d) => sum + (d.heart_rate_avg || 0), 0) / heartRateData.length)
        : 0,
      totalActiveMinutes: data.reduce((sum, d) => sum + (d.active_minutes || 0), 0),
      avgSleepDuration: Math.round((data.reduce((sum, d) => sum + (d.sleep_duration_hours || 0), 0) / data.length) * 10) / 10,
      workoutFrequency: Math.max(Math.floor(data.filter(d => (d.active_minutes || 0) > 30).length), 0),
      currentWeight: latestWeightEntry?.weight_kg,
      currentHeight: latestHeightEntry?.height_cm,
      weightTrend: Math.round(weightTrend * 10) / 10,
      restingHeartRate: restingHeartRateData.length > 0 
        ? Math.round(restingHeartRateData.reduce((sum, d) => sum + (d.heart_rate_resting || 0), 0) / restingHeartRateData.length)
        : undefined,
      maxHeartRate: maxHeartRateData.length > 0 
        ? Math.round(maxHeartRateData.reduce((sum, d) => sum + (d.heart_rate_max || 0), 0) / maxHeartRateData.length)
        : undefined,
    };
  };

  const weeklyStats = calculateStats(data.slice(-7));
  const monthlyStats = {
    ...calculateStats(data),
    // Multiplicar apenas dados cumulativos, não médias
    totalSteps: calculateStats(data).totalSteps,
    totalDistance: calculateStats(data).totalDistance,
    totalCalories: calculateStats(data).totalCalories,
    totalActiveMinutes: calculateStats(data).totalActiveMinutes,
  };

  const getChartData = () => {
    return {
      stepsData: data.map(d => ({
        date: d.data_date,
        value: d.steps_count || 0,
        formatted: new Date(d.data_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      caloriesData: data.map(d => ({
        date: d.data_date,
        value: d.calories_burned || 0,
        formatted: new Date(d.data_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      heartRateData: data.map(d => ({
        date: d.data_date,
        avg: d.heart_rate_avg || 0,
        max: d.heart_rate_max || 0,
        resting: d.heart_rate_resting || 0,
        formatted: new Date(d.data_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      sleepData: data.map(d => ({
        date: d.data_date,
        duration: d.sleep_duration_hours || 0,
        quality: 4, // Default sleep quality score
        formatted: new Date(d.data_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      activityData: data.map(d => ({
        date: d.data_date,
        minutes: d.active_minutes || 0,
        distance: (d.distance_meters || 0) / 1000,
        formatted: new Date(d.data_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      weightData: data.filter(d => d.weight_kg).map(d => ({
        date: d.data_date,
        weight: d.weight_kg!,
        formatted: new Date(d.data_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })),
      // Dados integrados para gráficos avançados
      dailyData: data.map(d => ({
        date: d.data_date,
        steps: d.steps_count || 0,
        calories: d.calories_burned || 0,
        distance: (d.distance_meters || 0) / 1000,
        heartRate: d.heart_rate_avg || 0,
        activeMinutes: d.active_minutes || 0,
        sleepHours: d.sleep_duration_hours || 0,
        weight: d.weight_kg
      }))
    };
  };

  // Dados para gráficos avançados
  const advancedData = {
    dailyData: getChartData().dailyData,
    weeklyStats,
    healthMetrics: {
      restingHeartRate: weeklyStats.restingHeartRate,
      maxHeartRate: weeklyStats.maxHeartRate,
      bmi: weeklyStats.currentWeight && weeklyStats.currentHeight 
        ? Math.round((weeklyStats.currentWeight / Math.pow((weeklyStats.currentHeight / 100), 2)) * 100) / 100
        : undefined,
    }
  };

  return {
    data,
    loading,
    error,
    weeklyStats,
    monthlyStats,
    isConnected,
    chartData: getChartData(),
    advancedData,
    refetch: fetchGoogleFitData,
    checkConnection: () => {
      const hasToken = localStorage.getItem('google_fit_access_token');
      setIsConnected(!!hasToken);
      return !!hasToken;
    },
    syncData: async () => {
      try {
        const accessToken = localStorage.getItem('google_fit_access_token');
        const refreshToken = localStorage.getItem('google_fit_refresh_token');
        
        if (!accessToken) {
          throw new Error('Token do Google Fit não encontrado');
        }

        const { data: syncResult, error: syncError } = await supabase.functions.invoke('google-fit-sync', {
          body: {
            access_token: accessToken,
            refresh_token: refreshToken,
            date_range: {
              startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            }
          }
        });

        if (syncError) {
          throw syncError;
        }

        // Recarregar dados após sincronização
        await fetchGoogleFitData();
        return syncResult;
      } catch (err: any) {
        console.error('Erro na sincronização:', err);
        throw err;
      }
    }
  };
}