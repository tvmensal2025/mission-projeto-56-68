import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GoogleFitData {
  steps: number;
  caloriesActive: number; // ativas
  distance: number;
  heartRateAvg: number;
  heartRateMin?: number;
  heartRateMax?: number;
  heartMinutes?: number;
  sleepDuration?: number; // horas
  weight?: number;
  height?: number;
}

// Estrutura diária para gravar 1 linha por dia no banco
interface DailyFitData {
  date: string; // YYYY-MM-DD (local America/Sao_Paulo)
  steps: number;
  caloriesActive: number;
  distance: number;
  heartRateAvg: number;
  heartRateMin?: number;
  heartRateMax?: number;
  heartMinutes?: number;
  weight?: number;
  height?: number;
  sleepDuration?: number;
}

const TIMEZONE_ID = 'America/Sao_Paulo';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabaseClient.auth.getUser(token);
    if (!user.user) throw new Error('Unauthorized');

    const { access_token, refresh_token, date_range } = await req.json();

    const dailyData = await fetchGoogleFitDaily(access_token, date_range);

    for (const d of dailyData) {
      const googleFitRecord: any = {
        user_id: user.user.id,
        data_date: d.date,
        steps_count: d.steps,
        calories_burned: Math.max(0, Math.round(d.caloriesActive || 0)),
        distance_meters: Math.round(d.distance || 0),
        heart_rate_avg: Math.round(d.heartRateAvg || 0),
        heart_rate_resting: d.heartRateMin ?? null,
        heart_rate_max: d.heartRateMax ?? null,
        active_minutes: Math.round(d.heartMinutes || 0), // coluna existente reaproveitada p/ heart minutes
        sleep_duration_hours: d.sleepDuration || 0,
        weight_kg: d.weight,
        height_cm: d.height ? Math.round(d.height * 100) : undefined,
        sync_timestamp: new Date().toISOString(),
      };

      await supabaseClient.from('google_fit_data').upsert(googleFitRecord, { onConflict: 'user_id,data_date' });
    }

    return new Response(
      JSON.stringify({ success: true, days: dailyData.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na sincronização do Google Fit:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message, success: false }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function toLocalDateString(ms: number, timeZone = TIMEZONE_ID): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  // en-CA gives YYYY-MM-DD
  const [{ value: y }, , { value: m }, , { value: d }] = fmt.formatToParts(new Date(ms));
  return `${y}-${m}-${d}`;
}

async function fetchGoogleFitDaily(accessToken: string, dateRange: { startDate: string, endDate: string }): Promise<DailyFitData[]> {
  const baseUrl = 'https://www.googleapis.com/fitness/v1/users/me';
  const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  // Construir janelas em milissegundos a partir de datas locais (00:00 do TZ local)
  const startLocal = new Date(`${dateRange.startDate}T00:00:00`);
  const endLocal = new Date(`${dateRange.endDate}T23:59:59`);
  const startTimeMillis = startLocal.getTime();
  const endTimeMillis = endLocal.getTime();

  const fetchAggregate = async (dataTypeName: string, dataSourceId?: string, bucket: any = { period: { type: 'day', value: 1, timeZoneId: TIMEZONE_ID } }) => {
    const body: any = {
      aggregateBy: [{ dataTypeName, ...(dataSourceId && { dataSourceId }) }],
      bucketByTime: bucket,
      startTimeMillis,
      endTimeMillis,
    };
    const resp = await fetch(`${baseUrl}/dataset:aggregate`, { method: 'POST', headers, body: JSON.stringify(body) });
    return resp.json();
  };

  try {
    const [
      stepsData,
      caloriesExpendedData,
      distanceData,
      heartRateData,
      heartMinutesData,
      weightData,
      heightData,
      sleepData,
      bmrData
    ] = await Promise.all([
      fetchAggregate('com.google.step_count.delta', 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'),
      fetchAggregate('com.google.calories.expended', 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'),
      fetchAggregate('com.google.distance.delta', 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta'),
      fetchAggregate('com.google.heart_rate.bpm', 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm'),
      fetchAggregate('com.google.heart_minutes', 'derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes'),
      fetchAggregate('com.google.weight'),
      fetchAggregate('com.google.height'),
      fetchAggregate('com.google.sleep.segment'),
      fetchAggregate('com.google.basal_metabolic_rate')
    ]);

    const buckets = Math.max(
      stepsData.bucket?.length || 0,
      caloriesExpendedData.bucket?.length || 0,
      distanceData.bucket?.length || 0,
      heartRateData.bucket?.length || 0,
      heartMinutesData.bucket?.length || 0,
      sleepData.bucket?.length || 0,
      weightData.bucket?.length || 0,
      heightData.bucket?.length || 0,
      bmrData.bucket?.length || 0,
    );

    const days: DailyFitData[] = [];

    for (let i = 0; i < buckets; i++) {
      const startMs = parseInt(
        stepsData.bucket?.[i]?.startTimeMillis ||
        caloriesExpendedData.bucket?.[i]?.startTimeMillis ||
        distanceData.bucket?.[i]?.startTimeMillis ||
        heartRateData.bucket?.[i]?.startTimeMillis ||
        heartMinutesData.bucket?.[i]?.startTimeMillis ||
        sleepData.bucket?.[i]?.startTimeMillis ||
        `${Date.now()}`
      );
      const localDate = toLocalDateString(startMs, TIMEZONE_ID);

      const getPoints = (data: any) => data.bucket?.[i]?.dataset?.[0]?.point || [];

      const steps = getPoints(stepsData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.intVal || 0), 0);
      const caloriesTotal = getPoints(caloriesExpendedData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);
      // BMR diário (kcal/dia). Usar média do dia ou último ponto do dia
      let basalKcal = 0;
      const bmrPts = getPoints(bmrData);
      if (bmrPts.length) {
        const avgBmr = bmrPts.reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0) / bmrPts.length;
        basalKcal = isFinite(avgBmr) ? avgBmr : 0;
      }
      const caloriesActive = Math.max(0, caloriesTotal - basalKcal);

      const distance = getPoints(distanceData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);

      // HR min/avg/max
      const hrPts = getPoints(heartRateData).map((p: any) => p.value?.[0]?.fpVal || 0).filter((v: number) => v > 0);
      const heartRateAvg = hrPts.length ? Math.round(hrPts.reduce((a: number, b: number) => a + b, 0) / hrPts.length) : 0;
      const heartRateMin = hrPts.length ? Math.min(...hrPts) : undefined;
      const heartRateMax = hrPts.length ? Math.max(...hrPts) : undefined;

      // heart minutes (minutos de intensidade)
      const heartMinutes = getPoints(heartMinutesData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);

      // Peso/altura últimos do dia
      const wPts = getPoints(weightData);
      const hPts = getPoints(heightData);
      const weight = wPts.length ? wPts[wPts.length - 1]?.value?.[0]?.fpVal : undefined;
      const height = hPts.length ? hPts[hPts.length - 1]?.value?.[0]?.fpVal : undefined;

      // Sono: somar segmentos do bucket (já em dia local por period TZ)
      let sleepDuration = 0;
      const sPts = getPoints(sleepData);
      for (const p of sPts) {
        const start = p.startTimeNanos ? parseInt(p.startTimeNanos) / 1_000_000 : 0;
        const end = p.endTimeNanos ? parseInt(p.endTimeNanos) / 1_000_000 : 0;
        sleepDuration += Math.max(0, end - start);
      }
      sleepDuration = Math.round(sleepDuration / (1000 * 60 * 60));

      days.push({
        date: localDate,
        steps,
        caloriesActive,
        distance,
        heartRateAvg,
        heartRateMin,
        heartRateMax,
        heartMinutes,
        weight,
        height,
        sleepDuration,
      });
    }

    return days;
  } catch (e) {
    console.error('Erro ao agregar por dia:', e);
    return [];
  }
}