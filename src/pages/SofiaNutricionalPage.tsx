import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { openWeeklyMealPlanHTML } from '@/utils/exportMealPlanHTML';
import { openWeeklyMealPlanClinicalHTML } from '@/utils/exportMealPlanHTML';
import NutritionWeeklyCharts, { DaySeriesPoint } from '@/components/charts/NutritionWeeklyCharts';
import { DrVitalNutritionInsights } from '@/components/sofia/DrVitalNutritionInsights';
import { supabase } from '@/integrations/supabase/client';

export const SofiaNutricionalPage: React.FC = () => {
  const { meals, goals, loading, error, getDailyNutrition, getNutritionStats, updateGoals } = useNutritionTracking();
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('tracker');
  const [plan, setPlan] = useState<any[]>([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [mealPrefs, setMealPrefs] = useState<{[k:string]: boolean}>({
    breakfast: true,
    lunch: true,
    snack: true,
    dinner: true,
    supper: false,
  });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [prefEarlySnack, setPrefEarlySnack] = useState(false); // desjejum
  const [prefAfternoonSnack, setPrefAfternoonSnack] = useState(true); // café da tarde
  const [diet, setDiet] = useState<string | undefined>(undefined);
  const [likes, setLikes] = useState<string>('');
  const [dislikes, setDislikes] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [maxPrep, setMaxPrep] = useState<number>(40);
  const [daysCount, setDaysCount] = useState<number>(7);
  const [savedPlans, setSavedPlans] = useState<Array<{ id: string; plan_date: string; total_kcal: number }>>([]);
  const stats = getNutritionStats(7);
  const dailyNutrition = getDailyNutrition(selectedDate);
  const superfoods = findSuperfoods();
  const ketoFoods = findFoodsByDiet('keto');
  const { measurements, physicalData, fetchMeasurements } = useWeightMeasurement();
  const [weeklySeries, setWeeklySeries] = useState<DaySeriesPoint[]>([]);

  useEffect(() => {
    const loadWeekly = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        const sb: any = supabase as any;
        const { data } = await sb
          .from('nutrition_daily_summary')
          .select('date,total_calories,total_protein,total_carbs,total_fat')
          .eq('user_id', user.id)
          .gte('date', start.toISOString().slice(0,10))
          .lte('date', end.toISOString().slice(0,10))
          .order('date', { ascending: true });

        const map: Record<string, any> = {};
        (data || []).forEach((row: any) => { map[row.date] = row; });
        const series: DaySeriesPoint[] = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const key = d.toISOString().slice(0,10);
          const row = (map as any)[key] || null;
          return {
            dateLabel: d.toLocaleDateString('pt-BR').slice(0,5),
            calories: row?.total_calories || 0,
            protein: row?.total_protein || 0,
            carbs: row?.total_carbs || 0,
            fat: row?.total_fat || 0,
          } as DaySeriesPoint;
        });
        setWeeklySeries(series);
      } catch (e) {
        setWeeklySeries(Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          return { dateLabel: d.toLocaleDateString('pt-BR').slice(0,5), calories: stats.averageCalories, protein: stats.averageProtein, carbs: stats.averageCarbs, fat: stats.averageFat } as DaySeriesPoint;
        }));
      }
    };
    loadWeekly();
    const loadSavedPlans = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const sb: any = supabase as any;
        const { data } = await sb
          .from('meal_plans')
          .select('id,plan_date,total_kcal')
          .eq('user_id', user.id)
          .order('plan_date', { ascending: false })
          .limit(10);
        setSavedPlans((data as any[])?.map((r: any) => ({ id: r.id, plan_date: r.plan_date, total_kcal: Math.round(r.total_kcal || 0) })) || []);
      } catch {}
    };
    loadSavedPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latest = measurements && measurements.length > 0 ? measurements[0] : null;

  const activityFactor = (level?: string) => {
    switch ((level || '').toLowerCase()) {
      case 'sedentario':
      case 'sedentário':
      case 'sedentary':
        return 1.2;
      case 'leve':
      case 'light':
        return 1.375;
      case 'moderado':
      case 'moderate':
        return 1.55;
      case 'alto':
      case 'intenso':
      case 'high':
        return 1.725;
      case 'muito alto':
      case 'very high':
        return 1.9;
      default:
        return 1.375; // leve como padrão
    }
  };

  const computeMetabolism = () => {
    const weight = latest?.peso_kg;
    const height = physicalData?.altura_cm;
    const age = physicalData?.idade;
    const sex = (physicalData?.sexo || 'masc').toLowerCase();

    if (!weight || !height || !age) return { bmr: latest?.metabolismo_basal_kcal, tdee: undefined };

    // Mifflin-St Jeor
    const bmrCalc = sex.startsWith('f')
      ? Math.round(10 * weight + 6.25 * height - 5 * age - 161)
      : Math.round(10 * weight + 6.25 * height - 5 * age + 5);

    const bmr = latest?.metabolismo_basal_kcal || bmrCalc;
    const tdee = Math.round(bmr * activityFactor(physicalData?.nivel_atividade));
    return { bmr, tdee };
  };

  const { bmr, tdee } = computeMetabolism();

  const selectedMeals = (() => {
    const base = Object.entries(mealPrefs).filter(([,v]) => v).map(([k]) => k);
    // Mapear desjejum e café da tarde para 'snack'
    const includeSnack = prefEarlySnack || prefAfternoonSnack || base.includes('snack');
    const withSnack = base.filter((m) => m !== 'snack');
    if (includeSnack) withSnack.push('snack');
    return withSnack;
  })();

  const generatePlan = async () => {
    try {
      setPlanLoading(true);
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_EDGE_URL || ''}/generate-meal-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: Math.min(Math.max(daysCount || 7, 1), 14),
          meals: selectedMeals.length > 0 ? selectedMeals : ["breakfast","lunch","snack","dinner"],
          calories: goals.calories,
          protein: goals.protein,
          diet,
          allergies: allergies ? allergies.split(',').map(s=>s.trim()).filter(Boolean) : [],
          dislikes: dislikes ? dislikes.split(',').map(s=>s.trim()).filter(Boolean) : [],
          likes: likes ? likes.split(',').map(s=>s.trim()).filter(Boolean) : [],
          preferredTags: [],
          maxPrepMinutes: maxPrep,
        })
      });
      const data = await res.json();
      setPlan(data.plan || []);
      if (Array.isArray(data.plan) && data.plan.length) {
        await (async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            // salvar 7 dias em meal_plans + itens
            for (let d = 0; d < data.plan.length; d++) {
              const day = data.plan[d];
              const planDate = new Date(); planDate.setDate(planDate.getDate() + d);
              const slots = ['breakfast','lunch','snack','dinner','supper'] as const;
              const totals = slots.reduce((acc, slot) => {
                const m = day.meals?.[slot];
                if (m?.macros) {
                  acc.kcal += m.macros.calories || 0;
                  acc.protein += m.macros.protein || 0;
                  acc.carbs += m.macros.carbs || 0;
                  acc.fat += m.macros.fat || 0;
                }
                return acc;
              }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
              const sb: any = supabase as any;
              const { data: planRow } = await sb.from('meal_plans').insert({
                user_id: user.id,
                plan_date: planDate.toISOString().slice(0,10),
                status: 'draft',
                context: { generator: 'generate-meal-plan' },
                source: 'planner_v1',
                model_version: 'weekly_v1',
                verified: true,
                total_kcal: totals.kcal,
                protein_g: totals.protein,
                fat_g: totals.fat,
                carbs_g: totals.carbs,
              }).select('id').single();
              const planId = planRow?.id;
              if (!planId) continue;
              const items = slots.flatMap((slot) => {
                const m = day.meals?.[slot];
                return m ? [{
                  meal_plan_id: planId,
                  slot,
                  item_name: m.title,
                  grams: 0,
                  ml: null,
                  state: null,
                  kcal: m.macros?.calories || 0,
                  protein_g: m.macros?.protein || 0,
                  fat_g: m.macros?.fat || 0,
                  carbs_g: m.macros?.carbs || 0,
                  fiber_g: 0,
                  sodium_mg: 0,
                }] : [];
              });
              if (items.length) await sb.from('meal_plan_items').insert(items);
            }
            // auto preencher hoje
            const d0 = data.plan[0];
            const today = new Date().toISOString().slice(0,10);
            for (const slot of ['breakfast','lunch','snack','dinner','supper'] as const) {
              const m = d0.meals?.[slot];
              if (!m) continue;
              const sb: any = supabase as any;
              await sb.from('nutrition_tracking').insert({
                user_id: user.id,
                date: today,
                meal_type: slot === 'supper' ? 'snack' : slot,
                foods: [{ name: m.title, quantity: 1, unit: 'porção' }],
                total_calories: Math.round(m.macros?.calories || 0),
                total_protein: Math.round((m.macros?.protein || 0) * 10) / 10,
                total_carbs: Math.round((m.macros?.carbs || 0) * 10) / 10,
                total_fat: Math.round((m.macros?.fat || 0) * 10) / 10,
                total_fiber: 0,
              });
            }
          } catch (err) {
            console.warn('salvamento de cardápio / autofill falhou', err);
          }
        })();
      }
    } catch (e) {
      console.error('Falha ao gerar cardápio', e);
    } finally {
      setPlanLoading(false);
    }
  };

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

      {/* Abas internas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="tracker" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">Rastreador</TabsTrigger>
          <TabsTrigger value="menu" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">Cardápio</TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">Estatísticas</TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">Insights</TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-4">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Cardápio Semanal
              </CardTitle>
      </CardHeader>
      <CardContent>
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Gera 7 dias respeitando suas metas</div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={()=> openWeeklyMealPlanHTML(plan, { userName: '', targetCalories: goals.calories, days: plan?.length })} disabled={!plan || plan.length===0}>
                      Abrir Cardápio
                    </Button>
                    <Button variant="outline" onClick={()=> openWeeklyMealPlanClinicalHTML(plan, { userName: '', targetCalories: goals.calories })} disabled={!plan || plan.length===0}>
                      Abrir Cardápio (Clínico)
                    </Button>
                    <Button onClick={() => setWizardOpen(true)} disabled={planLoading} className="bg-gradient-to-r from-emerald-500 to-purple-600 text-white">
                      {planLoading ? 'Gerando...' : 'Gerar Cardápio'}
                </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox id="m-breakfast" checked={mealPrefs.breakfast} onCheckedChange={(v) => setMealPrefs(p=>({...p, breakfast: !!v}))} />
                    <label htmlFor="m-breakfast">Café da manhã</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="m-lunch" checked={mealPrefs.lunch} onCheckedChange={(v) => setMealPrefs(p=>({...p, lunch: !!v}))} />
                    <label htmlFor="m-lunch">Almoço</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="m-snack" checked={mealPrefs.snack} onCheckedChange={(v) => setMealPrefs(p=>({...p, snack: !!v}))} />
                    <label htmlFor="m-snack">Lanche</label>
          </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="m-dinner" checked={mealPrefs.dinner} onCheckedChange={(v) => setMealPrefs(p=>({...p, dinner: !!v}))} />
                    <label htmlFor="m-dinner">Jantar</label>
        </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="m-supper" checked={mealPrefs.supper} onCheckedChange={(v) => setMealPrefs(p=>({...p, supper: !!v}))} />
                    <label htmlFor="m-supper">Ceia</label>
        </div>
      </div>
                    </div>
              {plan.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhum cardápio gerado ainda.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="p-2">Dia</th>
                        <th className="p-2">Café</th>
                        <th className="p-2">Almoço</th>
                        <th className="p-2">Lanche</th>
                        <th className="p-2">Jantar</th>
                        <th className="p-2">Ceia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.map((d, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2 font-medium">{d.day}</td>
                          {['breakfast','lunch','snack','dinner','supper'].map((slot) => (
                            <td key={slot} className="p-2 align-top">
                              {d.meals[slot] ? (
                                <div>
                                  <div className="font-medium">{d.meals[slot].title}</div>
                                  <div className="text-xs text-gray-500">{Math.round(d.meals[slot].macros.calories)} kcal • {Math.round(d.meals[slot].macros.protein)}g P</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Histórico de cardápios salvos */}
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Histórico de cardápios salvos</div>
                {savedPlans.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Nenhum cardápio salvo ainda.</div>
                ) : (
                  <ul className="text-sm space-y-1">
                    {savedPlans.map((p) => (
                      <li key={p.id} className="flex items-center justify-between border-b py-1">
                        <span>{new Date(p.plan_date).toLocaleDateString('pt-BR')}</span>
                        <span className="text-muted-foreground">{p.total_kcal} kcal</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
          <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Preferências rápidas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs text-muted-foreground">Dias</label>
                    <Input type="number" min={1} max={14} value={daysCount} onChange={(e)=>setDaysCount(Math.min(Math.max(Number(e.target.value)||7,1),14))} />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs text-muted-foreground">Dieta</label>
                    <Select onValueChange={(v)=>setDiet(v)} value={diet}>
                      <SelectTrigger><SelectValue placeholder="Livre" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="vegetarian">Vegetariana</SelectItem>
                        <SelectItem value="vegan">Vegana</SelectItem>
                        <SelectItem value="gluten-free">Sem glúten</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs text-muted-foreground">Tempo máx. preparo (min)</label>
                    <Input type="number" value={maxPrep} onChange={(e)=>setMaxPrep(Number(e.target.value)||0)} />
                            </div>
                          </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Gostos (ingredientes, separados por vírgula)</label>
                  <Input value={likes} onChange={(e)=>setLikes(e.target.value)} placeholder="frango, banana, salada" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Desgostos (ingredientes)</label>
                  <Input value={dislikes} onChange={(e)=>setDislikes(e.target.value)} placeholder="pimenta, azeitona" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Alergias</label>
                  <Input value={allergies} onChange={(e)=>setAllergies(e.target.value)} placeholder="amendoim, lactose" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={()=>setWizardOpen(false)}>Cancelar</Button>
                  <Button onClick={async ()=>{ setWizardOpen(false); await generatePlan(); }}>Confirmar</Button>
                        </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="tracker">
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
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Estatísticas da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <NutritionWeeklyCharts data={weeklySeries} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm">Dias Ativos</span>
                    <Badge variant="secondary">{stats.daysTracked}/7</Badge>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm">Score Médio</span>
                    <Badge variant="secondary">{Math.round(stats.goalAchievementRate)}/100</Badge>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm">Refeições Registradas</span>
                    <Badge variant="secondary">{meals.length}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <DrVitalNutritionInsights />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Metas Nutricionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-4">
                  <div>
                    <Label htmlFor="calories">Calorias Diárias</Label>
                    <Input id="calories" type="number" value={goals.calories} onChange={(e) => updateGoals({ ...goals, calories: Number(e.target.value) })} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="protein">Proteínas (g)</Label>
                    <Input id="protein" type="number" value={goals.protein} onChange={(e) => updateGoals({ ...goals, protein: Number(e.target.value) })} className="mt-1" />
          </div>
                  <div>
                    <Label htmlFor="carbs">Carboidratos (g)</Label>
                    <Input id="carbs" type="number" value={goals.carbs} onChange={(e) => updateGoals({ ...goals, carbs: Number(e.target.value) })} className="mt-1" />
          </div>
                  <div>
                    <Label htmlFor="fat">Gorduras (g)</Label>
                    <Input id="fat" type="number" value={goals.fat} onChange={(e) => updateGoals({ ...goals, fat: Number(e.target.value) })} className="mt-1" />
          </div>
        </div>
        <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Calorias</span>
                      <span>{Math.round(dailyNutrition.totalCalories)} / {goals.calories}</span>
            </div>
                    <Progress value={(dailyNutrition.totalCalories / goals.calories) * 100} className="h-2" />
          </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Proteínas</span>
                      <span>{Math.round(dailyNutrition.totalProtein)}g / {goals.protein}g</span>
          </div>
                    <Progress value={(dailyNutrition.totalProtein / goals.protein) * 100} className="h-2" />
          </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carboidratos</span>
                      <span>{Math.round(dailyNutrition.totalCarbs)}g / {goals.carbs}g</span>
          </div>
                    <Progress value={(dailyNutrition.totalCarbs / goals.carbs) * 100} className="h-2" />
      </div>
            <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Gorduras</span>
                      <span>{Math.round(dailyNutrition.totalFat)}g / {goals.fat}g</span>
            </div>
                    <Progress value={(dailyNutrition.totalFat / goals.fat) * 100} className="h-2" />
            </div>
          </div>
        </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Metabolismo do Usuário
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Metabolismo Basal (BMR)</span>
                        <span className="font-semibold">{bmr ? `${bmr} kcal/dia` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gasto Diário Estimado (TDEE)</span>
                        <span className="font-semibold">{tdee ? `${tdee} kcal/dia` : '—'}</span>
          </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Última pesagem</span>
                        <span>{latest?.measurement_date ? new Date(latest.measurement_date).toLocaleDateString() : '—'}</span>
        </div>
                    </div>
                    {!latest && (
                      <p className="text-xs text-muted-foreground mt-3">Faça uma pesagem para calcular automaticamente seu metabolismo.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      Dados Físicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between"><span>Altura</span><span className="font-medium">{physicalData?.altura_cm ? `${physicalData.altura_cm} cm` : '—'}</span></div>
                      <div className="flex justify-between"><span>Idade</span><span className="font-medium">{physicalData?.idade ?? '—'}</span></div>
                      <div className="flex justify-between"><span>Sexo</span><span className="font-medium">{physicalData?.sexo ?? '—'}</span></div>
                      <div className="flex justify-between"><span>Nível de atividade</span><span className="font-medium">{physicalData?.nivel_atividade ?? '—'}</span></div>
          </div>
              </CardContent>
            </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


