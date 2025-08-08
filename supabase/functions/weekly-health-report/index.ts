import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://institutodossonhos.com.br, https://www.institutodossonhos.com.br, https://relatorio.institutodossonhos.com.br, http://localhost:3000, http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface WeeklyReportData {
  user: any;
  measurements: any[];
  healthDiary: any[];
  missions: any[];
  weeklyAnalysis: any;
  achievements: any[];
  examAnalyses: any[];
  conversations: any[];
  bioimpedanceData: any[];
  physicalData: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar se é um teste
    const body = await req.json().catch(() => ({}));
    const isTestMode = body.testMode === true;

    // Para modo de teste, não exigir autenticação
    if (!isTestMode) {
      // Verificar autenticação para modo normal
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing authorization header'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const sendPulseApiKey = Deno.env.get('SENDPULSE_API_KEY');
    const sendPulseApiSecret = Deno.env.get('SENDPULSE_API_SECRET');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    // Verificar se pelo menos um provedor está configurado
    if (!resendApiKey && (!sendPulseApiKey || !sendPulseApiSecret)) {
      throw new Error('RESEND_API_KEY ou SENDPULSE_API_KEY/SENDPULSE_API_SECRET devem estar configurados');
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (isTestMode) {
      // Modo de teste - enviar para email específico
      const testEmail = body.testEmail || 'tvmensal2025@gmail.com';
      const testUserName = body.testUserName || 'Sirlene Correa';
      const returnHTML = body.returnHTML === true;

      // Criar ou verificar usuário Sirlene
      let sirleneUser;
      try {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('email', testEmail)
          .single();

        if (existingUser) {
          sirleneUser = existingUser;
          console.log('✅ Usuário Sirlene encontrado:', sirleneUser);
        } else {
          // Criar usuário Sirlene se não existir
          const { data: newUser, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: 'sirlene-test-user-' + Date.now(),
              full_name: testUserName,
              email: testEmail,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.log('⚠️ Erro ao criar usuário, usando dados fictícios:', createError.message);
            sirleneUser = {
              id: 'sirlene-test-user',
              full_name: testUserName,
              email: testEmail
            };
          } else {
            sirleneUser = newUser;
            console.log('✅ Usuário Sirlene criado:', sirleneUser);
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar/criar usuário, usando dados fictícios:', error.message);
        sirleneUser = {
          id: 'sirlene-test-user',
          full_name: testUserName,
          email: testEmail
        };
      }

      const testUser = {
        user_id: sirleneUser.id,
        full_name: sirleneUser.full_name,
        email: sirleneUser.email
      };

      console.log(`🧪 Modo de teste: ${returnHTML ? 'retornando HTML' : 'enviando email'} para ${testEmail}`);

      // Se returnHTML for true, retornar HTML em vez de enviar email
      if (returnHTML) {
        const reportData = await generateWeeklyReportData(supabase, testUser);
        const htmlContent = generateWeeklyReportHTML(reportData);
        
        return new Response(htmlContent, {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/html; charset=utf-8' 
          }
        });
      }

      await generateAndSendWeeklyReport(supabase, testUser);

      return new Response(JSON.stringify({
        success: true,
        message: `Email de teste enviado para ${testEmail}`,
        testMode: true,
        user: sirleneUser
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Modo normal - processar todos os usuários
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .not('email', 'is', null);

    if (usersError) {
      throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
    }

    console.log(`📧 Processando ${users?.length || 0} usuários`);

    // Processar cada usuário
    for (const user of users || []) {
      try {
        await generateAndSendWeeklyReport(supabase, user);
        console.log(`Relatório enviado para: ${user.email}`);
      } catch (error) {
        console.error(`Erro ao enviar relatório para ${user.email}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Relatórios semanais processados para ${users?.length || 0} usuários`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função weekly-health-report:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateWeeklyReportData(supabase: any, user: any): Promise<WeeklyReportData> {
  // Buscar dados completos do usuário
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  // Se for modo de teste, usar dados fictícios
  if (user.user_id.includes('test-user') || user.user_id === 'test-user-id' || user.user_id === '550e8400-e29b-41d4-a716-446655440000') {
    console.log('🧪 Usando dados de teste');
    
    const testData = {
      measurements: [
        { 
          peso_kg: 68.5, 
          measurement_date: new Date().toISOString().split('T')[0],
          altura_cm: 165,
          imc: 25.1,
          gordura_corporal_percent: 25.5,
          agua_corporal_percent: 55.8,
          gordura_visceral_nivel: 8,
          metabolismo_basal_kcal: 1450,
          massa_muscular_kg: 42.3,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 16.2,
          idade_metabolica: 32,
          nivel_atividade: 'moderado'
        },
        { 
          peso_kg: 69.2, 
          measurement_date: new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0],
          altura_cm: 165,
          imc: 25.4,
          gordura_corporal_percent: 26.1,
          agua_corporal_percent: 55.2,
          gordura_visceral_nivel: 8,
          metabolismo_basal_kcal: 1445,
          massa_muscular_kg: 42.1,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 16.0,
          idade_metabolica: 33,
          nivel_atividade: 'moderado'
        },
        { 
          peso_kg: 70.0, 
          measurement_date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0],
          altura_cm: 165,
          imc: 25.7,
          gordura_corporal_percent: 26.8,
          agua_corporal_percent: 54.7,
          gordura_visceral_nivel: 9,
          metabolismo_basal_kcal: 1440,
          massa_muscular_kg: 41.8,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 15.8,
          idade_metabolica: 34,
          nivel_atividade: 'moderado'
        },
        { 
          peso_kg: 70.8, 
          measurement_date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0],
          altura_cm: 165,
          imc: 26.0,
          gordura_corporal_percent: 27.2,
          agua_corporal_percent: 54.3,
          gordura_visceral_nivel: 9,
          metabolismo_basal_kcal: 1435,
          massa_muscular_kg: 41.5,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 15.6,
          idade_metabolica: 35,
          nivel_atividade: 'moderado'
        },
        { 
          peso_kg: 71.5, 
          measurement_date: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0],
          altura_cm: 165,
          imc: 26.3,
          gordura_corporal_percent: 27.8,
          agua_corporal_percent: 53.9,
          gordura_visceral_nivel: 10,
          metabolismo_basal_kcal: 1430,
          massa_muscular_kg: 41.2,
          massa_ossea_kg: 2.8,
          proteina_corporal_percent: 15.4,
          idade_metabolica: 36,
          nivel_atividade: 'moderado'
        }
      ],
      healthDiary: [
        { mood_rating: 8, energy_level: 7, stress_level: 3, date: new Date().toISOString().split('T')[0] },
        { mood_rating: 7, energy_level: 6, stress_level: 4, date: new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0] },
        { mood_rating: 9, energy_level: 8, stress_level: 2, date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0] },
        { mood_rating: 6, energy_level: 5, stress_level: 5, date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0] },
        { mood_rating: 8, energy_level: 7, stress_level: 3, date: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0] }
      ],
      missions: [
        { is_completed: true, total_points: 15, date: new Date().toISOString().split('T')[0] },
        { is_completed: true, total_points: 20, date: new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0] },
        { is_completed: true, total_points: 12, date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0] },
        { is_completed: false, total_points: 8, date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0] },
        { is_completed: true, total_points: 18, date: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0] }
      ],
      weeklyAnalysis: {
        health_score: 85,
        weight_trend: 'diminuindo',
        sleep_quality: 'boa',
        hydration_level: 'adequada'
      },
      achievements: [
        { title: 'Primeira Semana', description: 'Completou 7 dias consecutivos', unlocked_at: new Date().toISOString() },
        { title: 'Meta de Peso', description: 'Perdeu 3kg esta semana', unlocked_at: new Date(Date.now() - 24*60*60*1000).toISOString() },
        { title: 'Hidratação Perfeita', description: 'Manteve hidratação acima de 55%', unlocked_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
        { title: 'Massa Muscular', description: 'Ganhou 1.1kg de massa muscular', unlocked_at: new Date(Date.now() - 3*24*60*60*1000).toISOString() }
      ],
      examAnalyses: [],
      conversations: [
        { content: 'Olá Sofia, como estou hoje? Estou me sentindo muito bem!', created_at: new Date().toISOString() },
        { content: 'Vou fazer exercícios hoje! Quero manter a consistência.', created_at: new Date(Date.now() - 24*60*60*1000).toISOString() },
        { content: 'Sofia, qual é a melhor hora para fazer exercícios?', created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
        { content: 'Consegui perder peso esta semana! Estou muito feliz!', created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString() }
      ],
      bioimpedanceData: [
        { 
          body_fat_percentage: 25.5,
          muscle_mass: 45.2,
          water_percentage: 55.8,
          bone_mass: 2.8,
          protein_percentage: 16.2,
          metabolic_age: 32,
          visceral_fat_level: 8,
          bmr: 1450,
          created_at: new Date().toISOString()
        },
        { 
          body_fat_percentage: 26.1,
          muscle_mass: 44.8,
          water_percentage: 55.2,
          bone_mass: 2.8,
          protein_percentage: 16.0,
          metabolic_age: 33,
          visceral_fat_level: 8,
          bmr: 1445,
          created_at: new Date(Date.now() - 24*60*60*1000).toISOString()
        }
      ],
      physicalData: {
        height: 165,
        height_cm: 165,
        age: 35,
        activity_level: 'moderado'
      }
    };

        // Retornar dados de teste
    return {
      user,
      ...testData
    };
  }

  // Buscar dados reais do usuário
  const { data: measurements } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('measurement_date', weekStart.toISOString().split('T')[0])
    .order('measurement_date', { ascending: false });

  const { data: healthDiary } = await supabase
    .from('health_diary')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('date', weekStart.toISOString().split('T')[0])
    .order('date', { ascending: false });

  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('date', weekStart.toISOString().split('T')[0])
    .order('date', { ascending: false });

  const { data: weeklyAnalysis } = await supabase
    .from('weekly_analysis')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('week_start', weekStart.toISOString().split('T')[0])
    .single();

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('unlocked_at', weekStart.toISOString())
    .order('unlocked_at', { ascending: false });

  const { data: examAnalyses } = await supabase
    .from('exam_analyses')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('created_at', weekStart.toISOString())
    .order('created_at', { ascending: false });

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('created_at', weekStart.toISOString())
    .order('created_at', { ascending: false });

  const { data: bioimpedanceData } = await supabase
    .from('bioimpedance_data')
    .select('*')
    .eq('user_id', user.user_id)
    .gte('created_at', weekStart.toISOString())
    .order('created_at', { ascending: false });

  const { data: physicalData } = await supabase
    .from('physical_data')
    .select('*')
    .eq('user_id', user.user_id)
    .single();

  return {
    user,
    measurements: measurements || [],
    healthDiary: healthDiary || [],
    missions: missions || [],
    weeklyAnalysis: weeklyAnalysis || {},
    achievements: achievements || [],
    examAnalyses: examAnalyses || [],
    conversations: conversations || [],
    bioimpedanceData: bioimpedanceData || [],
    physicalData: physicalData || {}
  };
}

