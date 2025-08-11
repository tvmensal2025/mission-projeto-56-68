import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Apple, 
  BarChart3,
  ChefHat,
  Lightbulb,
  Zap
} from 'lucide-react';
import { NutritionTracker } from '@/components/nutrition-tracking/NutritionTracker';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';
import { findSuperfoods, findFoodsByDiet } from '@/data/open-nutri-tracker-database';

export const SofiaNutritionalPage: React.FC = () => {
  const { meals, goals, loading, error, getDailyNutrition, getNutritionStats } = useNutritionTracking();
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('tracker');
  const stats = getNutritionStats(7);
  const dailyNutrition = getDailyNutrition(selectedDate);
  const superfoods = findSuperfoods();
  const ketoFoods = findFoodsByDiet('keto');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      {/* Top Banner simplificado (sem perfil/host) */}
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold">Ψ Sofia Nutricional</h1>
        <p className="text-emerald-100 mt-1">Planejamento inteligente com garantia de metas</p>
      </div>

      {/* Nutritional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Calorias</h3>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{dailyNutrition.totalCalories}</div>
            <div className="text-xs text-gray-500 mt-1">Meta: {goals.calories} kcal</div>
            <Progress value={Math.min(dailyNutrition.progress.calories, 100)} className="mt-3 h-2 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Proteínas</h3>
              <Apple className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{dailyNutrition.totalProtein}g</div>
            <div className="text-xs text-gray-500 mt-1">Meta: {goals.protein}g</div>
            <Progress value={Math.min(dailyNutrition.progress.protein, 100)} className="mt-3 h-2 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Carboidratos</h3>
              <BarChart3 className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{dailyNutrition.totalCarbs}g</div>
            <div className="text-xs text-gray-500 mt-1">Meta: {goals.carbs}g</div>
            <Progress value={Math.min(dailyNutrition.progress.carbs, 100)} className="mt-3 h-2 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Gorduras</h3>
              <Target className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{dailyNutrition.totalFat}g</div>
            <div className="text-xs text-gray-500 mt-1">Meta: {goals.fat}g</div>
            <Progress value={Math.min(dailyNutrition.progress.fat, 100)} className="mt-3 h-2 bg-gray-100" />
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal: apenas Rastreador */}
      <Card className="bg-white shadow-sm border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-emerald-600" />
            Rastreador de Nutrição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NutritionTracker />
        </CardContent>
      </Card>
    </div>
  );
};
