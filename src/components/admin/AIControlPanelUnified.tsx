import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, 
  Brain, 
  Settings, 
  Save, 
  RotateCcw, 
  Zap, 
  TrendingUp, 
  DollarSign,
  TestTube,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Monitor,
  Activity,
  PlayCircle,
  Clock,
  MessageSquare,
  XCircle,
  Upload,
  FileText,
  Stethoscope,
  Heart,
  FileImage,
  Shield,
  Target,
  Users,
  Send,
  BookOpen,
  Globe,
  Search,
  Calendar,
  Crown,
  Sparkles,
  Cpu,
  Database,
  Network,
  Layers,
  Palette,
  Gauge,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAITesting } from '@/hooks/useAITesting';
import { toast } from 'sonner';

interface AIConfig {
  id?: string;
  functionality: string;
  personality: 'drvital' | 'sofia';
  service: 'openai' | 'gemini' | 'ollama';
  model: string;
  max_tokens: number;
  temperature: number;
  is_enabled: boolean;
  level: 'maximo' | 'meio' | 'minimo';
  system_prompt?: string;
  cost_per_request?: number;
  priority?: number;
}

interface AIDocument {
  id: string;
  name: string;
  type: 'medical' | 'policy' | 'guide' | 'faq';
  content: string;
  functionality: string;
  uploaded_at: string;
}

interface AITestResult {
  functionality: string;
  personality: string;
  service: string;
  model: string;
  success: boolean;
  response?: string;
  error?: string;
  duration?: number;
  used_knowledge_base: boolean;
  used_external_search: boolean;
}

