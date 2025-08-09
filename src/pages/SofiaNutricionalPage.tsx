import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MessageSquare, Printer, RefreshCw, ShoppingCart, Star, TrendingUp, Utensils } from 'lucide-react';
import { ConfettiAnimation, useConfetti } from '@/components/gamification/ConfettiAnimation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SofiaChat from '@/components/sofia/SofiaChat';
import SofiaMealSuggestionModal, { MealPlanGenerated, MealEntry } from '@/components/sofia/SofiaMealSuggestionModal';
import SofiaIntakeDialog, { IntakeAnswers } from '@/components/sofia/SofiaIntakeDialog';
import SofiaMealQnAChat, { MealQnAResult } from '@/components/sofia/SofiaMealQnAChat';
import { exportMealPlanToPDF } from '@/utils/exportMealPlanPDF';
import { openMealPlanHTML, downloadMealPlanHTML } from '@/utils/exportMealPlanHTML';
import MealSwapModal from '@/components/sofia/MealSwapModal';

type BudgetLevel = 'baixo' | 'médio' | 'alto';

interface DailyMeals {
  breakfast?: MealEntry;
  lunch?: MealEntry;
  snack?: MealEntry;
  dinner?: MealEntry;
}

interface MealPlan {
  id?: string;
  type: 'dia' | 'semana';
  createdAt: string;
  tags?: string[];
  score?: number; // 0-100
  days: Record<string, DailyMeals>; // ex.: segunda, terca, ...
}

interface FoodPreferences {
  alergias: string;
  restricoes: string;
  dislikes: string;
  orcamento: BudgetLevel;
  tempoPreparoMin: number;
  utensilios: string;
}

const defaultPreferences: FoodPreferences = {
  alergias: '',
  restricoes: '',
  dislikes: '',
  orcamento: 'médio',
  tempoPreparoMin: 30,
  utensilios: ''
};

const SofiaNutricionalPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [history, setHistory] = useState<MealPlan[]>([]);
  const [lastSofiaInteraction, setLastSofiaInteraction] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<FoodPreferences>(defaultPreferences);
  const [chatOpen, setChatOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [targetCalories, setTargetCalories] = useState<number | undefined>(undefined);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [lastIntake, setLastIntake] = useState<IntakeAnswers | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapMealKey, setSwapMealKey] = useState<keyof DailyMeals | null>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { trigger: confettiTrigger, celebrate } = useConfetti();

  // Histórico local para evitar dependência de tabelas durante a v2
  const HISTORY_STORAGE_KEY = 'sofia_meal_plan_history_v2';
  const generateId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2,10)}`);
  const loadHistoryLocal = (): MealPlan[] => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const saveHistoryLocal = (plans: MealPlan[]) => {
    try { localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(plans.slice(0, 20))); } catch { /* ignore */ }
  };
  const pushToHistory = (plan: MealPlan) => {
    const next: MealPlan = { id: plan.id || generateId(), ...plan } as MealPlan;
    const current = loadHistoryLocal();
    const updated = [next, ...current].slice(0, 20);
    saveHistoryLocal(updated);
    setHistory(updated);
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      setUser(user);
      setLoading(false);
    });
    // Buscar última pesagem para meta calórica (TMB * 1.2)
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user?.id;
        if (!userId) return;
        const { data, error } = await supabase
          .from('weight_measurements')
          .select('metabolismo_basal_kcal')
          .eq('user_id', userId)
          .order('measurement_date', { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0 && data[0].metabolismo_basal_kcal) {
          const kcal = Math.round((data[0].metabolismo_basal_kcal as number) * 1.2);
          setTargetCalories(kcal);
        }
      } catch (e) {
        console.warn('Falha ao obter TMB:', e);
      }
    })();
    // Carregar histórico do localStorage (v2 sem dependência de tabela remota)
    setHistory(loadHistoryLocal());
    return () => {
      mounted = false;
    };
  }, []);

  const handleDownloadPDF = async () => {
    try {
      if (!currentPlan) return;
      const today = currentPlan.days['hoje'] || currentPlan.days[Object.keys(currentPlan.days)[0]];
      await exportMealPlanToPDF({
        dateLabel: new Date(currentPlan.createdAt).toLocaleDateString('pt-BR'),
        targetCaloriesKcal: targetCalories,
        guaranteed: currentPlan.tags?.includes('Garantido'),
        meals: {
          breakfast: today?.breakfast as any,
          lunch: today?.lunch as any,
          afternoon_snack: today?.snack as any,
          dinner: today?.dinner as any,
          supper: undefined,
        }
      });
      toast({ title: 'PDF gerado', description: 'Seu cardápio foi exportado com sucesso.' });
    } catch (err) {
      toast({ title: 'Erro ao exportar', description: 'Não foi possível gerar o PDF.', variant: 'destructive' });
    }
  };

  const handlePrint = () => {
    window.print();
    toast({ title: 'Impressão iniciada', description: 'Preparando seu cardápio para impressão.' });
  };

  const handleOpenHTML = () => {
    if (!currentPlan) return;
    const today = currentPlan.days['hoje'] || currentPlan.days[Object.keys(currentPlan.days)[0]];
    openMealPlanHTML({
      dateLabel: new Date(currentPlan.createdAt).toLocaleDateString('pt-BR'),
      targetCaloriesKcal: targetCalories,
      guaranteed: currentPlan.tags?.includes('Garantido'),
      meals: {
        breakfast: today?.breakfast as any,
        lunch: today?.lunch as any,
        afternoon_snack: today?.snack as any,
        dinner: today?.dinner as any,
        supper: undefined,
      }
    });
  };

  const handleDownloadHTML = () => {
    if (!currentPlan) return;
    const today = currentPlan.days['hoje'] || currentPlan.days[Object.keys(currentPlan.days)[0]];
    downloadMealPlanHTML({
      dateLabel: new Date(currentPlan.createdAt).toLocaleDateString('pt-BR'),
      targetCaloriesKcal: targetCalories,
      guaranteed: currentPlan.tags?.includes('Garantido'),
      meals: {
        breakfast: today?.breakfast as any,
        lunch: today?.lunch as any,
        afternoon_snack: today?.snack as any,
        dinner: today?.dinner as any,
        supper: undefined,
      }
    });
  };

  const handleSavePreferences = () => {
    // Persistência será conectada ao Supabase após confirmação do schema
    toast({ title: 'Preferências salvas', description: 'Suas preferências alimentares foram registradas.' });
  };

  const handleResetPreferences = () => {
    setPreferences(defaultPreferences);
    toast({ title: 'Preferências redefinidas', description: 'Voltamos aos padrões iniciais.' });
  };

  const handleOpenShoppingList = () => {
    setShoppingOpen(true);
  };

  // Novo: gerar plano via Edge Function nutrition-planner
  const generatePlanWithPlanner = async (intake: IntakeAnswers) => {
    try {
      const { data, error } = await supabase.functions.invoke('nutrition-planner', {
        body: {
          intake: {
            objetivo: intake.objetivo,
            alergias: intake.alergias,
            restricoesReligiosas: intake.restricoesReligiosas,
            preferencias: intake.preferencias,
            naoGosta: intake.naoGosta,
            rotinaHorarios: intake.rotinaHorarios,
            orcamento: intake.orcamento,
            tempoPreparoMin: intake.tempoPreparoMin,
            utensilios: intake.utensilios,
          },
          save: false,
        },
      });

      if (error || !data?.success) {
        toast({ title: 'Falha ao gerar plano', description: 'Tentando fluxo alternativo de sugestão…', variant: 'destructive' });
        setSuggestionOpen(true);
        return;
      }

      const bySlot = (data.by_slot || {}) as Record<string, { resolved: any[]; totals: any }>;
      const toMeal = (slot: string) => {
        const r = bySlot[slot]?.resolved || [];
        if (!r.length) return undefined;
        const ingredients = r
          .filter((x: any) => x?.nutrients)
          .map((x: any) => ({ name: x.matched_canonical_name || x.input?.name, quantity: Math.round(x.effective_grams || 0), unit: 'g' }));
        const kcal = Math.round(bySlot[slot]?.totals?.kcal || 0);
        return { name: slot, calories_kcal: kcal, ingredients } as any;
      };

      const daily: DailyMeals = {
        breakfast: toMeal('breakfast'),
        lunch: toMeal('lunch'),
        snack: toMeal('snack'),
        dinner: toMeal('dinner'),
      };

      setCurrentPlan({
        type: 'dia',
        createdAt: new Date().toISOString(),
        score: Math.min(100, Math.round(((data.totals?.protein_g || 0) + 1) * 2)),
        tags: ['Sofia Pro', data.guarantee ? 'Garantido' : 'Estimado'],
        days: { hoje: daily },
      });
      pushToHistory({
        type: 'dia',
        createdAt: new Date().toISOString(),
        score: Math.min(100, Math.round(((data.totals?.protein_g || 0) + 1) * 2)),
        tags: ['Sofia Pro', data.guarantee ? 'Garantido' : 'Estimado'],
        days: { hoje: daily },
      });
      setLastSofiaInteraction(new Date().toISOString());
      toast({ title: 'Plano gerado', description: data.guarantee ? 'Metas atendidas (Garantido).' : 'Plano estimado.' });
      // Armazena sugestões de troca quando existirem
      (window as any).__sofia_swap_suggestions = data.swap_suggestions || null;
      celebrate();
    } catch (e: any) {
      console.error('planner error', e);
      toast({ title: 'Erro ao gerar', description: 'Use o fluxo alternativo de sugestão.', variant: 'destructive' });
      setSuggestionOpen(true);
    }
  };

  // Salvar plano no Supabase via Edge Function (meal_plans + itens)
  const handleSavePlan = async () => {
    try {
      if (!currentPlan) {
        toast({ title: 'Sem plano ativo', description: 'Gere um plano antes de salvar.', variant: 'destructive' });
        return;
      }

      const intakeToSave: IntakeAnswers = lastIntake || {
        objetivo: 'Plano diário',
        alergias: preferences.alergias,
        restricoesReligiosas: preferences.restricoes,
        preferencias: preferences.dislikes ? `Evitar: ${preferences.dislikes}` : '',
        naoGosta: preferences.dislikes,
        rotinaHorarios: '',
        orcamento: preferences.orcamento,
        tempoPreparoMin: preferences.tempoPreparoMin,
        utensilios: preferences.utensilios,
      };

      const { data, error } = await supabase.functions.invoke('nutrition-planner', {
        body: {
          intake: {
            objetivo: intakeToSave.objetivo,
            alergias: intakeToSave.alergias,
            restricoesReligiosas: intakeToSave.restricoesReligiosas,
            preferencias: intakeToSave.preferencias,
            naoGosta: intakeToSave.naoGosta,
            rotinaHorarios: intakeToSave.rotinaHorarios,
            orcamento: intakeToSave.orcamento,
            tempoPreparoMin: intakeToSave.tempoPreparoMin,
            utensilios: intakeToSave.utensilios,
          },
          save: true,
        },
      });

      if (error || !data?.success) {
        toast({ title: 'Falha ao salvar', description: 'Tente novamente em instantes.', variant: 'destructive' });
        return;
      }

      const planId = data.plan_id as string | null;
      if (planId) {
        const updated: MealPlan = { ...currentPlan, id: planId };
        setCurrentPlan(updated);
        // Atualiza histórico com id quando disponível
        pushToHistory(updated);
        toast({ title: 'Plano salvo', description: 'Seu cardápio foi salvo no seu perfil.' });
      } else {
        toast({ title: 'Plano salvo (parcial)', description: 'Plano salvo, mas sem ID retornado.' });
      }
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: 'Não foi possível salvar o cardápio.', variant: 'destructive' });
    }
  };

  const getCategory = (name: string) => {
    const n = name.toLowerCase();
    if (/(maçã|banana|laranja|alface|tomate|cenoura|brócolis|couve|fruta|legume|verdura)/.test(n)) return 'Hortifruti';
    if (/(arroz|aveia|pão|granola|farinha|massa|macarrão|cereal)/.test(n)) return 'Grãos e cereais';
    if (/(leite|iogurte|queijo|requeijão)/.test(n)) return 'Laticínios';
    if (/(frango|carne|peixe|ovos|ovo|atum|sardinha|feijão|lentilha|grão-de-bico)/.test(n)) return 'Proteínas';
    if (/(azeite|sal|vinagre|alho|cebola|pimenta|orégano|tempero|ervas)/.test(n)) return 'Temperos';
    return 'Outros';
  };

  const aggregatedShoppingList = () => {
    if (!currentPlan) return [] as { name: string; quantity: number; unit: string; category: string }[];
    const agg: Record<string, { name: string; quantity: number; unit: string; category: string }> = {};
    Object.values(currentPlan.days).forEach((meals) => {
      (['breakfast','lunch','snack','dinner'] as Array<keyof DailyMeals>).forEach((key) => {
        const meal = meals[key] as any;
        if (meal?.ingredients) {
          meal.ingredients.forEach((ing: any) => {
            const id = `${ing.name}__${ing.unit}`;
            const category = getCategory(ing.name || '');
            if (!agg[id]) agg[id] = { name: ing.name, quantity: 0, unit: ing.unit, category };
            agg[id].quantity += Number(ing.quantity || 0);
          });
        }
      });
    });
    return Object.values(agg).sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  };

  const downloadShoppingCSV = () => {
    const items = aggregatedShoppingList();
    if (items.length === 0) return;
    const header = 'Categoria,Item,Quantidade,Unidade\n';
    const rows = items.map(i => `${i.category},${i.name},${Math.round(i.quantity)},${i.unit}`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lista-compras-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusCard = (
    <Card className="h-full bg-card/60 backdrop-blur-xl border border-border/30 shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Status do Cardápio Atual</CardTitle>
        <CardDescription>Plano ativo e data de criação</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentPlan ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tipo</span>
              <Badge variant="secondary" className="capitalize">{currentPlan.type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Criado em</span>
              <span className="text-sm">{new Date(currentPlan.createdAt).toLocaleString('pt-BR')}</span>
            </div>
            {currentPlan.tags?.includes('Garantido') && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">Garantido ✓ metas atendidas</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Imprimir</Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}><Printer className="h-4 w-4 mr-1" /> Exportar PDF</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Nenhum cardápio ativo.</div>
        )}
      </CardContent>
    </Card>
  );

  const scoreCard = (
    <Card className="h-full bg-card/60 backdrop-blur-xl border border-border/30 shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" /> Score Nutricional</CardTitle>
        <CardDescription>Equilíbrio e variedade do cardápio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold">{currentPlan?.score ?? 0}</div>
          <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
            <div
              className="h-2"
              style={{
                width: `${currentPlan?.score ?? 0}%`,
                backgroundColor: (currentPlan?.score ?? 0) >= 70 ? '#10B981' : (currentPlan?.score ?? 0) >= 40 ? '#F59E0B' : '#EF4444'
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const lastChatCard = (
    <Card className="h-full bg-card/60 backdrop-blur-xl border border-border/30 shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Última Conversa com a Sofia</CardTitle>
        <CardDescription>Interações sobre alimentação</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{lastSofiaInteraction ? new Date(lastSofiaInteraction).toLocaleString('pt-BR') : 'Sem interações recentes.'}</div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="default" onClick={() => setIntakeOpen(true)}><RefreshCw className="h-4 w-4 mr-1" /> Nova Sugestão</Button>
            <Sheet open={chatOpen} onOpenChange={setChatOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline">Abrir Chat</Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Conversa com a Sofia</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <SofiaChat user={user} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SuggestionsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sugestões Atuais</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenShoppingList}><ShoppingCart className="h-4 w-4 mr-1" /> Ver Lista de Compras</Button>
           <Button variant="outline" size="sm" onClick={handleDownloadPDF}><Printer className="h-4 w-4 mr-1" /> Imprimir Cardápio</Button>
          <Button variant="default" size="sm" onClick={handleSavePlan} disabled={!currentPlan}>Salvar no Perfil</Button>
        </div>
      </div>
      <div ref={planRef} className="space-y-3">
        {currentPlan ? (
          Object.entries(currentPlan.days).map(([day, meals]) => (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base capitalize flex items-center gap-2"><Utensils className="h-4 w-4" /> {day}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['breakfast','lunch','snack','dinner'] as Array<keyof DailyMeals>).map((mealKey) => {
                  const meal = meals[mealKey];
                  if (!meal) return (
                    <div key={mealKey} className="p-3 rounded border border-dashed text-sm text-muted-foreground">
                      {mealKey === 'breakfast' && 'Café da manhã não definido'}
                      {mealKey === 'lunch' && 'Almoço não definido'}
                      {mealKey === 'snack' && 'Lanche não definido'}
                      {mealKey === 'dinner' && 'Jantar não definido'}
                    </div>
                  );
                  return (
                    <Card key={mealKey} className="bg-muted/30">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-semibold">
                          {mealKey === 'breakfast' && 'Café da Manhã'}
                          {mealKey === 'lunch' && 'Almoço'}
                          {mealKey === 'snack' && 'Lanche'}
                          {mealKey === 'dinner' && 'Jantar'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm font-medium">{meal.name}</div>
                        {'calories_kcal' in meal && (
                          <div className="text-xs text-emerald-600 font-medium">{(meal as any).calories_kcal} kcal</div>
                        )}
                        {(meal as any).homemade_measure && (
                          <div className="text-xs text-muted-foreground">Medida caseira: {(meal as any).homemade_measure}</div>
                        )}
                        <div className="text-xs text-muted-foreground">{(meal as any).ingredients?.map((ing: any) => `${ing.name} ${ing.quantity}${ing.unit}`).join(', ')}</div>
                        {(meal as any).notes && (
                          <div className="text-xs text-muted-foreground">Obs.: {(meal as any).notes}</div>
                        )}
                        {(meal as any).options?.length ? (
                          <div className="pt-1">
                            <div className="text-xs font-semibold">Opções rápidas</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
                              {(meal as any).options.slice(0,4).map((opt: any, idx: number) => (
                                <div key={idx} className="text-xs border rounded px-2 py-1 bg-background/60">
                                  <span className="font-medium capitalize">{opt.category}</span>: {opt.name} {opt.quantity_g ? `• ${opt.quantity_g}g` : ''} {opt.homemade_measure ? `• ${opt.homemade_measure}` : ''}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        <div className="pt-2 flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => toast({ title: 'Ajuste de refeição', description: 'Fluxo de ajuste será habilitado após confirmação.' })}
                          >Ajustar Refeição</Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const swaps = (window as any).__sofia_swap_suggestions;
                              if (!swaps) { toast({ title: 'Sem opções agora', description: 'Gere um plano para ver sugestões.' }); return; }
                              setSwapMealKey(mealKey);
                              setSwapOpen(true);
                            }}
                          >Trocar por similar</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Nenhum cardápio atual. Clique em “Nova Sugestão” para gerar um plano personalizado.
              <div className="pt-2">
                <Button size="sm" onClick={() => setIntakeOpen(true)}><RefreshCw className="h-4 w-4 mr-1" /> Nova Sugestão</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const HistorySection = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Histórico de Cardápios</h3>
      {history.length === 0 ? (
        <Card><CardContent className="py-6 text-sm text-muted-foreground">Sem histórico por enquanto.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {history.map(item => (
            <Card key={item.id} className="">
              <CardContent className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium">{new Date(item.createdAt).toLocaleString('pt-BR')}</div>
                  <div className="text-xs text-muted-foreground capitalize">{item.type} • {(item.tags || []).join(', ') || 'Sem tags'}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Visualizar</Button>
                  <Button variant="outline" size="sm">Reaplicar</Button>
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF}><Printer className="h-4 w-4 mr-1" /> Imprimir</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const TrendsSection = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Tendências e Acompanhamento</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Frequência de Alimentos</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Gráfico será exibido aqui.</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Rotação de Ingredientes</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Indicador visual será exibido aqui.</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Evolução do Score</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Linha do tempo será exibida aqui.</CardContent>
        </Card>
      </div>
    </div>
  );

  const PreferencesSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Preferências Alimentares</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="alergias">Alergias / Intolerâncias</Label>
            <Textarea id="alergias" placeholder="Ex.: lactose, glúten" value={preferences.alergias} onChange={(e) => setPreferences(p => ({ ...p, alergias: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="restricoes">Restrições religiosas</Label>
            <Textarea id="restricoes" placeholder="Ex.: kosher, halal" value={preferences.restricoes} onChange={(e) => setPreferences(p => ({ ...p, restricoes: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dislikes">Alimentos que não gosta</Label>
            <Textarea id="dislikes" placeholder="Ex.: coentro, pimentão" value={preferences.dislikes} onChange={(e) => setPreferences(p => ({ ...p, dislikes: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="orcamento">Orçamento</Label>
            <div className="flex gap-2">
              {(['baixo','médio','alto'] as BudgetLevel[]).map(level => (
                <Button key={level} type="button" variant={preferences.orcamento === level ? 'default' : 'outline'} size="sm" onClick={() => setPreferences(p => ({ ...p, orcamento: level }))} className="capitalize">{level}</Button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="tempo">Tempo máximo de preparo (min)</Label>
            <Input id="tempo" type="number" min={5} max={240} value={preferences.tempoPreparoMin} onChange={(e) => setPreferences(p => ({ ...p, tempoPreparoMin: Number(e.target.value || 0) }))} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="utensilios">Utensílios disponíveis</Label>
            <Input id="utensilios" placeholder="Ex.: airfryer, micro-ondas, panela de pressão" value={preferences.utensilios} onChange={(e) => setPreferences(p => ({ ...p, utensilios: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSavePreferences}>Salvar Preferências</Button>
            <Button variant="outline" onClick={handleResetPreferences}>Redefinir Preferências</Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <ConfettiAnimation trigger={confettiTrigger} />
      <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-4">
        {/* Hero Tech Premium */}
        <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/60 backdrop-blur-xl shadow-glow">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(600px 200px at 20% -20%, rgba(124,58,237,0.25), transparent), radial-gradient(500px 200px at 80% 0%, rgba(34,211,238,0.18), transparent)' }} />
          <div className="relative p-5 sm:p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2 text-foreground">
                <Utensils className="h-6 w-6 text-accent" /> Sofia Nutricional
              </h1>
              <p className="text-sm text-muted-foreground">Planejamento inteligente com garantia de metas</p>
            </div>
            <div className="flex items-center gap-2">
              {currentPlan?.tags?.includes('Garantido') && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs">Garantido ✓</span>
              )}
              <Button onClick={() => setIntakeOpen(true)} className="bg-gradient-primary border border-primary/30 shadow-glow">Gerar agora</Button>
            </div>
          </div>
        </div>

        {/* Painel Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {statusCard}
          {scoreCard}
          {lastChatCard}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="sugestoes" className="w-full">
              <TabsList className="grid grid-cols-5 gap-2">
                <TabsTrigger value="sugestoes">Sugestões Atuais</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
                <TabsTrigger value="tendencias">Tendências</TabsTrigger>
                <TabsTrigger value="preferencias">Preferências</TabsTrigger>
                <TabsTrigger value="impressao">Impressão</TabsTrigger>
              </TabsList>
              <TabsContent value="sugestoes"><SuggestionsSection /></TabsContent>
              <TabsContent value="historico"><HistorySection /></TabsContent>
              <TabsContent value="tendencias"><TrendsSection /></TabsContent>
              <TabsContent value="preferencias"><PreferencesSection /></TabsContent>
              <TabsContent value="impressao">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Printer className="h-4 w-4" /> Imprimir Cardápio</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Revise seu cardápio e utilize os botões para imprimir ou exportar PDF.</p>
                    <div className="flex gap-2">
                      <Button variant="default" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Imprimir</Button>
                      <Button variant="outline" onClick={handleDownloadPDF}><Printer className="h-4 w-4 mr-1" /> Exportar PDF</Button>
                      <Button variant="outline" onClick={handleOpenHTML}>Abrir HTML</Button>
                      <Button variant="outline" onClick={handleDownloadHTML}>Baixar HTML</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          {/* Insights do Dr. Vital */}
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Insights do Dr. Vital</CardTitle>
                <CardDescription>Aderência, melhorias e destaques</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Em breve: integração com relatórios médicos e aderência ao plano nutricional.
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Modal para nova sugestão com formulário e chat compacto */}
        <SofiaMealSuggestionModal
          open={suggestionOpen}
          onOpenChange={setSuggestionOpen}
          user={user}
          targetCaloriesKcal={targetCalories}
          intakeAnswers={lastIntake}
          onPlanGenerated={async (plan: MealPlanGenerated) => {
            const today = plan.days['hoje'] || plan.days[Object.keys(plan.days)[0]];
            const toDailyMeals: DailyMeals = {
              breakfast: today?.breakfast,
              lunch: today?.lunch,
              snack: today?.afternoon_snack,
              dinner: today?.dinner,
            };
            setCurrentPlan({
              type: plan.type,
              createdAt: new Date().toISOString(),
              score: plan.score,
              tags: plan.tags,
              days: { hoje: toDailyMeals },
            });
            setLastSofiaInteraction(new Date().toISOString());
            // Persistência local (v2). Integração remota será conectada ao schema meal_plans.
            pushToHistory({
              type: plan.type,
              createdAt: new Date().toISOString(),
              score: plan.score,
              tags: plan.tags,
              days: { hoje: toDailyMeals },
            });
          }}
        />

        {/* Dialog de intake antes de gerar */}
        <Dialog open={intakeOpen} onOpenChange={setIntakeOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Converse com a Sofia</DialogTitle>
            </DialogHeader>
            <SofiaMealQnAChat
              targetCaloriesKcal={targetCalories}
              onComplete={(qna: MealQnAResult) => {
                setLastIntake({
                  objetivo: 'Plano diário',
                  alergias: qna.breakfast.restrictions,
                  restricoesReligiosas: '',
                  preferencias: `${qna.breakfast.description}; ${qna.lunch.description}; ${qna.dinner.description}`,
                  naoGosta: '',
                  rotinaHorarios: '',
                  orcamento: 'médio',
                  tempoPreparoMin: 30,
                  utensilios: ''
                });
                setIntakeOpen(false);
                // preferir planner determinístico; se falhar, cai para modal de sugestão
                generatePlanWithPlanner({
                  objetivo: 'Plano diário',
                  alergias: qna.breakfast.restrictions,
                  restricoesReligiosas: '',
                  preferencias: `${qna.breakfast.description}; ${qna.lunch.description}; ${qna.dinner.description}`,
                  naoGosta: '',
                  rotinaHorarios: '',
                  orcamento: 'médio',
                  tempoPreparoMin: 30,
                  utensilios: ''
                });
              }}
            />
          </DialogContent>
        </Dialog>
        {/* Modal de Substituições Inteligentes */}
        <MealSwapModal
          open={swapOpen}
          onOpenChange={setSwapOpen}
          meal={swapMealKey ? (currentPlan?.days['hoje'] as any)?.[swapMealKey] : undefined}
          swapSuggestions={(window as any).__sofia_swap_suggestions || null}
          onApply={(updated) => {
            if (!currentPlan || !swapMealKey) return;
            const copy: MealPlan = JSON.parse(JSON.stringify(currentPlan));
            (copy.days['hoje'] as any)[swapMealKey] = updated as any;
            setCurrentPlan(copy);
            toast({ title: 'Substituição aplicada', description: 'Mantivemos as calorias aproximadas.' });
          }}
        />
        {/* Modal Lista de Compras */}
        <Dialog open={shoppingOpen} onOpenChange={setShoppingOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lista de Compras (1 semana)</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {aggregatedShoppingList().length === 0 ? (
                <div className="text-sm text-muted-foreground">Gere e salve um cardápio para ver a lista de compras.</div>
              ) : (
                Object.entries(aggregatedShoppingList().reduce((acc: any, item) => {
                  (acc[item.category] ||= []).push(item);
                  return acc;
                }, {} as Record<string, any[]>)).map(([cat, items]) => (
                  <div key={cat} className="border rounded-md">
                    <div className="px-3 py-2 text-xs font-semibold bg-muted/40">{cat}</div>
                    <div className="divide-y">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 text-sm">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-muted-foreground">{Math.round(item.quantity)} {item.unit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => window.print()}>Imprimir</Button>
              <Button variant="default" onClick={downloadShoppingCSV}>Baixar CSV</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SofiaNutricionalPage;