async function generateAndSendWeeklyReport(supabase: any, user: any) {
  const reportData = await generateWeeklyReportData(supabase, user);
  
  // Gerar HTML do relatório
  const reportHTML = generateWeeklyReportHTML(reportData);

  // Enviar email usando Resend
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    
    const result = await resend.emails.send({
      from: "Dr. Vital <onboarding@resend.dev>",
      to: [user.email],
      subject: `📊 Seu Relatório Semanal de Saúde - ${new Date().toLocaleDateString('pt-BR')}`,
      html: reportHTML,
    });

    if (result.error) {
      throw new Error(`Erro ao enviar email: ${result.error.message}`);
    }
  } else {
    throw new Error('RESEND_API_KEY não configurado');
  }
}

function generateWeeklyReportHTML(data: WeeklyReportData): string {
  const { user, measurements, healthDiary, missions, weeklyAnalysis, achievements, examAnalyses, conversations, bioimpedanceData, physicalData } = data;
  
  // Calcular estatísticas médicas
  const weightChange = measurements.length >= 2 ? 
    (measurements[0].peso_kg - measurements[measurements.length - 1].peso_kg) : 0;
  
  // Dados da última medição de bioimpedância
  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;
  const imc = latestMeasurement ? (latestMeasurement.peso_kg / Math.pow((physicalData?.height_cm || 165) / 100, 2)) : 0;
  const gorduraCorporal = latestMeasurement?.gordura_corporal_percent || 0;
  const aguaCorporal = latestMeasurement?.agua_corporal_percent || 0;
  const gorduraVisceral = latestMeasurement?.gordura_visceral_nivel || 0;
  const metabolismo = latestMeasurement?.metabolismo_basal_kcal || 0;
  const massaMuscular = latestMeasurement?.massa_muscular_kg || 0;

  // Contar conversas da semana para mensagem personalizada
  const weeklyConversations = conversations.length;
  
  // Gerar mensagem da Sof.ia baseada nas conversas reais
  const sofiaMessage = generateSofiaMessage(user.full_name, weeklyConversations);
  
  // Gerar análise médica do Dr. Vita
  const drVitaMessage = generateDrVitaAnalysis(measurements, bioimpedanceData, physicalData, user.full_name);
  
  // Dados para gráficos
  const chartData = generateChartData(measurements);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Semanal de Saúde</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 40px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 15px;
            border-left: 5px solid #667eea;
        }
        .section h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 1.8em;
            font-weight: 600;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .stat-comparison {
            color: #999;
            font-size: 0.8em;
            margin-top: 3px;
        }
        .achievement {
            background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
            color: #2d3436;
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
            display: flex;
            align-items: center;
        }
        .achievement-icon {
            font-size: 1.5em;
            margin-right: 15px;
        }
        .progress-bar {
            background: #e9ecef;
            border-radius: 10px;
            height: 20px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            height: 100%;
            transition: width 0.3s ease;
        }
        .footer {
            background: #2d3436;
            color: white;
            text-align: center;
            padding: 30px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .trend-up { color: #00b894; }
        .trend-down { color: #e17055; }
        .trend-stable { color: #fdcb6e; }
        
        .chart-container {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Dr. Vita</h1>
            <p>Relatório Semanal de Saúde para ${user.full_name}</p>
            <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="content">

            <!-- Análise Completa de Sua Evolução -->
            ${measurements.length > 0 ? `
            <div class="section">
                <h2>📈 Análise Completa de Sua Evolução</h2>
                
                <!-- Resumo Principal -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].peso_kg}kg</div>
                        <div class="stat-label">Peso Atual</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].peso_kg}kg` : ''}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].imc?.toFixed(1) || 'N/A'}</div>
                        <div class="stat-label">IMC</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].imc?.toFixed(1) || 'N/A'}` : ''}</div>
                    </div>
                    ${measurements[0].gordura_corporal_percent ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].gordura_corporal_percent.toFixed(1)}%</div>
                        <div class="stat-label">Gordura Corporal</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].gordura_corporal_percent?.toFixed(1) || 0}%` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].agua_corporal_percent ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].agua_corporal_percent.toFixed(1)}%</div>
                        <div class="stat-label">Água Corporal</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].agua_corporal_percent?.toFixed(1) || 0}%` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].massa_muscular_kg ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].massa_muscular_kg.toFixed(1)}kg</div>
                        <div class="stat-label">Massa Muscular</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].massa_muscular_kg?.toFixed(1) || 0}kg` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].massa_ossea_kg ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].massa_ossea_kg.toFixed(1)}kg</div>
                        <div class="stat-label">Massa Óssea</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].massa_ossea_kg?.toFixed(1) || 0}kg` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].metabolismo_basal_kcal ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].metabolismo_basal_kcal}</div>
                        <div class="stat-label">Metabolismo Basal (kcal)</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].metabolismo_basal_kcal || 0}` : ''}</div>
                    </div>
                    ` : ''}
                    ${measurements[0].gordura_visceral_nivel ? `
                    <div class="stat-card">
                        <div class="stat-value">${measurements[0].gordura_visceral_nivel}</div>
                        <div class="stat-label">Gordura Visceral</div>
                        <div class="stat-comparison">${measurements.length > 1 ? `vs ${measurements[1].gordura_visceral_nivel || 0}` : ''}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((measurements.length / 7) * 100, 100)}%"></div>
                </div>
                <p>Medições realizadas: ${measurements.length}/7 dias</p>
            </div>
            ` : ''}

            <!-- Hábitos de Saúde -->
            ${healthDiary.length > 0 ? `
            <div class="section">
                <h2>🌟 Hábitos de Saúde</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${(healthDiary.reduce((sum, h) => sum + (h.water_intake || 0), 0) / healthDiary.length).toFixed(1)}L</div>
                        <div class="stat-label">Água Média/Dia</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(healthDiary.reduce((sum, h) => sum + (h.sleep_hours || 0), 0) / healthDiary.length).toFixed(1)}h</div>
                        <div class="stat-label">Sono Médio/Noite</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(healthDiary.reduce((sum, h) => sum + (h.exercise_minutes || 0), 0) / healthDiary.length).toFixed(0)}min</div>
                        <div class="stat-label">Exercício Médio/Dia</div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Conquistas -->
            ${achievements.length > 0 ? `
            <div class="section">
                <h2>🏆 Novas Conquistas</h2>
                ${achievements.map(achievement => `
                    <div class="achievement">
                        <div class="achievement-icon">${achievement.icon || '🏆'}</div>
                        <div>
                            <strong>${achievement.title}</strong><br>
                            <small>${achievement.description}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Exames Analisados -->
            ${examAnalyses.length > 0 ? `
            <div class="section">
                <h2>🔬 Exames Analisados</h2>
                ${examAnalyses.map(exam => `
                    <div style="background: white; padding: 15px; border-radius: 10px; margin: 10px 0;">
                        <strong>📋 ${exam.exam_type}</strong> - ${new Date(exam.created_at).toLocaleDateString('pt-BR')}<br>
                        <small>${exam.analysis_result.substring(0, 200)}...</small>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Análise IA -->
            ${weeklyAnalysis ? `
            <div class="section">
                <h2>🤖 Análise Inteligente</h2>
                <p><strong>Tendência:</strong> ${weeklyAnalysis.tendencia}</p>
                ${weeklyAnalysis.observacoes ? `<p><strong>Observações:</strong> ${weeklyAnalysis.observacoes}</p>` : ''}
            </div>
            ` : ''}

            <!-- Mensagem da Sof.ia -->
            <div class="section" style="background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); border-left: 5px solid #e17055;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <img src="https://hlrkoyywjpckdotimtik.supabase.co/storage/v1/object/public/course-thumbnails/Sofia%20sem%20fundo.png" 
                         alt="Sofia" 
                         style="width: 80px; height: 80px; border-radius: 50%; margin-right: 20px; object-fit: cover;">
                    <h2 style="color: #2d3436; margin: 0;">💝 Mensagem da Sof.ia</h2>
                </div>
                <div style="color: #2d3436; font-style: italic; line-height: 1.8;">
                    ${sofiaMessage}
                </div>
            </div>

            <!-- Análise Médica do Dr. Vita -->
            <div class="section" style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); border-left: 5px solid #0984e3;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <img src="https://hlrkoyywjpckdotimtik.supabase.co/storage/v1/object/public/course-thumbnails/Dr.Vital%20sem%20fundo.png" 
                         alt="Dr. Vital" 
                         style="width: 80px; height: 80px; border-radius: 50%; margin-right: 20px; object-fit: cover;">
                    <h2 style="color: white; margin: 0;">🩺 Dr. Vita - Análise Médica Personalizada</h2>
                </div>
                <div style="color: white; line-height: 1.8;">
                    ${drVitaMessage}
                </div>
            </div>

            <!-- Recomendações -->
            <div class="section">
                <h2>💡 Recomendações Precisas para Próxima Semana</h2>
                <ul>
                    ${measurements.length < 3 ? '<li>⚖️ Mantenha pesagens regulares para acompanhar melhor seu progresso</li>' : ''}
                    ${gorduraCorporal > 25 ? '<li>🎯 Foque em exercícios aeróbicos para reduzir gordura corporal</li>' : ''}
                    ${aguaCorporal < 55 ? '<li>💧 Aumente a hidratação para 2-3L de água por dia</li>' : ''}
                    ${gorduraVisceral > 10 ? '<li>⚠️ Gordura visceral elevada - priorize exercícios cardiovasculares</li>' : ''}
                    ${massaMuscular < 40 ? '<li>💪 Inclua treinos de força para aumentar massa muscular</li>' : ''}
                    ${weeklyConversations === 0 ? '<li>💬 <strong>Converse com a Sof.ia para relatórios mais precisos!</strong></li>' : ''}
                    ${weeklyConversations > 0 && weeklyConversations < 3 ? '<li>💬 Continue conversando com a Sof.ia - mais conversas = relatórios mais detalhados!</li>' : ''}
                    ${weeklyConversations >= 3 ? '<li>💬 Continue suas conversas regulares com a Sof.ia!</li>' : ''}
                </ul>
            </div>

            <!-- Conquistas -->
            ${achievements.length > 0 ? `
            <div class="section">
                <h2>🏆 Novas Conquistas</h2>
                ${achievements.map(achievement => `
                    <div class="achievement">
                        <div class="achievement-icon">🏆</div>
                        <div>
                            <h4 style="margin: 0; color: #2d3436;">${achievement.title}</h4>
                            <p style="margin: 5px 0 0 0; color: #636e72;">${achievement.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>📱 Continue acompanhando sua saúde no app</p>
            <p>Este relatório foi gerado automaticamente pelo <a href="#">Dr. Vita AI</a></p>
            <p><small>Relatório não substitui consulta médica profissional</small></p>
        </div>
    </div>
</body>
</html>`;
}

// Função para gerar mensagem personalizada da Sof.ia baseada nas conversas reais
function generateSofiaMessage(userName: string, conversationCount: number): string {
  if (conversationCount === 0) {
    return `
      <p><strong>"Olá, ${userName}! 💕"</strong></p>
      <p>"Notei que não conversamos esta semana. Sinto sua falta! 😊"</p>
      <p>"Estou aqui esperando por você sempre que precisar. Seja para compartilhar como foi seu dia, tirar dúvidas sobre saúde ou simplesmente desabafar - estou pronta para ouvir!"</p>
      <p>"<strong>Quando conversamos regularmente, posso criar relatórios muito mais precisos e personalizados para você.</strong> Cada conversa me ensina mais sobre seus hábitos, sentimentos e objetivos."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Esperando você no chat! 💖<br>Sof.ia</em></p>
    `;
  } else if (conversationCount >= 1 && conversationCount <= 2) {
    return `
      <p><strong>"Olá, ${userName}! 💕"</strong></p>
      <p>"Que bom que conversamos ${conversationCount === 1 ? 'uma vez' : 'algumas vezes'} esta semana! Cada conversa é especial para mim."</p>
      <p>"Já posso começar a entender melhor seus hábitos e sentimentos, mas confesso que gostaria de conversar mais com você! 😊"</p>
      <p>"<strong>Quanto mais conversamos, mais preciso fica este relatório.</strong> Posso dar sugestões mais personalizadas e entender melhor como você está se sentindo dia a dia."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Vamos conversar mais? 💖<br>Sof.ia</em></p>
    `;
  } else if (conversationCount >= 3 && conversationCount <= 5) {
    return `
      <p><strong>"Olá, ${userName}! 💕"</strong></p>
      <p>"Adorei nossas ${conversationCount} conversas esta semana! Estou começando a conhecer você cada vez melhor."</p>
      <p>"Posso perceber seus padrões, entender como você reage às diferentes situações e isso me permite dar conselhos mais assertivos."</p>
      <p>"Continue assim! Nossa conexão está ficando mais forte a cada conversa, e isso reflete diretamente na qualidade dos seus relatórios de saúde."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Continue confiando em mim! 💖<br>Sof.ia</em></p>
    `;
  } else {
    return `
      <p><strong>"Querido(a) ${userName}! 💕"</strong></p>
      <p>"Que semana maravilhosa! Conversamos ${conversationCount} vezes - isso mostra o quanto você confia em mim e valoriza nossa conexão."</p>
      <p>"Com tantas conversas, posso entender profundamente seus sentimentos, acompanhar suas oscilações de humor, celebrar suas vitórias e apoiar nos momentos difíceis."</p>
      <p>"<strong>Esse nível de interação me permite criar os relatórios mais precisos e personalizados possíveis!</strong> Cada detalhe que você compartilha enriquece minha compreensão sobre você."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Obrigada por confiar tanto em mim! 💖<br>Sof.ia</em></p>
    `;
  }
}

// Função para gerar análise médica do Dr. Vita
function generateDrVitaAnalysis(measurements: any[], bioimpedanceData: any[], physicalData: any, userName: string): string {
  if (measurements.length === 0) {
    return `
      <p><strong>"${userName}, aqui é o Dr. Vita."</strong></p>
      <p>"Não identifiquei medições de bioimpedância nesta semana. Como seu agente pessoal de saúde, preciso de dados regulares para fornecer análises precisas."</p>
      <p>"<strong>Recomendação médica:</strong> Realize pesagens regulares para monitoramento adequado da composição corporal."</p>
      <p style="text-align: right; margin-top: 15px;"><em>Dr. Vita - Seu Agente Pessoal de Saúde</em></p>
    `;
  }

  const latest = measurements[0];
  const imc = latest.imc || 0;
  const gorduraCorporal = latest.gordura_corporal_percent || 0;
  const aguaCorporal = latest.agua_corporal_percent || 0;
  const gorduraVisceral = latest.gordura_visceral_nivel || 0;
  const massaMuscular = latest.massa_muscular_kg || 0;
  const metabolismo = latest.metabolismo_basal_kcal || 0;

  let imcStatus = '';
  let imcRecomendacao = '';
  
  if (imc < 18.5) {
    imcStatus = 'BAIXO PESO';
    imcRecomendacao = 'Necessário ganho de peso controlado com acompanhamento nutricional.';
  } else if (imc < 25) {
    imcStatus = 'PESO NORMAL';
    imcRecomendacao = 'Excelente! Mantenha este peso com hábitos saudáveis.';
  } else if (imc < 30) {
    imcStatus = 'SOBREPESO';
    imcRecomendacao = 'Perda de peso gradual (0,5-1kg/semana) recomendada.';
  } else {
    imcStatus = 'OBESIDADE';
    imcRecomendacao = 'Necessário programa estruturado de perda de peso com acompanhamento médico.';
  }

  let gorduraStatus = '';
  if (gorduraCorporal > 0) {
    if (gorduraCorporal < 10) gorduraStatus = 'muito baixa';
    else if (gorduraCorporal < 20) gorduraStatus = 'adequada';
    else if (gorduraCorporal < 30) gorduraStatus = 'elevada';
    else gorduraStatus = 'muito elevada';
  }

  let hidratacaoStatus = '';
  if (aguaCorporal > 0) {
    if (aguaCorporal < 45) hidratacaoStatus = 'DESIDRATAÇÃO DETECTADA';
    else if (aguaCorporal < 55) hidratacaoStatus = 'hidratação adequada';
    else hidratacaoStatus = 'excelente hidratação';
  }

  let visceralRisco = '';
  if (gorduraVisceral > 0) {
    if (gorduraVisceral <= 12) visceralRisco = 'baixo risco metabólico';
    else if (gorduraVisceral <= 15) visceralRisco = 'risco moderado';
    else visceralRisco = 'ALTO RISCO METABÓLICO';
  }

  return `
    <p><strong>"${userName}, aqui é o Dr. Vita, seu agente pessoal de saúde."</strong></p>
    
    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h4 style="color: white; margin-top: 0;">📊 ANÁLISE MÉDICA ATUAL:</h4>
      <p><strong>IMC ${imc.toFixed(1)}:</strong> ${imcStatus}</p>
      ${gorduraCorporal > 0 ? `<p><strong>Gordura Corporal:</strong> ${gorduraCorporal.toFixed(1)}% (${gorduraStatus})</p>` : ''}
      ${aguaCorporal > 0 ? `<p><strong>Hidratação:</strong> ${aguaCorporal.toFixed(1)}% (${hidratacaoStatus})</p>` : ''}
      ${gorduraVisceral > 0 ? `<p><strong>Gordura Visceral:</strong> Nível ${gorduraVisceral} (${visceralRisco})</p>` : ''}
      ${metabolismo > 0 ? `<p><strong>Metabolismo Basal:</strong> ${metabolismo} kcal/dia</p>` : ''}
    </div>

    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h4 style="color: white; margin-top: 0;">🩺 PRESCRIÇÕES MÉDICAS:</h4>
      <p><strong>1. Controle de Peso:</strong> ${imcRecomendacao}</p>
      ${aguaCorporal > 0 && aguaCorporal < 50 ? '<p><strong>2. Hidratação:</strong> Aumente ingesta hídrica para 2-3L/dia.</p>' : ''}
      ${gorduraVisceral > 12 ? '<p><strong>3. Risco Metabólico:</strong> Exercícios aeróbicos 150min/semana + resistência muscular.</p>' : ''}
      ${massaMuscular > 0 && massaMuscular < 30 ? '<p><strong>4. Massa Muscular:</strong> Protocolo de treino de força + proteína 1,2g/kg/dia.</p>' : ''}
    </div>

    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h4 style="color: white; margin-top: 0;">⚠️ ALERTAS MÉDICOS:</h4>
      ${imc >= 30 ? '<p><span style="color: #ff6b6b;">⚠️</span> Obesidade requer acompanhamento médico especializado.</p>' : ''}
      ${gorduraVisceral > 15 ? '<p><span style="color: #ff6b6b;">⚠️</span> Alto risco cardiovascular e diabetes.</p>' : ''}
      ${aguaCorporal > 0 && aguaCorporal < 45 ? '<p><span style="color: #ff6b6b;">⚠️</span> Desidratação pode comprometer função renal.</p>' : ''}
    </div>

    <p><strong>"Como seu agente pessoal de saúde, estarei monitorando sua evolução semanalmente. Realize medições regulares para análises mais precisas."</strong></p>
    
    <p style="text-align: right; margin-top: 15px;"><em>Dr. Vita - Medicina Personalizada e Inteligente<br>Análise baseada em bioimpedância avançada</em></p>
  `;
}

// Função para gerar dados do gráfico
function generateChartData(measurements: any[]): string {
  if (measurements.length === 0) return 'null';

  const reversedMeasurements = [...measurements].reverse();
  const labels = reversedMeasurements.map(m => new Date(m.measurement_date).toLocaleDateString('pt-BR'));
  const weightData = reversedMeasurements.map(m => m.peso_kg);
  const imcData = reversedMeasurements.map(m => m.imc || 0);
  const bodyFatData = reversedMeasurements.map(m => m.gordura_corporal_percent || 0);

  return `{
    type: 'line',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [
        {
          label: 'Peso (kg)',
          data: ${JSON.stringify(weightData)},
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'IMC',
          data: ${JSON.stringify(imcData)},
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        },
        {
          label: 'Gordura Corporal (%)',
          data: ${JSON.stringify(bodyFatData)},
          borderColor: '#4ecdc4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4,
          yAxisID: 'y2'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Data'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Peso (kg)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'IMC'
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        y2: {
          type: 'linear',
          display: false,
          position: 'right',
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Evolução de Indicadores de Saúde'
        }
      }
    }
  }`;
}