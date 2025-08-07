import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  Activity, 
  Heart, 
  Footprints, 
  Flame, 
  Clock, 
  Moon, 
  TrendingUp,
  Target,
  Zap,
  Scale
} from 'lucide-react';

interface GoogleFitAdvancedData {
  dailyData: Array<{
    date: string;
    steps: number;
    calories: number;
    distance: number;
    heartRate: number;
    activeMinutes: number;
    sleepHours: number;
    weight?: number;
  }>;
  weeklyStats: {
    totalSteps: number;
    totalCalories: number;
    totalDistance: number;
    avgHeartRate: number;
    totalActiveMinutes: number;
    avgSleepDuration: number;
    currentWeight?: number;
    weightTrend?: number;
  };
  healthMetrics: {
    restingHeartRate?: number;
    maxHeartRate?: number;
    bmi?: number;
    bodyFatPercentage?: number;
  };
}

interface AdvancedGoogleFitChartsProps {
  data: GoogleFitAdvancedData;
  cardVariants: any;
}

export const AdvancedGoogleFitCharts: React.FC<AdvancedGoogleFitChartsProps> = ({ 
  data, 
  cardVariants 
}) => {
  const { dailyData, weeklyStats, healthMetrics } = data;

  // Cores consistentes
  const colors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    pink: '#EC4899',
    orange: '#F97316'
  };

  // Dados para gráfico de pizza - distribuição de atividades
  const activityDistribution = [
    { name: 'Caminhada', value: weeklyStats.totalSteps * 0.6, color: colors.primary },
    { name: 'Exercícios', value: weeklyStats.totalActiveMinutes * 2, color: colors.success },
    { name: 'Descanso', value: weeklyStats.avgSleepDuration * 60, color: colors.purple },
    { name: 'Outros', value: (weeklyStats.totalSteps * 0.4), color: colors.teal }
  ];

  // Dados para gráfico radial - metas semanais
  const weeklyGoals = [
    { 
      name: 'Passos',
      value: Math.min((weeklyStats.totalSteps / 70000) * 100, 100),
      color: colors.primary,
      target: '70.000 passos/semana'
    },
    { 
      name: 'Calorias',
      value: Math.min((weeklyStats.totalCalories / 3500) * 100, 100),
      color: colors.orange,
      target: '3.500 cal/semana'
    },
    { 
      name: 'Minutos Ativos',
      value: Math.min((weeklyStats.totalActiveMinutes / 150) * 100, 100),
      color: colors.success,
      target: '150 min/semana'
    },
    { 
      name: 'Sono',
      value: Math.min((weeklyStats.avgSleepDuration / 8) * 100, 100),
      color: colors.purple,
      target: '8h por noite'
    }
  ];

  // Classificação de saúde baseada nos dados
  const getHealthScore = () => {
    let score = 0;
    if (weeklyStats.totalSteps >= 70000) score += 25;
    else if (weeklyStats.totalSteps >= 50000) score += 18;
    else if (weeklyStats.totalSteps >= 35000) score += 12;
    
    if (weeklyStats.avgHeartRate >= 60 && weeklyStats.avgHeartRate <= 100) score += 25;
    else if (weeklyStats.avgHeartRate > 0) score += 15;
    
    if (weeklyStats.avgSleepDuration >= 7 && weeklyStats.avgSleepDuration <= 9) score += 25;
    else if (weeklyStats.avgSleepDuration >= 6) score += 15;
    
    if (weeklyStats.totalActiveMinutes >= 150) score += 25;
    else if (weeklyStats.totalActiveMinutes >= 100) score += 18;
    else if (weeklyStats.totalActiveMinutes >= 50) score += 10;
    
    return Math.min(score, 100);
  };

  const healthScore = getHealthScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    if (score >= 40) return colors.orange;
    return colors.danger;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Score de Saúde Geral */}
      <motion.div variants={cardVariants}>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Target className="w-6 h-6 text-blue-600" />
              Score de Saúde Google Fit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div 
                className="text-6xl font-bold"
                style={{ color: getScoreColor(healthScore) }}
              >
                {healthScore}
              </div>
              <div className="text-lg text-muted-foreground">
                {healthScore >= 80 ? 'Excelente' : 
                 healthScore >= 60 ? 'Bom' : 
                 healthScore >= 40 ? 'Regular' : 'Precisa Melhorar'}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${healthScore}%`,
                    backgroundColor: getScoreColor(healthScore)
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Baseado em passos, frequência cardíaca, sono e atividade física
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Evolução Diária - Passos e Calorias */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Evolução Diária - Atividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      typeof value === 'number' ? value.toLocaleString() : value,
                      name === 'steps' ? 'Passos' : 'Calorias'
                    ]}
                    labelFormatter={(date) => `Data: ${formatDate(date)}`}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="steps" 
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                    name="Passos"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="calories" 
                    stroke={colors.orange}
                    strokeWidth={3}
                    dot={{ fill: colors.orange, strokeWidth: 2, r: 4 }}
                    name="Calorias"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Frequência Cardíaca e Sono */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Saúde Cardiovascular e Sono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      typeof value === 'number' ? value.toFixed(1) : value,
                      name === 'heartRate' ? 'BPM' : 'Horas de Sono'
                    ]}
                    labelFormatter={(date) => `Data: ${formatDate(date)}`}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke={colors.danger}
                    fill={colors.danger}
                    fillOpacity={0.3}
                    name="Freq. Cardíaca"
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="sleepHours" 
                    stroke={colors.purple}
                    fill={colors.purple}
                    fillOpacity={0.3}
                    name="Sono"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metas Semanais - Gráfico Radial */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Progresso das Metas Semanais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="20%" 
                  outerRadius="90%" 
                  data={weeklyGoals}
                >
                  <RadialBar 
                    dataKey="value" 
                    cornerRadius={10} 
                    fill="#8884d8"
                  />
                  <Tooltip 
                    formatter={(value: any, name: string, props: any) => [
                      `${value.toFixed(1)}%`,
                      props.payload.target
                    ]}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {weeklyGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{goal.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {goal.value.toFixed(0)}% da meta
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribuição de Atividades */}
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Distribuição Semanal de Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={activityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {activityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [value.toLocaleString(), 'Pontos']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {activityDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Métricas de Saúde Avançadas */}
      {healthMetrics && (
        <motion.div variants={cardVariants}>
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Métricas de Saúde Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {healthMetrics.restingHeartRate && (
                  <div className="text-center space-y-2">
                    <Heart className="w-8 h-8 text-blue-500 mx-auto" />
                    <div className="text-2xl font-bold text-blue-600">
                      {healthMetrics.restingHeartRate}
                    </div>
                    <div className="text-sm text-muted-foreground">FC Repouso</div>
                    <Badge variant={
                      healthMetrics.restingHeartRate <= 60 ? 'default' :
                      healthMetrics.restingHeartRate <= 80 ? 'secondary' : 'destructive'
                    }>
                      {healthMetrics.restingHeartRate <= 60 ? 'Atlético' :
                       healthMetrics.restingHeartRate <= 80 ? 'Normal' : 'Alto'}
                    </Badge>
                  </div>
                )}
                
                {healthMetrics.maxHeartRate && (
                  <div className="text-center space-y-2">
                    <Zap className="w-8 h-8 text-red-500 mx-auto" />
                    <div className="text-2xl font-bold text-red-600">
                      {healthMetrics.maxHeartRate}
                    </div>
                    <div className="text-sm text-muted-foreground">FC Máxima</div>
                    <Badge variant="outline">BPM</Badge>
                  </div>
                )}
                
                {healthMetrics.bmi && (
                  <div className="text-center space-y-2">
                    <Scale className="w-8 h-8 text-green-500 mx-auto" />
                    <div className="text-2xl font-bold text-green-600">
                      {healthMetrics.bmi.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">IMC</div>
                    <Badge variant={
                      healthMetrics.bmi < 18.5 ? 'destructive' :
                      healthMetrics.bmi <= 24.9 ? 'default' :
                      healthMetrics.bmi <= 29.9 ? 'secondary' : 'destructive'
                    }>
                      {healthMetrics.bmi < 18.5 ? 'Abaixo' :
                       healthMetrics.bmi <= 24.9 ? 'Normal' :
                       healthMetrics.bmi <= 29.9 ? 'Sobrepeso' : 'Obesidade'}
                    </Badge>
                  </div>
                )}
                
                {weeklyStats.currentWeight && (
                  <div className="text-center space-y-2">
                    <Scale className="w-8 h-8 text-purple-500 mx-auto" />
                    <div className="text-2xl font-bold text-purple-600">
                      {weeklyStats.currentWeight.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Peso Atual (kg)</div>
                    {weeklyStats.weightTrend && (
                      <Badge variant={
                        weeklyStats.weightTrend < 0 ? 'default' : 
                        weeklyStats.weightTrend === 0 ? 'secondary' : 'destructive'
                      }>
                        {weeklyStats.weightTrend < 0 ? '↓' : 
                         weeklyStats.weightTrend === 0 ? '→' : '↑'} 
                        {Math.abs(weeklyStats.weightTrend).toFixed(1)}kg
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedGoogleFitCharts;