import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { calcNutrition } from './nutrition-calc.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const googleAIApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
// Modelo Gemini configurável; padrão mais preciso
const geminiModel = (Deno.env.get('SOFIA_GEMINI_MODEL') || 'gemini-1.5-pro').trim();
// Modo de porção: 'ai_strict' usa os números do Gemini; 'defaults' usa porções padrão
const portionMode = (Deno.env.get('SOFIA_PORTION_MODE') || 'ai_strict').trim();
const minPortionConfidence = Number(Deno.env.get('SOFIA_PORTION_CONFIDENCE_MIN') || '0.55');
// Desativar GPT por padrão: vamos padronizar na família Gemini
const sofiaUseGpt = (Deno.env.get('SOFIA_USE_GPT') || 'false').toLowerCase() === 'true';
// Modo estrito: sem fallback de porções padrão. Só calcula quando houver gramas/ml confiáveis
// Default agora é 'true' para evitar números errados quando a IA não fornecer quantidades
const strictMode = (Deno.env.get('SOFIA_STRICT_MODE') || 'true').toLowerCase() === 'true';
// Proxy do Ollama (FastAPI) para normalização e validação
const ollamaProxyUrl = (Deno.env.get('OLLAMA_PROXY_URL') || 'http://localhost:8000').replace(/\/$/, '');
// YOLO microserviço opcional
const yoloEnabled = (Deno.env.get('YOLO_ENABLED') || 'false').toLowerCase() === 'true';
const yoloServiceUrl = (Deno.env.get('YOLO_SERVICE_URL') || 'http://localhost:8001').replace(/\/$/, '');
// Label Studio integração opcional
const labelStudioEnabled = (Deno.env.get('LABEL_STUDIO_ENABLED') || 'false').toLowerCase() === 'true';
const labelStudioUrl = (Deno.env.get('LABEL_STUDIO_URL') || 'http://localhost:8080').replace(/\/$/, '');
const labelStudioToken = Deno.env.get('LABEL_STUDIO_TOKEN') || '';
const labelStudioProjectId = Deno.env.get('LABEL_STUDIO_PROJECT_ID') || '';

// Mapeamento básico de classes COCO → alimentos pt-BR
const YOLO_CLASS_MAP: Record<string, string> = {
  // bebidas (contêineres)
  'cup': 'água',
  'bottle': 'água',
  'wine glass': 'vinho',
  // comidas comuns do COCO
  'banana': 'banana',
  'apple': 'maçã',
  'orange': 'laranja',
  'broccoli': 'brócolis',
  'carrot': 'cenoura',
  'pizza': 'pizza',
  'cake': 'bolo',
  'donut': 'rosquinha',
  'sandwich': 'sanduíche',
  'hot dog': 'cachorro-quente'
};

async function tryYoloDetect(imageUrl: string): Promise<{ foods: string[]; liquids: string[]; maxConfidence: number } | null> {
  if (!yoloEnabled) return null;
  try {
    const resp = await fetch(`${yoloServiceUrl}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, task: 'segment', confidence: 0.35 })
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const objects: Array<{ class_name: string; score: number }> = Array.isArray(data?.objects) ? data.objects : [];
    const mapped = objects
      .map(o => ({ name: YOLO_CLASS_MAP[o.class_name] || '', score: Number(o.score) || 0 }))
      .filter(o => !!o.name && o.score >= 0.35);
    const foods: string[] = [];
    const liquids: string[] = [];
    let maxConfidence = 0;
    for (const m of mapped) {
      maxConfidence = Math.max(maxConfidence, m.score);
      // Classes de líquido (copos/garrafas) entram como líquidos
      if (m.name === 'água' || m.name === 'vinho') liquids.push(m.name);
      else foods.push(m.name);
    }
    return { foods, liquids, maxConfidence };
  } catch (_e) {
    return null;
  }
}

async function callOllamaNormalizer(rawItems: Array<{name: string; grams?: number; ml?: number; method?: string}>): Promise<Array<{name: string; grams?: number; ml?: number; method?: string}>> {
  try {
    const system = 'Você é um normalizador de alimentos brasileiro. Receba itens {name, grams?, ml?, method?}.\nRegras:\n- Canonize nomes: arroz, branco, cozido; feijao carioca cozido; frango, peito, grelhado; salada verde; batata frita (se houver óleo).\n- Deduplique, some gramas/ML iguais.\n- NUNCA invente calorias.\n- Se não souber gramas, deixe sem.\n- Resposta APENAS em JSON: {"items":[{name,grams?,ml?,method?}]}.\n';
    const user = `Itens: ${JSON.stringify(rawItems)}`;
    const resp = await fetch(`${ollamaProxyUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'system', content: system }, { role: 'user', content: user }], options: { temperature: 0.1 } }),
    });
    if (!resp.ok || !resp.body) return rawItems;
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
    }
    // Tenta extrair o último JSON da resposta NDJSON
    const lines = buf.split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const evt = JSON.parse(lines[i]);
        const text: string | undefined = evt?.message?.content;
        if (text) {
          const match = text.match(/\{[\s\S]*\}$/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            const items = Array.isArray(parsed?.items) ? parsed.items : [];
            if (items.length > 0) return items;
          }
        }
      } catch (_) { /* segue */ }
    }
  } catch (_) { /* mantém raw */ }
  return rawItems;
}

// 📸 Função auxiliar para converter imagem (URL http(s) ou data URL) em base64 (retornando também o MIME)
async function fetchImageAsBase64(urlOrData: string): Promise<{ base64: string; mime: string }> {
  try {
    // Suporte a data URL: data:image/png;base64,XXXX
    if ((urlOrData || '').startsWith('data:')) {
      const commaIdx = urlOrData.indexOf(',');
      if (commaIdx === -1) throw new Error('Data URL inválida');
      const header = urlOrData.substring(0, commaIdx);
      const data = urlOrData.substring(commaIdx + 1);
      let mime = 'image/jpeg';
      const m = header.match(/^data:([^;]+)(;base64)?/i);
      if (m && m[1]) mime = m[1];
      return { base64: data, mime };
    }

    // Caso padrão: buscar por HTTP(S)
    const response = await fetch(urlOrData, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SofiaAI/1.0; +https://supabase.com)'
      }
    });
    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    let mime = response.headers.get('content-type') || '';
    if (!mime) {
      const lower = urlOrData.toLowerCase();
      if (lower.endsWith('.png')) mime = 'image/png';
      else if (lower.endsWith('.webp')) mime = 'image/webp';
      else if (lower.endsWith('.gif')) mime = 'image/gif';
      else mime = 'image/jpeg';
    }
    return { base64, mime };
  } catch (error) {
    console.log('❌ Erro ao converter imagem:', error);
    throw error;
  }
}

// 🍽️ COMBOS DE REFEIÇÕES BRASILEIRAS
const COMBOS_REFEICOES: Record<string, {alimentos: string[], calorias: number, descricao: string}> = {
  // Café da manhã
  'cafe_completo': {
    alimentos: ['pão francês', 'manteiga', 'café', 'leite'],
    calorias: 350,
    descricao: 'Café da manhã tradicional brasileiro'
  },
  'cafe_saudavel': {
    alimentos: ['pão integral', 'queijo branco', 'suco de laranja', 'fruta'],
    calorias: 280,
    descricao: 'Café da manhã nutritivo'
  },
  'cafe_proteico': {
    alimentos: ['ovos', 'pão integral', 'queijo', 'café'],
    calorias: 420,
    descricao: 'Café da manhã rico em proteínas'
  },

  // Almoço
  'almoco_tradicional': {
    alimentos: ['arroz', 'feijão', 'carne bovina', 'salada', 'farofa'],
    calorias: 650,
    descricao: 'Almoço tradicional brasileiro'
  },
  'almoco_saudavel': {
    alimentos: ['arroz integral', 'feijão', 'frango grelhado', 'salada verde', 'legumes'],
    calorias: 480,
    descricao: 'Almoço nutritivo e balanceado'
  },
  'almoco_vegetariano': {
    alimentos: ['arroz integral', 'feijão', 'legumes', 'salada', 'queijo'],
    calorias: 420,
    descricao: 'Almoço vegetariano nutritivo'
  },
  'almoco_executivo': {
    alimentos: ['arroz', 'feijão', 'frango à parmegiana', 'batata frita', 'salada'],
    calorias: 720,
    descricao: 'Almoço executivo completo'
  },

  // Jantar
  'jantar_leve': {
    alimentos: ['sopa', 'salada', 'pão integral'],
    calorias: 320,
    descricao: 'Jantar leve e nutritivo'
  },
  'jantar_proteico': {
    alimentos: ['peixe grelhado', 'legumes', 'arroz integral'],
    calorias: 380,
    descricao: 'Jantar rico em proteínas'
  },
  'jantar_vegetariano': {
    alimentos: ['legumes', 'quinoa', 'salada', 'queijo'],
    calorias: 350,
    descricao: 'Jantar vegetariano'
  },

  // Lanches
  'lanche_frutas': {
    alimentos: ['fruta', 'iogurte', 'granola'],
    calorias: 180,
    descricao: 'Lanche com frutas'
  },
  'lanche_proteico': {
    alimentos: ['queijo', 'pão integral', 'fruta'],
    calorias: 220,
    descricao: 'Lanche rico em proteínas'
  },
  'lanche_docinho': {
    alimentos: ['bolo', 'café', 'leite'],
    calorias: 280,
    descricao: 'Lanche doce tradicional'
  },

  // Pratos específicos
  'feijoada': {
    alimentos: ['feijão preto', 'carne de porco', 'arroz', 'farofa', 'couve', 'laranja'],
    calorias: 850,
    descricao: 'Feijoada completa'
  },
  'churrasco': {
    alimentos: ['carne bovina', 'frango', 'linguiça', 'arroz', 'farofa', 'salada'],
    calorias: 920,
    descricao: 'Churrasco brasileiro'
  },
  'moqueca': {
    alimentos: ['peixe', 'camarão', 'arroz', 'farofa', 'salada'],
    calorias: 680,
    descricao: 'Moqueca de peixe'
  },
  'strogonoff': {
    alimentos: ['frango', 'arroz', 'batata palha', 'salada'],
    calorias: 580,
    descricao: 'Strogonoff de frango'
  },
  'lasanha': {
    alimentos: ['massa', 'queijo', 'molho de tomate', 'carne moída', 'salada'],
    calorias: 720,
    descricao: 'Lasanha tradicional'
  },
  'pizza': {
    alimentos: ['massa', 'queijo', 'molho de tomate', 'presunto', 'azeitona'],
    calorias: 650,
    descricao: 'Pizza tradicional'
  },
  'hamburguer': {
    alimentos: ['pão', 'carne bovina', 'queijo', 'alface', 'tomate', 'batata frita'],
    calorias: 780,
    descricao: 'Hambúrguer completo'
  },
  'sushi': {
    alimentos: ['arroz', 'peixe', 'alga', 'wasabi', 'gengibre'],
    calorias: 320,
    descricao: 'Sushi japonês'
  },
  'salada_completa': {
    alimentos: ['alface', 'tomate', 'cenoura', 'queijo', 'frango grelhado'],
    calorias: 280,
    descricao: 'Salada completa'
  },
  'sopa_nutritiva': {
    alimentos: ['legumes', 'frango', 'macarrão', 'temperos'],
    calorias: 220,
    descricao: 'Sopa nutritiva'
  }
};

// 🍽️ Base de conhecimento de porções brasileiras realistas
const PORCOES_BRASILEIRAS: Record<string, number> = {
  // Proteínas
  'frango grelhado': 150,
  'frango à parmegiana': 180,
  'frango assado': 150,
  'carne bovina': 150,
  'carne assada': 150,
  'carne grelhada': 150,
  'peixe': 120,
  'salmão': 120,
  'atum': 100,
  'ovo': 50,
  'ovos': 100,
  
  // Carboidratos
  'arroz branco': 100,
  'arroz integral': 100,
  'arroz': 100,
  'batata frita': 80,
  'batata': 150,
  'batata assada': 150,
  'purê de batata': 120,
  'macarrão': 100,
  'massa': 100,
  'pão': 50,
  'pão francês': 50,
  'farofa': 60,
  'feijão': 80,
  'feijão preto': 80,
  'feijão carioca': 80,
  
  // Vegetais e saladas
  'salada': 50,
  'alface': 30,
  'tomate': 60,
  'cenoura': 50,
  'brócolis': 80,
  'couve-flor': 80,
  'abobrinha': 70,
  'pepino': 40,
  'cebola': 30,
  'pimentão': 40,
  
  // Molhos e temperos
  'molho de tomate': 40,
  'molho': 40,
  'vinagrete': 30,
  'azeite': 15,
  'óleo': 15,
  'manteiga': 10,
  'queijo': 25,
  'queijo derretido': 25,
  'queijo ralado': 20,
  'requeijão': 30,
  
  // Bebidas (ml)
  'suco': 200,
  'suco de laranja': 200,
  'refrigerante': 350,
  'água': 250,
  'café': 150,
  'leite': 200,
  'vitamina': 250,
  
  // Outros
  'ervas': 3,
  'temperos': 5,
  'açúcar': 10,
  'sal': 2
};

function isLiquidName(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes('suco') ||
    n.includes('refrigerante') ||
    n.includes('água') || n.includes('agua') ||
    n.includes('café') || n.includes('cafe') ||
    n.includes('leite') ||
    n.includes('vitamina') ||
    n.includes('chá') || n.includes('cha')
  );
}