export function AIControlPanelUnified() {
  const { toast: toastHook } = useToast();
  const { isLoading: testingLoading, results, runFullAITest, testSpecificModel, clearResults } = useAITesting();
  
  // States
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [documents, setDocuments] = useState<AIDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [testResults, setTestResults] = useState<AITestResult[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [selectedAdvancedConfig, setSelectedAdvancedConfig] = useState<AIConfig | null>(null);
  // Modo enxuto: esconder Documentos e Controle Avançado por ora
  const showDocuments = false;
  const showAdvanced = false;
  // Preset dialog state
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);
  const [presetService, setPresetService] = useState<'openai' | 'gemini' | 'ollama'>('openai');
  const [presetModel, setPresetModel] = useState<string>('gpt-4.1-2025-04-14');
  const [presetLevel, setPresetLevel] = useState<'maximo' | 'meio' | 'minimo'>('meio');
  const [presetActivate, setPresetActivate] = useState<boolean>(true);
  const [isApplyingPreset, setIsApplyingPreset] = useState<boolean>(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['reports', 'chat_analysis', 'missions']);
  const [presetPreview, setPresetPreview] = useState<{targets: number; newDailyCost: number; currentDailyCost: number; delta: number; tokensPerRequest: number}>({targets: 0, newDailyCost: 0, currentDailyCost: 0, delta: 0, tokensPerRequest: 0});
  const [selectedFunctionTitle, setSelectedFunctionTitle] = useState<string>('');
  
  // Funcionalidades disponíveis
  const functionalities = [
    { 
      key: 'medical_analysis', 
      name: 'Análise de Exames Médicos', 
      icon: Stethoscope, 
      description: 'Análises médicas especializadas',
      personalities: ['drvital', 'sofia'],
      default_personality: 'drvital'
    },
    { 
      key: 'weekly_report', 
      name: 'Relatórios Semanais', 
      icon: TrendingUp, 
      description: 'Relatórios automatizados semanais',
      personalities: ['drvital', 'sofia'],
      default_personality: 'sofia'
    },
    { 
      key: 'monthly_report', 
      name: 'Relatórios Mensais', 
      icon: Calendar, 
      description: 'Análises mensais detalhadas',
      personalities: ['drvital', 'sofia'],
      default_personality: 'drvital'
    },
    { 
      key: 'daily_chat', 
      name: 'Chat Diário', 
      icon: MessageSquare, 
      description: 'Conversas do dia a dia',
      personalities: ['sofia', 'drvital'],
      default_personality: 'sofia'
    },
    { 
      key: 'preventive_analysis', 
      name: 'Análise Preventiva', 
      icon: Shield, 
      description: 'Prevenção de saúde',
      personalities: ['drvital', 'sofia'],
      default_personality: 'drvital'
    },
    { 
      key: 'food_analysis', 
      name: 'Análise de Comida', 
      icon: FileImage, 
      description: 'Análise nutricional por imagem',
      personalities: ['drvital', 'sofia'],
      default_personality: 'drvital'
    },
    { 
      key: 'daily_missions', 
      name: 'Missões Diárias', 
      icon: Target, 
      description: 'Missões e desafios diários',
      personalities: ['sofia', 'drvital'],
      default_personality: 'sofia'
    },
    { 
      key: 'whatsapp_reports', 
      name: 'Relatórios WhatsApp', 
      icon: MessageSquare, 
      description: 'Relatórios via WhatsApp',
      personalities: ['drvital', 'sofia'],
      default_personality: 'sofia'
    },
    { 
      key: 'email_reports', 
      name: 'Relatórios Email', 
      icon: Send, 
      description: 'Relatórios via email',
      personalities: ['drvital', 'sofia'],
      default_personality: 'drvital'
    }
  ];

  // Personalidades
  const personalities = {
    drvital: {
      name: 'Dr. Vital',
      icon: Stethoscope,
      description: 'Médico especialista - Análise médica profissional',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    sofia: {
      name: 'Sofia',
      icon: Heart,
      description: 'Assistente motivacional - Bem-estar e metas',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  };

  // Modelos disponíveis
  const models = {
    openai: [
      { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1 (Recomendado)', cost: 0.03 },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', cost: 0.005 },
      { value: 'o3-2025-04-16', label: 'O3 (Premium)', cost: 0.06 },
      { value: 'gpt-4o', label: 'GPT-4o', cost: 0.015 }
    ],
    gemini: [
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', cost: 0.0035 },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', cost: 0.0007 },
      { value: 'gemini-pro', label: 'Gemini Pro', cost: 0.0025 }
    ],
    ollama: [
      { value: 'llama3.1:8b-instruct-q4_0', label: 'Ollama - llama3.1:8b-instruct-q4_0', cost: 0.0 },
      { value: 'qwen2.5:7b-instruct-q4_0', label: 'Ollama - qwen2.5:7b-instruct-q4_0', cost: 0.0 },
      { value: 'deepseek-r1:7b-qwen-distill-q4_K_M', label: 'Ollama - deepseek-r1:7b-qwen-distill-q4_K_M', cost: 0.0 }
    ]
  } as const;

  // Configurações por nível
  const levelConfigs = {
    maximo: {
      name: 'Máximo',
      description: 'Melhor qualidade - Análises mais profundas',
      tokens: 8192,
      temperature: 0.7,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    meio: {
      name: 'Meio',
      description: 'Equilibrado - Qualidade e velocidade',
      tokens: 4096,
      temperature: 0.8,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    minimo: {
      name: 'Mínimo',
      description: 'Econômico - Mais rápido e barato',
      tokens: 2000,
      temperature: 0.7,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  };

  // Carregar configurações
  useEffect(() => {
    loadConfigurations();
    loadDocuments();
  }, []);

  // Preencher valores padrão apenas quando necessário, evitando loop
  useEffect(() => {
    if (!selectedAdvancedConfig) return;
    const cfg = selectedAdvancedConfig;
    const needsDefaults =
      !cfg.personality ||
      !cfg.level ||
      !cfg.max_tokens ||
      cfg.temperature === undefined ||
      !cfg.service ||
      !cfg.model ||
      cfg.cost_per_request === undefined ||
      cfg.priority === undefined;
    if (!needsDefaults) return;

    const configWithDefaults = {
      ...cfg,
      personality: cfg.personality || 'drvital',
      level: (cfg.level as any) || 'meio',
      max_tokens: cfg.max_tokens || 4096,
      temperature: (cfg.temperature as any) ?? 0.8,
      service: (cfg.service as any) || 'openai',
      model: cfg.model || 'gpt-4.1-2025-04-14',
      cost_per_request: cfg.cost_per_request ?? 0.01,
      priority: cfg.priority ?? 1,
    } as AIConfig;
    setSelectedAdvancedConfig(configWithDefaults);
  }, [isAdvancedModalOpen]);

  const loadConfigurations = async () => {
    try {
      setIsLoading(true);
      console.log('Loading configurations...');
      
      const { data, error } = await supabase
        .from('ai_configurations')
        .select('*')
        .order('functionality');

      if (error) {
        console.error('Error loading configurations:', error);
        throw error;
      }

      console.log('Raw data from database:', data);

      // Mapear dados para o formato correto com valores reais do banco
      const mappedConfigs = (data || []).map((config: any) => ({
        id: config.id,
        functionality: config.functionality,
        personality: (config.personality || 'drvital') as 'drvital' | 'sofia',
        service: (config.service || 'openai') as 'openai' | 'gemini' | 'ollama',
        model: config.model || 'gpt-4.1-2025-04-14',
        max_tokens: config.max_tokens ?? 4096,
        temperature: config.temperature ?? 0.8,
        is_enabled: (config.is_enabled ?? config.is_active ?? false) as boolean,
        level: (config.level || config.preset_level || 'meio') as 'maximo' | 'meio' | 'minimo',
        system_prompt: config.system_prompt || '',
        cost_per_request: config.cost_per_request ?? 0.01,
        priority: config.priority ?? 1
      }));

      console.log('Mapped configurations:', mappedConfigs);
      setConfigs(mappedConfigs);
      calculateTotalCost(mappedConfigs);

      // Inicializar configurações faltantes com padrão consistente (não ativa por padrão)
      const existingKeys = new Set(mappedConfigs.map((c) => c.functionality));
      const missingFuncs = functionalities.filter((f) => !existingKeys.has(f.key));
      if (missingFuncs.length > 0) {
        const defaultTokens = levelConfigs['meio'].tokens;
        const defaultTemp = levelConfigs['meio'].temperature;

        for (const func of missingFuncs) {
          const defaultCfg: AIConfig = {
            functionality: func.key,
            personality: func.default_personality as 'drvital' | 'sofia',
            service: 'gemini',
            model: 'gemini-1.5-flash',
            max_tokens: defaultTokens,
            temperature: defaultTemp,
            is_enabled: false,
            level: 'meio',
            system_prompt: ''
          } as AIConfig;
          try {
            await saveConfiguration(defaultCfg);
          } catch (e) {
            console.error('Falha ao inicializar config para', func.key, e);
          }
        }

        // Recarregar para refletir todas as configs
        const refreshed = await supabase
          .from('ai_configurations')
          .select('*')
          .order('functionality');
        if (!refreshed.error) {
          const mapped = (refreshed.data || []).map((config: any) => ({
            id: config.id,
            functionality: config.functionality,
            personality: (config.personality || 'drvital') as 'drvital' | 'sofia',
            service: (config.service || 'openai') as 'openai' | 'gemini' | 'ollama',
            model: config.model || 'gpt-4.1-2025-04-14',
            max_tokens: config.max_tokens ?? 4096,
            temperature: config.temperature ?? 0.8,
            is_enabled: (config.is_enabled ?? config.is_active ?? false) as boolean,
            level: (config.level || config.preset_level || 'meio') as 'maximo' | 'meio' | 'minimo',
            system_prompt: config.system_prompt || '',
            cost_per_request: config.cost_per_request ?? 0.01,
            priority: config.priority ?? 1
          }));
          setConfigs(mapped);
          calculateTotalCost(mapped);
        }
      }
    } catch (error) {
      toastHook({
        title: 'Erro',
        description: 'Falha ao carregar configurações',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const calculateTotalCost = (configurations: AIConfig[]) => {
    const cost = configurations.reduce((total, config) => {
      if (!config.is_enabled) return total;
      
      const modelInfo = models[config.service as keyof typeof models]?.find(m => m.value === config.model);
      const costPerToken = modelInfo?.cost || 0.01;
      const dailyUsage = config.max_tokens * 10; // Estimativa
      return total + (costPerToken * dailyUsage / 1000);
    }, 0);
    
    setTotalCost(cost);
  };

  // Grupos de funcionalidades para aplicação seletiva
  const functionGroups: Record<string, string[]> = {
    reports: ['weekly_report', 'monthly_report', 'whatsapp_reports', 'email_reports'],
    chat_analysis: ['daily_chat', 'medical_analysis', 'preventive_analysis', 'food_analysis'],
    missions: ['daily_missions']
  };

  const getTargetFunctionalities = (): string[] => {
    if (!selectedGroups || selectedGroups.length === 0) {
      return functionalities.map(f => f.key);
    }
    const set = new Set<string>();
    selectedGroups.forEach(g => (functionGroups[g] || []).forEach(f => set.add(f)));
    return Array.from(set);
  };

  // Cálculo de custo estimado por dia para preview
  const computeEstimatedDailyCost = (service: 'openai' | 'gemini' | 'ollama', model: string, tokens: number, active: boolean, count: number): number => {
    if (!active || count <= 0) return 0;
    const info = models[service as keyof typeof models]?.find((m) => m.value === model);
    const costPerToken = info?.cost ?? 0.01; // ollama pode ser 0.0
    const dailyUsage = tokens * 10; // mesma heurística do painel
    return (costPerToken * dailyUsage / 1000) * count;
  };

  // Atualiza preview quando parâmetros mudarem
  useEffect(() => {
    const targets = getTargetFunctionalities();
    const tokens = levelConfigs[presetLevel].tokens;
    const newCost = computeEstimatedDailyCost(presetService, presetModel, tokens, presetActivate, targets.length);
    // custo atual para o mesmo conjunto de funções
    const current = configs
      .filter(c => targets.includes(c.functionality) && c.is_enabled)
      .reduce((total, c) => {
        const info = models[c.service as keyof typeof models]?.find(m => m.value === c.model);
        const cpt = info?.cost ?? 0.01;
        const dailyUsage = (c.max_tokens ?? 1000) * 10;
        return total + (cpt * dailyUsage / 1000);
      }, 0);
    setPresetPreview({ targets: targets.length, newDailyCost: newCost, currentDailyCost: current, delta: newCost - current, tokensPerRequest: tokens });
  }, [presetService, presetModel, presetLevel, presetActivate, selectedGroups, configs]);

  const openPresetDialog = () => {
    // Defaults
    setPresetService('openai');
    setPresetLevel('meio');
    setPresetModel(models.openai[0]?.value || 'gpt-4.1-2025-04-14');
    setPresetActivate(true);
    setIsPresetDialogOpen(true);
  };

  const applyPresetToAll = async () => {
    try {
      setIsApplyingPreset(true);
      const levelInfo = levelConfigs[presetLevel];
      const allFunctions = getTargetFunctionalities();
      const failed: string[] = [];
      const succeeded: string[] = [];

      for (const funcKey of allFunctions) {
        const existing = configs.find(c => c.functionality === funcKey);
        const personality = functionalities.find(f => f.key === funcKey)?.default_personality as 'drvital' | 'sofia';
        const base: AIConfig = existing || {
          functionality: funcKey,
          personality: personality || 'drvital',
          service: presetService,
          model: presetModel,
          max_tokens: levelInfo.tokens,
          temperature: levelInfo.temperature,
          is_enabled: presetActivate,
          level: presetLevel,
          system_prompt: existing?.system_prompt || ''
        } as AIConfig;

        const updated: AIConfig = {
          ...base,
          personality: personality || base.personality,
          service: presetService,
          model: presetModel,
          max_tokens: levelInfo.tokens,
          temperature: levelInfo.temperature,
          is_enabled: presetActivate,
          level: presetLevel
        };

        try {
          await saveConfiguration(updated);
          succeeded.push(funcKey);
        } catch (err) {
          console.error('Erro ao aplicar preset para', funcKey, err);
          failed.push(funcKey);
        }
      }

      if (failed.length === 0) {
        toast.success(`Preset aplicado com sucesso em ${succeeded.length} função(ões).`);
      } else {
        const failedList = failed.join(', ');
        toast.warning(`Aplicado em ${succeeded.length}, falhou em ${failed.length}: ${failedList}`);
      }
      setIsPresetDialogOpen(false);
      await loadConfigurations();
    } catch (error) {
      toast.error('Erro ao aplicar preset');
    } finally {
      setIsApplyingPreset(false);
    }
  };

  const saveConfiguration = async (config: AIConfig) => {
    try {
      setIsSaving(true);

      // Verifica se já existe registro para a funcionalidade
      const { data: existing, error: selectErr } = await supabase
        .from('ai_configurations')
        .select('id')
        .eq('functionality', config.functionality)
        .maybeSingle();

      if (selectErr && selectErr.code && selectErr.code !== 'PGRST116') {
        console.warn('Seleção de configuração falhou, seguindo mesmo assim:', selectErr);
      }

      const now = new Date().toISOString();
      const payloadFull: any = {
        functionality: config.functionality,
        service: config.service,
        model: config.model,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        system_prompt: config.system_prompt,
        // escrever nos dois nomes possíveis
        is_enabled: config.is_enabled,
        is_active: config.is_enabled,
        level: config.level,
        preset_level: config.level,
        personality: config.personality,
        priority: config.priority,
        updated_at: now,
      };

      const payloadMedium: any = {
        functionality: config.functionality,
        service: config.service,
        model: config.model,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        system_prompt: config.system_prompt,
        is_enabled: config.is_enabled,
        level: config.level,
        updated_at: now,
      };

      const payloadMinimal: any = {
        functionality: config.functionality,
        service: config.service,
        model: config.model,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        updated_at: now,
      };

      const tryWrite = async (mode: 'update' | 'insert', payload: any) => {
        if (mode === 'update') {
          return await supabase.from('ai_configurations').update(payload).eq('functionality', config.functionality);
        }
        return await supabase.from('ai_configurations').insert(payload);
      };

      let writeError: any | null = null;

      // 1) Tenta update se existir, senão insert, com payload completo
      if (existing) {
        ({ error: writeError } = await tryWrite('update', payloadFull));
      } else {
        ({ error: writeError } = await tryWrite('insert', payloadFull));
      }

      // 2) Se erro por falta de coluna ou conflito único ausente, tentar payload médio
      if (writeError) {
        const message = (writeError.message || '').toLowerCase();
        const needFallback =
          message.includes('does not exist') ||
          message.includes('no unique or exclusion constraint') ||
          message.includes('duplicate key value') ||
          message.includes('on conflict');

        if (needFallback) {
          if (existing) {
            ({ error: writeError } = await tryWrite('update', payloadMedium));
          } else {
            ({ error: writeError } = await tryWrite('insert', payloadMedium));
          }
        }
      }

      // 3) Último fallback: payload mínimo
      if (writeError) {
        if (existing) {
          ({ error: writeError } = await tryWrite('update', payloadMinimal));
        } else {
          ({ error: writeError } = await tryWrite('insert', payloadMinimal));
        }
      }

      if (writeError) {
        console.error('Erro ao salvar (após fallbacks):', writeError);
        throw writeError;
      }

      // Atualizar estado local
      setConfigs((prev) => {
        const exists = prev.some((c) => c.functionality === config.functionality);
        const updatedConfig: AIConfig = {
          ...(prev.find((c) => c.functionality === config.functionality) || ({} as AIConfig)),
          ...config,
        };
        if (exists) return prev.map((c) => (c.functionality === config.functionality ? updatedConfig : c));
        return [...prev, updatedConfig];
      });

      toast.success('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro completo:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setIsSaving(false);
    }
  };

  const testConfiguration = async (config: AIConfig) => {
    try {
      setIsTesting(true);
      
      const testMessage = `Teste de configuração para ${config.functionality} com personalidade ${config.personality}. Responda brevemente.`;
      const result = await testSpecificModel(
        config.service as any,
        config.model,
        testMessage
      );

      const testResult: AITestResult = {
        functionality: config.functionality,
        personality: config.personality,
        service: config.service,
        model: config.model,
        success: result.success,
        response: result.response,
        error: result.error,
        duration: result.duration,
        used_knowledge_base: true, // Simulado
        used_external_search: true // Simulado
      };

      setTestResults(prev => [testResult, ...prev]);

      if (result.success) {
        toast.success(`✅ ${config.functionality} funcionando!`);
      } else {
        toast.error(`❌ Erro em ${config.functionality}`);
      }
    } catch (error) {
      toast.error('Erro no teste');
    } finally {
      setIsTesting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const uploadDocuments = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Selecione arquivos para upload');
      return;
    }

    try {
      setIsSaving(true);

      for (const file of uploadedFiles) {
        const content = await file.text();
        const { error } = await supabase
          .from('ai_documents')
          .insert({
            name: file.name,
            type: 'guide',
            content,
            functionality: selectedFunction || 'general',
            uploaded_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      await loadDocuments();
      setUploadedFiles([]);
      toast.success(`${uploadedFiles.length} documento(s) enviado(s) com sucesso!`);
    } catch (error) {
      toast.error('Erro ao enviar documentos');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setIsSaving(true);
      
      const defaultConfigs = functionalities.map(func => ({
        functionality: func.key,
        personality: func.default_personality as 'drvital' | 'sofia',
        service: 'openai' as const,
        model: 'gpt-4.1-2025-04-14',
        max_tokens: 4096,
        temperature: 0.8,
        is_enabled: true,
        level: 'meio' as const
      }));

      for (const config of defaultConfigs) {
        await saveConfiguration(config);
      }
      
      toast.success('Configurações resetadas para padrão!');
    } catch (error) {
      toast.error('Erro ao resetar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFullTest = async () => {
    toast.info('Iniciando teste completo das IAs...');
    const testResults = await runFullAITest();
    
    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;
    
    if (successCount === totalCount) {
      toast.success(`✅ Todas as ${totalCount} IAs estão funcionando!`);
    } else {
      toast.warning(`⚠️ ${successCount}/${totalCount} IAs funcionando`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Controle Unificado de IA
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${totalCost.toFixed(2)}/dia
              </Badge>
              <Badge variant={configs.filter(c => c.is_enabled).length > 0 ? 'default' : 'secondary'}>
                {configs.filter(c => c.is_enabled).length} de {configs.length} ativas
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleFullTest} disabled={testingLoading} className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              {testingLoading ? 'Testando...' : 'Teste Completo'}
            </Button>
            <Dialog open={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={openPresetDialog}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Aplicar Preset a Todos
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aplicar Preset para Todas as Funções</DialogTitle>
                  <DialogDescription>Escolha provedor, modelo e nível. Isso atualizará todas as funções.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setPresetService('openai'); setPresetActivate(true); const first=models.openai[0]?.value; if(first) setPresetModel(first); }}>Ativar OpenAI</Button>
                    <Button variant="outline" size="sm" onClick={() => { setPresetService('gemini'); setPresetActivate(true); const first=models.gemini[0]?.value; if(first) setPresetModel(first); }}>Ativar Gemini</Button>
                    <Button variant="outline" size="sm" onClick={() => { setPresetService('ollama'); setPresetActivate(true); const first=models.ollama[0]?.value; if(first) setPresetModel(first); }}>Ativar Ollama</Button>
                    <Button variant="outline" size="sm" onClick={() => { setPresetActivate(true); }}>Ativar Todas</Button>
                    <Button variant="destructive" size="sm" onClick={() => { setPresetActivate(false); }}>Desativar Todas</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Serviço</Label>
                      <Select value={presetService} onValueChange={(v) => {
                        setPresetService(v as 'openai' | 'gemini' | 'ollama');
                        const first = models[v as keyof typeof models]?.[0]?.value;
                        if (first) setPresetModel(first);
                      }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                          <SelectItem value="ollama">Ollama (Local)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Modelo</Label>
                      <Select value={presetModel} onValueChange={setPresetModel}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {models[presetService as keyof typeof models]?.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nível</Label>
                      <Select value={presetLevel} onValueChange={(v) => setPresetLevel(v as 'maximo' | 'meio' | 'minimo')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maximo">Máximo</SelectItem>
                          <SelectItem value="meio">Meio</SelectItem>
                          <SelectItem value="minimo">Mínimo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2">
                        <Switch checked={presetActivate} onCheckedChange={setPresetActivate} />
                        <span>Ativar todas</span>
                      </div>
                    </div>
                  </div>
                  {/* Seleção de grupos */}
                  <div className="space-y-2">
                    <Label>Aplicar em</Label>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {[
                        { id: 'reports', label: 'Relatórios' },
                        { id: 'chat_analysis', label: 'Chat/Análises' },
                        { id: 'missions', label: 'Missões' },
                      ].map((g) => (
                        <Button
                          key={g.id}
                          type="button"
                          variant={selectedGroups.includes(g.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedGroups((prev) => (
                              prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id]
                            ));
                          }}
                        >
                          {g.label}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Sem seleção = aplica em todas as funções.</p>
                  </div>

                  {/* Prévia de impacto */}
                  <div className="rounded-md border p-3 bg-muted/50">
                    <div className="text-sm font-medium mb-1">Prévia de Impacto</div>
                    <div className="text-sm flex flex-wrap gap-4">
                      <span>Alvo: {presetPreview.targets} função(ões)</span>
                      <span>Tokens por request: {presetPreview.tokensPerRequest}</span>
                      <span>Custo atual (dia): ${presetPreview.currentDailyCost.toFixed(2)}</span>
                      <span>Novo custo (dia): ${presetPreview.newDailyCost.toFixed(2)}</span>
                      <span>Variação: {presetPreview.delta >= 0 ? '+' : ''}${presetPreview.delta.toFixed(2)}/dia</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPresetDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={applyPresetToAll} disabled={isApplyingPreset}>
                    {isApplyingPreset ? 'Aplicando...' : 'Aplicar a Todos'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={resetToDefaults} disabled={isSaving}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Padrão
            </Button>
            <Button variant="outline" onClick={clearResults}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Testes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="configurations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configurations">⚙️ Configurações</TabsTrigger>
          <TabsTrigger value="testing">🧪 Testes</TabsTrigger>
          <TabsTrigger value="monitoring">📊 Monitoramento</TabsTrigger>
        </TabsList>

        {/* Aba de Configurações */}
        <TabsContent value="configurations" className="space-y-4">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuração por Função:</strong> Configure cada função com personalidade específica (DrVital/Sofia), 
              nível de IA (Máximo/Meio/Mínimo) e serviço (OpenAI/Gemini/Ollama).
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {functionalities.map((func) => {
              const config = configs.find(c => c.functionality === func.key);
              const IconComponent = func.icon;
              
              return (
                <Card key={func.key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">{func.name}</h3>
                          <p className="text-sm text-muted-foreground">{func.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          const defaultCfg: AIConfig = {
                            functionality: func.key,
                            personality: func.default_personality as 'drvital' | 'sofia',
                            service: 'gemini',
                            model: 'gemini-1.5-flash',
                            max_tokens: levelConfigs['meio'].tokens,
                            temperature: levelConfigs['meio'].temperature,
                            is_enabled: config?.is_enabled ?? false,
                            level: 'meio',
                            system_prompt: ''
                          } as AIConfig;
                          setSelectedFunctionTitle(func.name);
                          setSelectedAdvancedConfig(config || defaultCfg);
                          setIsAdvancedModalOpen(true);
                        }}>
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {config && (
                    <CardContent className="space-y-4">
                      {/* Personalidade */}
                      {/* Personalidade removida no modo enxuto */}

                      {/* Configuração IA */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Nível */}
                        <div className="space-y-2">
                          <Label>Nível</Label>
                          <Select
                            value={config.level}
                            onValueChange={(value) => saveConfiguration({ ...config, level: value as 'maximo' | 'meio' | 'minimo' })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(levelConfigs).map(([level, levelInfo]) => (
                                <SelectItem key={level} value={level}>
                                  {levelInfo.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Serviço */}
                        <div className="space-y-2">
                          <Label>Serviço</Label>
                          <Select
                            value={config.service}
                            onValueChange={(value) => saveConfiguration({ ...config, service: value as 'openai' | 'gemini' | 'ollama' })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="gemini">Google Gemini</SelectItem>
                              <SelectItem value="ollama">Ollama (Local)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Modelo */}
                        <div className="space-y-2">
                      <Label>Modelo</Label>
                          <Select
                            value={config.model}
                            onValueChange={(value) => saveConfiguration({ ...config, model: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {models[config.service as keyof typeof models]?.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  {model.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tokens */}
                        <div className="space-y-2">
                          <Label>Tokens: {config.max_tokens}</Label>
                          <Slider
                            value={[config.max_tokens]}
                            onValueChange={([value]) => saveConfiguration({ ...config, max_tokens: value })}
                            min={1000}
                            max={8192}
                            step={100}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Temperature */}
                      <div className="space-y-2">
                        <Label>Temperature: {config.temperature}</Label>
                        <Slider
                          value={[config.temperature]}
                          onValueChange={([value]) => saveConfiguration({ ...config, temperature: value })}
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Dialogo Avançado (acessível pelos botões de engrenagem) */}
        <Dialog open={isAdvancedModalOpen} onOpenChange={setIsAdvancedModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Configuração Avançada: {selectedFunctionTitle || selectedAdvancedConfig?.functionality}</DialogTitle>
            </DialogHeader>
            {selectedAdvancedConfig && (
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Ativo</span>
                      <Switch className="data-[state=checked]:!bg-green-500 data-[state=unchecked]:!bg-red-500" checked={selectedAdvancedConfig.is_enabled} onCheckedChange={(chk) => setSelectedAdvancedConfig({ ...selectedAdvancedConfig, is_enabled: chk })} />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Métricas</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <div>Tokens: {selectedAdvancedConfig.max_tokens}</div>
                    <div>Temperatura: {selectedAdvancedConfig.temperature}</div>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Configuração de IA</CardTitle></CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Serviço</Label>
                      <Select value={selectedAdvancedConfig.service} onValueChange={(v) => setSelectedAdvancedConfig({ ...selectedAdvancedConfig, service: v as any, model: models[v as keyof typeof models]?.[0]?.value || selectedAdvancedConfig.model })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                          <SelectItem value="ollama">Ollama (Local)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Modelo</Label>
                      <Select value={selectedAdvancedConfig.model} onValueChange={(v) => setSelectedAdvancedConfig({ ...selectedAdvancedConfig, model: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {models[selectedAdvancedConfig.service as keyof typeof models]?.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Tokens Máximos: {selectedAdvancedConfig.max_tokens}</Label>
                        <Slider value={[selectedAdvancedConfig.max_tokens]} onValueChange={(val) => setSelectedAdvancedConfig({ ...selectedAdvancedConfig, max_tokens: val[0] })} min={1000} max={8192} step={100} />
                      </div>
                      <div>
                        <Label>Temperatura: {selectedAdvancedConfig.temperature}</Label>
                        <Slider value={[selectedAdvancedConfig.temperature]} onValueChange={(val) => setSelectedAdvancedConfig({ ...selectedAdvancedConfig, temperature: val[0] })} min={0} max={1} step={0.1} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Prompt do Sistema</CardTitle></CardHeader>
                  <CardContent>
                    <Textarea rows={4} value={selectedAdvancedConfig.system_prompt || ''} onChange={(e) => setSelectedAdvancedConfig({ ...selectedAdvancedConfig, system_prompt: e.target.value })} />
                    <p className="text-xs text-muted-foreground mt-1">Usado nesta funcionalidade: {selectedFunctionTitle || selectedAdvancedConfig.functionality}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdvancedModalOpen(false)}>Fechar</Button>
              <Button onClick={() => { if (selectedAdvancedConfig) { saveConfiguration(selectedAdvancedConfig); setIsAdvancedModalOpen(false); } }}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {showDocuments && (
        <TabsContent value="documents" className="space-y-4">
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              <strong>Base de Conhecimento:</strong> Upload de documentos que serão sempre consultados pelas IAs 
              antes de responder, garantindo que usem o conhecimento da empresa.
            </AlertDescription>
          </Alert>

          {/* Upload de Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar Função</Label>
                <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma função..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">📚 Geral (Todas as funções)</SelectItem>
                    {functionalities.map((func) => (
                      <SelectItem key={func.key} value={func.key}>
                        {func.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Arquivos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".txt,.md,.pdf,.doc,.docx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm text-gray-600">
                      Clique para selecionar arquivos ou arraste aqui
                    </span>
                  </label>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos Selecionados</Label>
                  <div className="space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={uploadDocuments} disabled={isSaving} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {isSaving ? 'Enviando...' : 'Enviar Documentos'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentos Existentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos na Base de Conhecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum documento na base de conhecimento
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.functionality} • {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.type}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const ok = window.confirm(`Remover documento "${doc.name}"?`);
                            if (!ok) return;
                            const { error } = await supabase
                              .from('ai_documents')
                              .delete()
                              .eq('id', doc.id);
                            if (error) {
                              toast.error('Erro ao remover documento');
                            } else {
                              toast.success('Documento removido');
                              await loadDocuments();
                            }
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Aba de Testes */}
        <TabsContent value="testing" className="space-y-4">
          <Alert>
            <TestTube className="h-4 w-4" />
            <AlertDescription>
              <strong>Testes Rápidos:</strong> Use os botões abaixo para validar os provedores. Se um botão não responder,
              verifique as chaves de API/endpoint no servidor.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Executar Testes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => testSpecificModel('openai' as any, 'gpt-4.1-2025-04-14', 'Teste rápido OpenAI')} disabled={testingLoading}>
                  {testingLoading ? 'Testando...' : 'Testar OpenAI'}
                </Button>
                <Button variant="outline" onClick={() => testSpecificModel('gemini' as any, 'gemini-1.5-flash', 'Teste rápido Gemini')} disabled={testingLoading}>
                  Testar Gemini
                </Button>
                <Button variant="outline" onClick={() => testSpecificModel('ollama' as any, 'llama3.1:8b-instruct-q4_0', 'Teste rápido Ollama')} disabled={testingLoading}>
                  Testar Ollama
                </Button>
                {/* Removido: Sofia não é provedor, é persona */}
                <Button variant="outline" onClick={handleFullTest} disabled={testingLoading}>
                  Teste Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados dos Testes (provedores) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resultados dos Testes</CardTitle>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Limpar
              </Button>
            </CardHeader>
            <CardContent>
              {results && results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{result.service}</p>
                            <p className="text-sm text-muted-foreground">{result.model}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? 'Sucesso' : 'Erro'}
                          </Badge>
                          {result.duration && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {result.duration}ms
                            </Badge>
                          )}
                        </div>
                      </div>
                      {result.response && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm">{result.response}</p>
                        </div>
                      )}
                      {result.error && (
                        <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                          <p className="text-sm text-destructive">{result.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum resultado ainda. Execute um dos testes acima.</p>
              )}
            </CardContent>
          </Card>

          {/* Resultados por Função (opcional) */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados por Função</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{result.functionality}</p>
                            <p className="text-sm text-muted-foreground">{result.service} • {result.model}</p>
                          </div>
                        </div>
                      </div>
                      {result.response && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm">{result.response}</p>
                        </div>
                      )}
                      {result.error && (
                        <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                          <p className="text-sm text-destructive">{result.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba de Monitoramento */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Status Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {configs.filter(c => c.is_enabled).length}/{configs.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Funções Ativas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Custo Estimado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    ${totalCost.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">por dia</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Testes Realizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {testResults.filter(r => r.success).length}/{testResults.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Sucessos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance por Personalidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Dr. Vital</span>
                    <span>{testResults.filter(r => r.personality === 'drvital' && r.success).length}/{testResults.filter(r => r.personality === 'drvital').length}</span>
                  </div>
                  <Progress value={
                    testResults.filter(r => r.personality === 'drvital').length > 0
                      ? (testResults.filter(r => r.personality === 'drvital' && r.success).length / testResults.filter(r => r.personality === 'drvital').length) * 100
                      : 0
                  } />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sofia</span>
                    <span>{testResults.filter(r => r.personality === 'sofia' && r.success).length}/{testResults.filter(r => r.personality === 'sofia').length}</span>
                  </div>
                  <Progress value={
                    testResults.filter(r => r.personality === 'sofia').length > 0
                      ? (testResults.filter(r => r.personality === 'sofia' && r.success).length / testResults.filter(r => r.personality === 'sofia').length) * 100
                      : 0
                  } />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showAdvanced && (
        <TabsContent value="advanced" className="space-y-4">
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>Controle Avançado:</strong> Configurações detalhadas e personalizadas para cada função de IA. 
              Acesse configurações avançadas, prompts personalizados e otimizações específicas.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {functionalities.map((func) => {
              const config = configs.find(c => c.functionality === func.key);
              const IconComponent = func.icon;
              
              return (
                <Card key={func.key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">{func.name}</h3>
                          <p className="text-sm text-muted-foreground">{func.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config?.is_enabled ? "default" : "secondary"}>
                          {config?.is_enabled ? "Ativo" : "Inativo"}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedAdvancedConfig(config || null)}
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Avançado
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <IconComponent className="h-5 w-5" />
                                Configuração Avançada: {func.name}
                              </DialogTitle>
                              <DialogDescription>
                                Configure parâmetros avançados para {func.name.toLowerCase()}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Status e Informações Básicas */}
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <Activity className="h-4 w-4" />
                                      Status Atual
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm">Ativo:</span>
                                        <Switch
                                          checked={config?.is_enabled || false}
                                          onCheckedChange={(checked) => {
                                            console.log('Switch clicked:', checked, 'Config:', config);
                                            if (config) {
                                              const updatedConfig = { ...config, is_enabled: checked };
                                              console.log('Saving config:', updatedConfig);
                                              saveConfiguration(updatedConfig);
                                            } else {
                                              console.error('Config is null or undefined');
                                            }
                                          }}
                                        />
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Personalidade:</span>
                                        <Badge variant="outline">
                                          {config?.personality === 'drvital' ? 'Dr. Vital' : 'Sofia'}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Nível:</span>
                                        <Badge variant="outline">
                                          {config?.level === 'maximo' ? 'Máximo' : config?.level === 'meio' ? 'Meio' : 'Mínimo'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <BarChart3 className="h-4 w-4" />
                                      Métricas
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm">Tokens:</span>
                                        <span className="text-sm font-medium">{config?.max_tokens || 4096}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Temperatura:</span>
                                        <span className="text-sm font-medium">{config?.temperature || 0.8}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Custo/Request:</span>
                                        <span className="text-sm font-medium">${config?.cost_per_request?.toFixed(4) || '0.0000'}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Configurações Avançadas */}
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <Cpu className="h-4 w-4" />
                                      Configuração de IA
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {/* Serviço */}
                                    <div className="space-y-2">
                                      <Label>Serviço de IA</Label>
                                      <Select
                                        value={config?.service || 'openai'}
                                        onValueChange={(value) => {
                                          if (config) {
                                            saveConfiguration({ ...config, service: value as 'openai' | 'gemini' | 'ollama' | 'sofia' });
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="openai">OpenAI</SelectItem>
                                          <SelectItem value="gemini">Google Gemini</SelectItem>
                                          <SelectItem value="ollama">Ollama (Local)</SelectItem>
                                          <SelectItem value="sofia">Sofia Chat</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Modelo */}
                                    <div className="space-y-2">
                                      <Label>Modelo</Label>
                                      <Select
                                        value={config?.model || 'gpt-4'}
                                        onValueChange={(value) => {
                                          if (config) {
                                            saveConfiguration({ ...config, model: value });
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {(!config?.service || config?.service === 'openai') && (
                                            <>
                                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                            </>
                                          )}
                                          {config?.service === 'gemini' && (
                                            <>
                                              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                              <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                                            </>
                                          )}
                                          {config?.service === 'ollama' && (
                                            <>
                                              <SelectItem value="llama3.1:8b-instruct-q4_0">llama3.1:8b-instruct-q4_0</SelectItem>
                                              <SelectItem value="qwen2.5:7b-instruct-q4_0">qwen2.5:7b-instruct-q4_0</SelectItem>
                                              <SelectItem value="deepseek-r1:7b-qwen-distill-q4_K_M">deepseek-r1:7b-qwen-distill-q4_K_M</SelectItem>
                                            </>
                                          )}
                                          {/* Sofia não é provedor: remover seleção de modelo para 'sofia' */}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Tokens */}
                                    <div className="space-y-2">
                                      <Label>Tokens Máximos: {config?.max_tokens || 4096}</Label>
                                      <Slider
                                        value={[config?.max_tokens || 4096]}
                                        onValueChange={(value) => {
                                          console.log('Tokens slider changed:', value[0], 'Config:', config);
                                          if (config) {
                                            const updatedConfig = { ...config, max_tokens: value[0] };
                                            console.log('Saving tokens config:', updatedConfig);
                                            saveConfiguration(updatedConfig);
                                          } else {
                                            console.error('Config is null or undefined for tokens');
                                          }
                                        }}
                                        max={4000}
                                        min={100}
                                        step={100}
                                        className="w-full"
                                      />
                                    </div>

                                    {/* Temperatura */}
                                    <div className="space-y-2">
                                      <Label>Temperatura: {config?.temperature || 0.8}</Label>
                                      <Slider
                                        value={[config?.temperature || 0.8]}
                                        onValueChange={(value) => {
                                          console.log('Temperature slider changed:', value[0], 'Config:', config);
                                          if (config) {
                                            const updatedConfig = { ...config, temperature: value[0] };
                                            console.log('Saving temperature config:', updatedConfig);
                                            saveConfiguration(updatedConfig);
                                          } else {
                                            console.error('Config is null or undefined for temperature');
                                          }
                                        }}
                                        max={2}
                                        min={0}
                                        step={0.1}
                                        className="w-full"
                                      />
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <Palette className="h-4 w-4" />
                                      Personalização
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {/* Personalidade */}
                                    <div className="space-y-2">
                                      <Label>Personalidade</Label>
                                      <div className="flex gap-2">
                                        <Button
                                          variant={config?.personality === 'drvital' ? 'default' : 'outline'}
                                          size="sm"
                                          onClick={() => {
                                            if (config) {
                                              saveConfiguration({ ...config, personality: 'drvital' });
                                            }
                                          }}
                                          className="flex items-center gap-2"
                                        >
                                          <Stethoscope className="h-4 w-4" />
                                          Dr. Vital
                                        </Button>
                                        <Button
                                          variant={config?.personality === 'sofia' ? 'default' : 'outline'}
                                          size="sm"
                                          onClick={() => {
                                            if (config) {
                                              saveConfiguration({ ...config, personality: 'sofia' });
                                            }
                                          }}
                                          className="flex items-center gap-2"
                                        >
                                          <Heart className="h-4 w-4" />
                                          Sofia
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Nível */}
                                    <div className="space-y-2">
                                      <Label>Nível de Configuração</Label>
                                      <Select
                                        value={config?.level || 'meio'}
                                        onValueChange={(value) => {
                                          if (config) {
                                            saveConfiguration({ ...config, level: value as 'maximo' | 'meio' | 'minimo' });
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="maximo">Máximo</SelectItem>
                                          <SelectItem value="meio">Meio</SelectItem>
                                          <SelectItem value="minimo">Mínimo</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Prioridade */}
                                    <div className="space-y-2">
                                      <Label>Prioridade</Label>
                                      <Select
                                        value={config?.priority?.toString() || '1'}
                                        onValueChange={(value) => {
                                          if (config) {
                                            saveConfiguration({ ...config, priority: parseInt(value) });
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">Baixa</SelectItem>
                                          <SelectItem value="2">Média</SelectItem>
                                          <SelectItem value="3">Alta</SelectItem>
                                          <SelectItem value="4">Crítica</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                      {/* Prompt do Sistema */}
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Prompt do Sistema
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                          <div className="space-y-2">
                            <Label>Prompt ativo apenas para Chat Diário</Label>
                            <Textarea
                              placeholder="Esta edição tem efeito principal no Chat Diário."
                              value={config?.system_prompt || ''}
                              onChange={(e) => {
                                if (config) {
                                  saveConfiguration({ ...config, system_prompt: e.target.value });
                                }
                              }}
                              rows={4}
                              className="font-mono text-sm"
                            />
                          </div>
                                </CardContent>
                              </Card>

                              {/* Teste Rápido */}
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <TestTube className="h-4 w-4" />
                                    Teste Rápido
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => config && testConfiguration(config)}
                                        disabled={isTesting}
                                        className="flex items-center gap-2"
                                      >
                                        <PlayCircle className="h-4 w-4" />
                                        Testar Configuração
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          if (config) {
                                            saveConfiguration({ ...config, ...levelConfigs[config.level] });
                                          }
                                        }}
                                      >
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                        Resetar para Padrão
                                      </Button>
                                    </div>
                                    {isTesting && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                        Testando configuração...
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAdvancedModalOpen(false)}>
                                Fechar
                              </Button>
                              <Button onClick={() => {
                                if (config) {
                                  saveConfiguration(config);
                                  setIsAdvancedModalOpen(false);
                                }
                              }}>
                                <Save className="h-4 w-4 mr-1" />
                                Salvar Configuração
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        )}
      </Tabs>
    </div>
  );
}