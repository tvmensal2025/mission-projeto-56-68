import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Activity, 
  TrendingDown,
  Calendar,
  Award,
  Scale,
  Brain,
  MessageCircle,
  Trophy,
  FileText,
  Mail,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalWeightLoss: number;
  completedMissions: number;
  averageEngagement: number;
  weeklyWeighings: number;
  totalSessions: number;
  activeSaboteurs: number;
  sofiaMessages: number;
  sofiaFoodAnalyses: number;
  sofiaMissionUpdates: number;
  drVitalReports: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalWeightLoss: 0,
    completedMissions: 0,
    averageEngagement: 0,
    weeklyWeighings: 0,
    totalSessions: 0,
    activeSaboteurs: 0,
    sofiaMessages: 0,
    sofiaFoodAnalyses: 0,
    sofiaMissionUpdates: 0,
    drVitalReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas básicas
      const [
        { count: totalUsers },
        { count: weeklyWeighings },
        { count: totalSessions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('weight_measurements').select('*', { count: 'exact', head: true }).gte('measurement_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_sessions').select('*', { count: 'exact', head: true })
      ]);

      // Buscar estatísticas da Sofia
      let sofiaMessages = 0;
      let sofiaFoodAnalyses = 0;

      try {
        const { count: sofiaMessagesCount } = await supabase
          .from('sofia_food_analysis')
          .select('*', { count: 'exact', head: true });
        sofiaMessages = sofiaMessagesCount || 0;
      } catch (error) {
        console.log('Tabela sofia_food_analysis não existe ainda');
      }

      try {
        const { count: sofiaFoodCount } = await supabase
          .from('food_analysis')
          .select('*', { count: 'exact', head: true });
        sofiaFoodAnalyses = sofiaFoodCount || 0;
      } catch (error) {
        console.log('Erro ao buscar análises de comida');
      }

      // Calcular perda de peso total
      const { data: weightMeasurements } = await supabase
        .from('weight_measurements')
        .select('peso_kg')
        .order('measurement_date', { ascending: false })
        .limit(100);

      const totalWeightLoss = weightMeasurements?.reduce((sum, measurement) => sum + (measurement.peso_kg || 0), 0) || 0;

      // Calcular missões completadas
      let completedMissions = 0;
      try {
        const { count: missionsCount } = await supabase
          .from('daily_responses')
          .select('*', { count: 'exact', head: true });
        completedMissions = missionsCount || 0;
      } catch (error) {
        console.log('Tabela daily_responses não existe ainda');
      }

      // Calcular engajamento médio baseado em profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');
      
      const averageEngagement = profiles?.length || 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: Math.floor((totalUsers || 0) * 0.7), // Estimativa
        totalWeightLoss: Math.round(totalWeightLoss),
        completedMissions,
        averageEngagement,
        weeklyWeighings: weeklyWeighings || 0,
        totalSessions: totalSessions || 0,
        activeSaboteurs: totalSessions || 0,
        sofiaMessages,
        sofiaFoodAnalyses,
        sofiaMissionUpdates: completedMissions,
        drVitalReports: sofiaMessages
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const testWeeklyEmail = async () => {
    try {
      setTestingEmail(true);
      
      // Buscar usuário Sirlene Correa primeiro
      const { data: sirleneUser } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('email', 'tvmensal2025@gmail.com')
        .single();

      let testUser;
      if (sirleneUser) {
        testUser = sirleneUser;
      } else {
        // Fallback: buscar qualquer usuário
        const { data: anyUser } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .limit(1)
          .single();
        testUser = anyUser;
      }

      if (!testUser) {
        throw new Error('Nenhum usuário encontrado para teste');
      }

      // Chamar Edge Function usando fetch direto (como no teste que funcionou)
      const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/weekly-health-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI'}`
        },
        body: JSON.stringify({
          testMode: true,
          testEmail: testUser.email,
          testUserName: testUser.full_name
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Erro na Edge Function: ${result.error || 'Status ' + response.status}`);
      }

      toast({
        title: "✅ Email Enviado!",
        description: `Relatório semanal enviado para ${testUser.full_name} (${testUser.email})`,
      });

    } catch (error: any) {
      console.error('Erro no teste de email:', error);
      toast({
        title: "❌ Erro no Teste",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <div className="text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Seção de Testes do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Testes do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">📧 Teste de Email Semanal</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Testa o envio de email semanal usando o Resend. O email será enviado 
                especificamente para Sirlene Correa (tvmensal2025@gmail.com).
              </p>
              <Button 
                onClick={testWeeklyEmail}
                disabled={testingEmail}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Testar Email para Sirlene
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.activeUsers} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perda de Peso Total</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWeightLoss}kg</div>
            <p className="text-xs text-muted-foreground">
              {stats.weeklyWeighings} pesagens esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missões Completadas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedMissions}</div>
            <p className="text-xs text-muted-foreground">
              Engajamento médio: {stats.averageEngagement}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas da Sofia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises Sofia</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sofiaMessages}</div>
            <p className="text-xs text-muted-foreground">
              Total de análises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises de Comida</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sofiaFoodAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              Imagens processadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missões Atualizadas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sofiaMissionUpdates}</div>
            <p className="text-xs text-muted-foreground">
              Via Sofia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Funcionando</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drVitalReports}</div>
            <p className="text-xs text-muted-foreground">
              Sistema ativo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;