// Função de cálculo nutricional direto (sem chamada externa)
async function calculateNutritionDirect(items: Array<{name: string; grams?: number; ml?: number}>, supabase: any): Promise<{kcal: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number; sodium_mg: number} | null> {
  const SYNONYMS: Record<string, string> = {
    'ovo': 'ovo de galinha cozido',
    'arroz': 'arroz, branco, cozido',
    'feijão': 'feijao preto cozido',
    'feijao': 'feijao preto cozido',
    'batata': 'batata cozida',
    'frango': 'frango grelhado',
    'carne': 'carne bovina cozida',
    'salada': 'salada verde',
    'farofa': 'farofa pronta'
  };

  const normalize = (text: string): string => {
    if (!text) return '';
    return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '').replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, ' ');
  };

  let totals = { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };

  for (const item of items) {
    if (!item.name || (!item.grams && !item.ml)) continue;

    const rawName = item.name;
    const synonym = SYNONYMS[rawName.toLowerCase().trim()];
    const searchName = synonym || rawName;
    const alias = normalize(searchName);

    // Buscar na base de dados TACO
    let food: any = null;
    
    // Buscar diretamente na tabela valores_nutricionais_completos
    const { data: valoresNutricionais } = await supabase
      .from('valores_nutricionais_completos')
      .select('alimento_nome, kcal, proteina, gorduras, carboidratos, fibras, sodio')
      .ilike('alimento_nome', `%${searchName}%`)
      .limit(5);
        
    if (valoresNutricionais && valoresNutricionais.length > 0) {
      const valor = valoresNutricionais[0];
      food = {
        canonical_name: valor.alimento_nome,
        kcal: valor.kcal || 0,
        protein_g: valor.proteina || 0,
        fat_g: valor.gorduras || 0,
        carbs_g: valor.carboidratos || 0,
        fiber_g: valor.fibras || 0,
        sodium_mg: valor.sodio || 0,
      };
    }

    if (!food) continue;

    // Calcular gramas efetivas
    let grams = Number(item.grams || 0);
    if (!grams && item.ml && food.density_g_ml) {
      grams = Number(item.ml) * Number(food.density_g_ml);
    }
    if (!grams) continue;

    // Aplicar fator de porção comestível se existir
    if (food.edible_portion_factor && Number(food.edible_portion_factor) > 0) {
      grams = grams * Number(food.edible_portion_factor);
    }

    // Calcular nutrientes (por 100g)
    const factor = grams / 100.0;
    const nutrients = {
      kcal: Number(food.kcal || 0) * factor,
      protein_g: Number(food.protein_g || 0) * factor,
      fat_g: Number(food.fat_g || 0) * factor,
      carbs_g: Number(food.carbs_g || 0) * factor,
      fiber_g: Number(food.fiber_g || 0) * factor,
      sodium_mg: Number(food.sodium_mg || 0) * factor,
    };

    totals.kcal += nutrients.kcal;
    totals.protein_g += nutrients.protein_g;
    totals.fat_g += nutrients.fat_g;
    totals.carbs_g += nutrients.carbs_g;
    totals.fiber_g += nutrients.fiber_g;
    totals.sodium_mg += nutrients.sodium_mg;
  }

  return totals;
}

// 🔍 Função para detectar combos de refeições
function detectComboRefeicao(foods: string[]): {combo: string, alimentos: string[], calorias: number, descricao: string} | null {
  const normalizedFoods = foods.map(f => f.toLowerCase().trim());
  
  // Verificar cada combo
  for (const [comboKey, comboData] of Object.entries(COMBOS_REFEICOES)) {
    const comboAlimentos = comboData.alimentos.map(a => a.toLowerCase());
    
    // Contar quantos alimentos do combo estão presentes
    let matches = 0;
    const matchedFoods: string[] = [];
    
    for (const alimento of comboAlimentos) {
      for (const detectedFood of normalizedFoods) {
        if (detectedFood.includes(alimento) || alimento.includes(detectedFood)) {
          matches++;
          matchedFoods.push(alimento);
          break;
        }
      }
    }
    
    // Se pelo menos 70% dos alimentos do combo foram detectados
    const matchPercentage = matches / comboAlimentos.length;
    if (matchPercentage >= 0.7) {
      return {
        combo: comboKey,
        alimentos: matchedFoods,
        calorias: comboData.calorias,
        descricao: comboData.descricao
      };
    }
  }
  
  return null;
}

// 🔧 Função para remover duplicatas e aplicar estimativas realistas
function removeDuplicatesAndEstimatePortions(foods: string[]): Array<{nome: string, quantidade: number}> {
  const normalizedFoods = new Map<string, number>();
  
  foods.forEach(food => {
    const normalizedFood = food.toLowerCase().trim();
    
    // Mapear variações para nomes padronizados
    let standardName = normalizedFood;
    
    // Encontrar porção correspondente (busca por palavras-chave)
    let portion = 0;
    for (const [key, value] of Object.entries(PORCOES_BRASILEIRAS)) {
      if (normalizedFood.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedFood)) {
        standardName = key;
        portion = value;
        break;
      }
    }
    
    // Se não encontrou, usar estimativa genérica baseada no tipo
    if (portion === 0) {
      if (normalizedFood.includes('carne') || normalizedFood.includes('frango') || normalizedFood.includes('peixe')) {
        portion = 150; // Proteínas
      } else if (normalizedFood.includes('arroz') || normalizedFood.includes('batata') || normalizedFood.includes('massa')) {
        portion = 100; // Carboidratos
      } else if (normalizedFood.includes('salada') || normalizedFood.includes('verdura') || normalizedFood.includes('legume')) {
        portion = 50; // Vegetais
      } else if (normalizedFood.includes('molho') || normalizedFood.includes('tempero')) {
        portion = 30; // Molhos/temperos
      } else if (normalizedFood.includes('suco') || normalizedFood.includes('bebida')) {
        portion = 200; // Bebidas
      } else {
        portion = 50; // Padrão genérico
      }
    }
    
    // Verificar se já existe um item similar (evitar duplicatas)
    let existingKey = null;
    for (const existingName of normalizedFoods.keys()) {
      if (existingName.includes(standardName) || standardName.includes(existingName)) {
        existingKey = existingName;
        break;
      }
    }
    
    if (existingKey) {
      // Combinar quantidades se for o mesmo alimento
      normalizedFoods.set(existingKey, Math.max(normalizedFoods.get(existingKey)!, portion));
    } else {
      normalizedFoods.set(standardName, portion);
    }
  });
  
  // Converter para array de objetos com nome e quantidade
  return Array.from(normalizedFoods.entries()).map(([nome, quantidade]) => ({
    nome: nome.charAt(0).toUpperCase() + nome.slice(1), // Capitalizar primeira letra
    quantidade
  }));
}

// 🏷️ Função para enviar previsões para Label Studio (validação)
async function sendToLabelStudio(imageUrl: string, detectedFoods: any[], confidence: number, userId: string): Promise<{ taskId?: string; success: boolean; error?: string }> {
  if (!labelStudioEnabled || !labelStudioUrl || !labelStudioToken || !labelStudioProjectId) {
    return { success: false, error: 'Label Studio não configurado' };
  }

  try {
    // Preparar previsões no formato Label Studio
    const predictions = detectedFoods.map((food, index) => ({
      id: `prediction_${index}`,
      score: confidence,
      result: [{
        id: `result_${index}`,
        type: 'choices',
        value: {
          choices: [food.name || food.nome || food]
        },
        from_name: 'food_detection',
        to_name: 'image'
      }]
    }));

    // Criar task no Label Studio
    const taskData = {
      data: {
        image: imageUrl
      },
      predictions: predictions,
      meta: {
        userId: userId,
        confidence: confidence,
        source: 'sofia-ai'
      }
    };

    const response = await fetch(`${labelStudioUrl}/api/tasks/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${labelStudioToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project: labelStudioProjectId,
        ...taskData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao enviar para Label Studio:', response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const result = await response.json();
    console.log('✅ Enviado para Label Studio:', result.id);
    
    return { 
      success: true, 
      taskId: result.id.toString() 
    };

  } catch (error) {
    console.error('❌ Erro ao enviar para Label Studio:', error);
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido' 
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, userId, userContext } = await req.json();
    
    console.log('📸 Recebida imagem para análise:', { imageUrl, userId, userContext });

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados do usuário
    let userProfile = null;
    let actualUserName = userContext?.userName || 'usuário';
    
    if (userId && userId !== 'guest') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      userProfile = profile;
      if (profile) {
        actualUserName = profile.full_name || profile.email?.split('@')[0] || userContext?.userName || 'usuário';
      }
    }

    // Buscar base de conhecimento nutricional
    const { data: foodDatabase } = await supabase
      .from('alimentos')
      .select('nome, categoria, subcategoria')
      .limit(100);

    const foodKnowledge = foodDatabase?.map(food => food.nome).join(', ') || 'arroz, feijão, frango, peixe, batata, macarrão, salada, carne, legumes, frutas';

    // 🔄 FLUXO CORRIGIDO: Google AI Gemini Vision (sem base64 para mais precisão)
    let detectedFoods = [];
    let detectedLiquids = [];
    let isFood = false;
    let confidence = 0;
    let estimatedCalories = 0;
    
    // 👁️ Primeiro tenta YOLO (se habilitado). Se não suficiente, usa Gemini.
    let yoloTried = false;
    if (yoloEnabled) {
      console.log('🦾 Tentando YOLO microserviço...');
      const yolo = await tryYoloDetect(imageUrl);
      if (yolo && (yolo.foods.length > 0 || yolo.liquids.length > 0)) {
        detectedFoods = [...yolo.foods];
        detectedLiquids = [...yolo.liquids];
        isFood = detectedFoods.length > 0 || detectedLiquids.length > 0;
        confidence = Math.max(confidence, yolo.maxConfidence || 0);
        console.log('✅ YOLO detectou:', { detectedFoods, detectedLiquids, confidence });
      }
      yoloTried = true;
    }

    // 👁️ Usar Google AI Vision (Gemini) para análise inicial quando YOLO não cobriu bem e houver API key
    if ((!isFood || confidence < 0.6) && googleAIApiKey) {
      console.log('🤖 Chamando Google AI para análise inicial...');
      try {
        const img = await fetchImageAsBase64(imageUrl);
        const visionResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${googleAIApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: `Analise esta imagem de comida detalhadamente e retorne APENAS um JSON válido:
{
  "is_food": true/false,
  "confidence": 0.0-1.0,
  "foods_detected": ["alimento1", "alimento2"],
  "liquids_detected": ["líquido1", "líquido2"],
  "estimated_calories": número,
  "meal_type": "breakfast/lunch/dinner/snack"
}

Base de alimentos brasileiros: ${foodKnowledge}

REGRAS IMPORTANTES:
- Identifique TODOS os alimentos sólidos em português brasileiro
- Identifique TODOS os líquidos/bebidas presentes (água, suco, refrigerante, café, chá, leite, vitamina, etc.)
- Observe copos, garrafas, latas, canecas que podem conter líquidos
- Se não há comida visível, is_food = false
- Confidence entre 0.7-0.95 para comida clara
- Estime calorias realistas (200-1200) incluindo líquidos
- Seja específico sobre cores e tipos (ex: "suco de laranja", "refrigerante cola")
- Identifique pelo menos 2-3 alimentos quando possível` },
                { inline_data: { mime_type: img.mime, data: img.base64 } }
              ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
          })
        });

        if (!visionResponse.ok) throw new Error(`Google AI error: ${visionResponse.status}`);
        const visionData = await visionResponse.json();
        const responseText = visionData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        try {
          const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            isFood = analysisData.is_food || false;
            confidence = analysisData.confidence || 0;
            detectedFoods = analysisData.foods_detected || [];
            detectedLiquids = analysisData.liquids_detected || [];
            estimatedCalories = analysisData.estimated_calories || 0;
          }
        } catch (_parseError) {
          isFood = false;
        }

        if (isFood) {
          try {
            const detailedResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${googleAIApiKey}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: `Analise esta mesma imagem e retorne APENAS JSON válido com alto detalhamento e PORÇÕES ESTIMADAS:
{
  "detailed_foods": ["item1", "item2", ...],
  "detailed_liquids": ["bebida1", "bebida2", ...],
  "cooking_methods": ["grelhado", "refogado", ...],
  "seasonings": ["tempero1", "molho1", ...],
  "estimated_calories": numero,
  "confidence": 0.0-1.0,
  "items": [{"name":"arroz branco","grams":120,"ml":null,"method":"cozido","confidence":0.85},{"name":"suco de laranja","grams":null,"ml":200,"method":"liquido","confidence":0.9}] 
}

BASE (pt-BR): ${foodKnowledge}

REGRAS:
- Liste todos os alimentos/ingredientes, molhos, temperos e bebidas presentes
- Seja específico nos tipos (ex.: feijão preto, arroz branco, frango grelhado, salada verde)
- Estime gramas (sólidos) ou mL (líquidos) realistas por item
- Não some itens duplicados; prefira mesclar em um único item com quantidade total
- Não use markdown, não use comentários, apenas JSON` },
                    { inline_data: { mime_type: img.mime, data: img.base64 } }
                  ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1200 }
              })
            });

            if (detailedResponse.ok) {
              const det = await detailedResponse.json();
              const detailText = det.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const detailJsonMatch = detailText.match(/```json\s*([\s\S]*?)\s*```/) || detailText.match(/\{[\s\S]*\}/);
              if (detailJsonMatch) {
                const detailed = JSON.parse(detailJsonMatch[1] || detailJsonMatch[0]);
                const extraFoods = [ ...(detailed.detailed_foods || []), ...(detailed.detailed_liquids || []), ...(detailed.seasonings || []) ];
                const combined = [...(Array.isArray(detectedFoods) ? detectedFoods : []), ...extraFoods];
                detectedFoods = removeDuplicatesAndEstimatePortions(combined.filter((x: string) => x && x.length > 0));
                estimatedCalories = Math.max(estimatedCalories, detailed.estimated_calories || 0);
                confidence = Math.max(confidence, detailed.confidence || 0);
              }
            }
          } catch (_e) {
            // mantém análise inicial
          }
        }

      } catch (error) {
        console.log('❌ Erro na análise da imagem:', error);
        isFood = false;
      }
    } else {
      // YOLO já cobriu
      // nada a fazer
    }


    console.log('🔍 Verificando se detectou comida...');
    
    // Se não detectou comida ou confiança baixa
    if (!isFood || confidence < 0.5) {
      console.log('❌ Comida não detectada ou confiança baixa');
      
      return new Response(JSON.stringify({
        success: false,
        message: `Oi ${actualUserName}! 😊 Não consegui ver claramente os alimentos na imagem. 

💡 **Dicas para uma melhor análise:**
- Certifique-se de que a imagem mostra alimentos claramente
- Tente tirar uma nova foto com boa iluminação
- Evite sombras ou reflexos na imagem

Ou você pode me contar o que está comendo! 😉✨`,
        is_food: false,
        confidence: confidence
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Comida detectada! Gerando análise nutricional...');

    // 🍽️ Detectar combos de refeições
    const allDetectedFoods = Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object'
      ? detectedFoods.map(food => food.nome)
      : detectedFoods;
    
    const comboDetected = detectComboRefeicao(allDetectedFoods);
    
    // 🍽️ Formatar lista de alimentos com quantidades realistas
    let foodList = '';
    let comboInfo = '';
    
    if (comboDetected) {
      console.log('🎯 Combo detectado:', comboDetected);
      // Não usar calorias estimadas do combo no texto final (priorizar cálculo determinístico)
      comboInfo = `\n🍽️ **COMBO DETECTADO:** ${comboDetected.descricao}\n`;
      foodList = comboDetected.alimentos.map(food => `• ${food}`).join('\n');
    } else {
      foodList = Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object'
        ? detectedFoods.map(food => `• ${food.nome} – ${food.quantidade}g`).join('\n')
        : detectedFoods.map(food => `• ${food}`).join('\n');
    }

    // 🔢 Integração determinística: calcular localmente (TACO-like) com itens detectados
    let calcItems: Array<{ name: string; grams?: number; ml?: number; state?: string }>; 
    const aiPortionItems = (globalThis as any).__AI_PORTION_ITEMS__ as Array<{name: string; grams?: number; ml?: number; method?: string}> | undefined;
    if (aiPortionItems && aiPortionItems.length > 0) {
      // Preferir itens estimados pela IA
      let itemsForCalc = aiPortionItems.map((it) => ({
        name: it.name,
        grams: isLiquidName(it.name) ? undefined : it.grams,
        ml: isLiquidName(it.name) ? it.ml : undefined,
        state: it.method
      }));
      // Normalizar via Ollama (dedupe/canonizar) – não altera gramas, apenas nomes e soma duplicatas
      itemsForCalc = await callOllamaNormalizer(itemsForCalc);
      calcItems = itemsForCalc;
    } else {
      // Sem AI items
      if (strictMode) {
        calcItems = [];
      } else {
        // Fallback: porções padrão (apenas quando strictMode=false)
        let itemsForCalc = (Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object'
          ? detectedFoods as Array<{nome: string, quantidade: number}>
          : (detectedFoods as string[]).map((n) => ({ nome: n, quantidade: PORCOES_BRASILEIRAS[n.toLowerCase()] || (isLiquidName(n) ? 200 : 100) }))
        )
          .map((f) => ({
            name: f.nome,
            grams: isLiquidName(f.nome) ? undefined : f.quantidade,
            ml: isLiquidName(f.nome) ? f.quantidade : undefined,
          }));
        itemsForCalc = await callOllamaNormalizer(itemsForCalc);
        calcItems = itemsForCalc;
      }
    }

    // Cálculo determinístico local (somatório antes de arredondar, sem IA)
    let localDeterministic: any = null;
    try {
      const itemsForLocal = (calcItems || [])
        .filter(it => !!it.name && (Number(it.grams) || 0) > 0)
        .map(it => ({ name: String(it.name), grams: Number(it.grams) }));
      if (itemsForLocal.length > 0) {
        localDeterministic = calcNutrition(itemsForLocal);
      }
    } catch (e) {
      console.log('⚠️ Erro no cálculo determinístico local:', e);
    }

    let macrosBlock = '';
    if (localDeterministic && localDeterministic.grams_total > 0) {
      // Cálculo por grama com base no peso efetivo total
      const totalGrams = Number(localDeterministic.grams_total) || 0;
      const perGram = totalGrams > 0 ? {
        kcal_pg: localDeterministic.totals.kcal / totalGrams,
        protein_pg: localDeterministic.totals.protein / totalGrams,
        carbs_pg: localDeterministic.totals.carbs / totalGrams,
        fat_pg: localDeterministic.totals.fat / totalGrams,
        fiber_pg: (localDeterministic.totals.fiber || 0) / totalGrams,
      } : null;

      const perGramText = perGram ? `\n- Por grama: ${perGram.kcal_pg.toFixed(2)} kcal/g, P ${perGram.protein_pg.toFixed(3)} g/g, C ${perGram.carbs_pg.toFixed(3)} g/g, G ${perGram.fat_pg.toFixed(3)} g/g` : '';

      macrosBlock = `📊 Nutrientes (determinístico):\n- Calorias: ${Math.round(localDeterministic.totals.kcal)} kcal\n- Proteínas: ${localDeterministic.totals.protein.toFixed(1)} g\n- Carboidratos: ${localDeterministic.totals.carbs.toFixed(1)} g\n- Gorduras: ${localDeterministic.totals.fat.toFixed(1)} g\n- Fibras: ${Number(localDeterministic.totals.fiber || 0).toFixed(1)} g\n- Sódio: ${Number(localDeterministic.totals.sodium || 0).toFixed(0)} mg${perGramText}\n\n`;
    } else if (strictMode) {
      // Mensagem amigável pedindo gramas quando não há dados suficientes
      const neededList = (Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object')
        ? (detectedFoods as Array<{nome: string, quantidade: number}>).map(f => f.nome)
        : (detectedFoods as string[]);
      const chips = ['30g','50g','80g','100g','150g'];
      const ask = `Não consegui estimar as quantidades com segurança. Pode confirmar as gramas de cada item? Ex.: ${chips.join(', ')}.`;
      const finalStrict = `Oi ${actualUserName}! 😊\n\n📸 Itens detectados:\n${neededList.map(n=>`• ${n}`).join('\n')}\n\n${ask}`;

      return new Response(JSON.stringify({
        success: true,
        requires_confirmation: true,
        analysis_id: savedAnalysis?.id,
        sofia_analysis: {
          analysis: finalStrict,
          personality: 'amigavel',
          foods_detected: detectedFoods,
          confirmation_required: true
        },
        food_detection: {
          foods_detected: detectedFoods,
          is_food: true,
          confidence: confidence,
          estimated_calories: 0,
          nutrition_totals: null,
          meal_type: userContext?.currentMeal || 'refeicao'
        },
        alimentos_identificados: neededList
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const finalMessage = `Oi ${actualUserName}! 😊 

📸 Analisei sua refeição e identifiquei:
${comboInfo}${foodList}

${macrosBlock}🤔 Esses alimentos estão corretos?`;

    // 💾 Salvar análise no banco ANTES da confirmação (corrigido para guest users)
    let savedAnalysis: any = null;
    
    // 🏷️ Enviar para Label Studio se habilitado (validação)
    let labelStudioResult: { taskId?: string; success: boolean; error?: string } = { success: false };
    if (labelStudioEnabled && isFood && confidence >= 0.5) {
      console.log('🏷️ Enviando para Label Studio para validação...');
      labelStudioResult = await sendToLabelStudio(imageUrl, detectedFoods, confidence, userId);
      if (labelStudioResult.success) {
        console.log('✅ Task criada no Label Studio:', labelStudioResult.taskId);
      } else {
        console.log('⚠️ Falha ao enviar para Label Studio:', labelStudioResult.error);
      }
    }
    
    // Só salvar se não for usuário guest
    if (userId && userId !== 'guest') {
      // 📝 Extrair apenas os nomes dos alimentos para o banco (compatibilidade)
      const foodNames = Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object'
        ? detectedFoods.map(food => food.nome)
        : detectedFoods;

      const analysisRecord = {
        user_id: userId,
        user_name: actualUserName,
        image_url: imageUrl,
        foods_detected: foodNames,
        total_calories: estimatedCalories,
        sofia_analysis: finalMessage,
        confirmed_by_user: false,
        confirmation_prompt_sent: true,
        confirmation_status: 'pending',
        label_studio_task_id: labelStudioResult.taskId || null,
        created_at: new Date().toISOString()
      };

      const { data: dbResult, error: insertError } = await supabase
        .from('sofia_food_analysis')
        .insert(analysisRecord)
        .select()
        .single();

      console.log('💾 Tentativa de salvar análise:', { analysisRecord, savedAnalysis: dbResult, insertError });

      if (insertError) {
        console.error('❌ Erro ao salvar análise:', insertError);
        // Não falhar por causa do banco, continuar com a análise
      } else {
        savedAnalysis = dbResult;
      }
    } else {
      console.log('⚠️ Usuário guest, não salvando no banco');
    }

    // 💬 Salvar conversa de confirmação
    if (userId && userId !== 'guest' && savedAnalysis) {
      try {
        await supabase.from('sofia_conversations').insert({
          user_id: userId,
          user_message: 'Enviou foto de refeição',
          sofia_response: finalMessage,
          context_data: {
            type: 'food_confirmation_request',
            analysis_id: savedAnalysis.id,
            detected_foods: detectedFoods,
            estimated_calories: estimatedCalories,
            confidence: confidence
          },
          conversation_type: 'food_analysis',
          related_analysis_id: savedAnalysis.id,
          created_at: new Date().toISOString()
        });
      } catch (conversationError) {
        console.log('⚠️ Erro ao salvar conversa:', conversationError);
        // Não falhar por causa disso
      }
    }

    // Determinar calorias finais: preferir determinístico quando disponível
    const deterministicKcal = localDeterministic && localDeterministic.grams_total > 0 ? Math.round(localDeterministic.totals.kcal) : null;
    const finalKcal = deterministicKcal ?? Math.round(estimatedCalories || 0);

    // Aviso de densidade anômala quando flags density_too_low_* estiverem presentes
    try {
      if (localDeterministic && Array.isArray(localDeterministic.flags)) {
        const hasDensityLow = localDeterministic.flags.some((f: string) => String(f).startsWith('density_too_low_'));
        if (hasDensityLow) {
          const density = (localDeterministic.totals.kcal || 0) / (localDeterministic.grams_total || 1);
          console.warn('[Sofia] Density anomaly', { analysis_id: savedAnalysis?.id, density, flags: localDeterministic.flags, items: localDeterministic.details?.map((d:any)=>({name:d.name, grams:d.grams, key:d.key})) });
        }
      }
    } catch (_e) { /* noop */ }

    return new Response(JSON.stringify({
      success: true,
      requires_confirmation: true,
      analysis_id: savedAnalysis?.id,
      sofia_analysis: {
        analysis: finalMessage,
        personality: 'amigavel',
        foods_detected: detectedFoods,
        confidence: confidence,
        estimated_calories: finalKcal,
        nutrition_totals: localDeterministic && localDeterministic.grams_total > 0 ? localDeterministic : null,
        confirmation_required: true
      },
      food_detection: {
        foods_detected: detectedFoods,
        is_food: true,
        confidence: confidence,
        estimated_calories: finalKcal,
        nutrition_totals: localDeterministic && localDeterministic.grams_total > 0 ? localDeterministic : null,
        meal_type: userContext?.currentMeal || 'refeicao'
      },
      alimentos_identificados: detectedFoods // Para compatibilidade
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na análise de imagem da Sofia:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Ops! Não consegui analisar sua foto agora. Pode me contar o que você está comendo? 📸😊',
      error: error.message
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});