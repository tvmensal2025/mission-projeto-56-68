import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

// 📸 Função auxiliar para converter imagem URL em base64 (retornando também o MIME)
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mime: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        // Alguns CDNs bloqueiam agentes default; definir um user-agent ajuda a liberar
        'User-Agent': 'Mozilla/5.0 (compatible; SofiaAI/1.0; +https://supabase.com)'
      }
    });
    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    // Detectar MIME pelo header ou pela extensão
    let mime = response.headers.get('content-type') || '';
    if (!mime) {
      const lower = url.toLowerCase();
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
    
    // 👁️ Usar Google AI Vision (Gemini) para análise inicial
    console.log('🤖 Chamando Google AI para análise inicial...');
    
    try {
      const img = await fetchImageAsBase64(imageUrl);
      const visionResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${googleAIApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analise esta imagem de comida detalhadamente e retorne APENAS um JSON válido:
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
- Identifique pelo menos 2-3 alimentos quando possível`
              },
              {
                inline_data: {
                  mime_type: img.mime,
                  data: img.base64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000
          }
        })
      });

      if (!visionResponse.ok) {
        throw new Error(`Google AI error: ${visionResponse.status}`);
      }

      const visionData = await visionResponse.json();
      console.log('📊 Resposta do Google AI:', visionData);

      const responseText = visionData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('📝 Texto extraído do Google AI:', responseText);

      // Parse da resposta JSON do Google AI
      try {
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          isFood = analysisData.is_food || false;
          confidence = analysisData.confidence || 0;
          detectedFoods = analysisData.foods_detected || [];
          detectedLiquids = analysisData.liquids_detected || [];
          estimatedCalories = analysisData.estimated_calories || 0;
          
          console.log('✅ Análise inicial Google AI:', { isFood, confidence, detectedFoods, detectedLiquids, estimatedCalories });
        }
      } catch (parseError) {
        console.log('❌ Erro ao parsear resposta JSON do Google AI:', parseError);
        isFood = false;
      }

      // 🚀 Análise detalhada adicional COM GEMINI (substitui GPT)
      if (isFood) {
        console.log('🧠 Chamando Gemini para análise detalhada...');

        try {
          const detailedResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${googleAIApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: `Analise esta mesma imagem e retorne APENAS JSON válido com alto detalhamento e PORÇÕES ESTIMADAS:
{
  "detailed_foods": ["item1", "item2", ...],
  "detailed_liquids": ["bebida1", "bebida2", ...],
  "cooking_methods": ["grelhado", "refogado", ...],
  "seasonings": ["tempero1", "molho1", ...],
  "estimated_calories": numero,
  "confidence": 0.0-1.0,
  "items": [
    {
      "name": "arroz branco",
      "grams": 120,
      "ml": null,
      "method": "cozido",
      "confidence": 0.85
    },
    {
      "name": "suco de laranja",
      "grams": null,
      "ml": 200,
      "method": "liquido",
      "confidence": 0.9
    }
  ]
}

BASE (pt-BR): ${foodKnowledge}

REGRAS:
- Liste todos os alimentos/ingredientes, molhos, temperos e bebidas presentes
- Seja específico nos tipos (ex.: feijão preto, arroz branco, frango grelhado, salada verde)
- Estime gramas (sólidos) ou mL (líquidos) realistas por item
- Não some itens duplicados; prefira mesclar em um único item com quantidade total
- Não use markdown, não use comentários, apenas JSON`
                  },
                  {
                    inline_data: {
                      mime_type: img.mime,
                      data: img.base64
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1200
              }
            })
          });

          if (detailedResponse.ok) {
            const det = await detailedResponse.json();
            const detailText = det.candidates?.[0]?.content?.parts?.[0]?.text || '';
            try {
              const detailJsonMatch = detailText.match(/```json\s*([\s\S]*?)\s*```/) || detailText.match(/\{[\s\S]*\}/);
              if (detailJsonMatch) {
                const detailed = JSON.parse(detailJsonMatch[1] || detailJsonMatch[0]);
                const allFoods = [
                  ...detectedFoods,
                  ...detectedLiquids,
                  ...(detailed.detailed_foods || []),
                  ...(detailed.detailed_liquids || []),
                  ...(detailed.seasonings || [])
                ];
                detectedFoods = removeDuplicatesAndEstimatePortions(allFoods.filter((x: string) => x && x.length > 0));
                estimatedCalories = Math.max(estimatedCalories, detailed.estimated_calories || 0);
                confidence = Math.max(confidence, detailed.confidence || 0);

                // Preferir itens com porção estimada pelo Gemini, se existir e confiável
                const aiItemsRaw: Array<{name: string; grams?: number|null; ml?: number|null; method?: string; confidence?: number}> = Array.isArray(detailed.items) ? detailed.items : [];
                const aiItems: Array<{name: string; grams?: number; ml?: number; method?: string; confidence?: number}> = aiItemsRaw
                  .filter((it) => typeof it?.name === 'string' && (it.grams || it.ml))
                  .map((it) => ({
                    name: it.name,
                    grams: it.grams ?? undefined,
                    ml: it.ml ?? undefined,
                    method: it.method,
                    confidence: typeof it.confidence === 'number' ? it.confidence : undefined
                  }));

                // Sanear valores: clamps e normalização
                function clamp(num: number, min: number, max: number): number { return Math.max(min, Math.min(max, num)); }
                const aiItemsClean = aiItems.map((it) => {
                  const isLiquid = isLiquidName(it.name) || (it.method || '').toLowerCase() === 'liquido' || (it.ml && it.ml > 0);
                  const grams = it.grams && !isLiquid ? clamp(Math.round(it.grams), 10, 800) : undefined;
                  const ml = it.ml && isLiquid ? clamp(Math.round(it.ml), 30, 1000) : undefined;
                  return { ...it, grams, ml };
                });

                // Remover entradas de baixa confiança no modo estrito
                const aiItemsFiltered = portionMode === 'ai_strict'
                  ? aiItemsClean.filter((it) => (it.confidence ?? 1) >= minPortionConfidence)
                  : aiItemsClean;

                // Se muitos itens ou muito extremos, limitar total
                let totalWeight = aiItemsFiltered.reduce((acc, it) => acc + (it.grams || 0), 0);
                if (totalWeight > 1500) {
                  const scale = 1500 / totalWeight;
                  aiItemsFiltered.forEach((it) => { if (it.grams) it.grams = Math.round(it.grams * scale); });
                }

                // Persistir itens AI em variável para uso na chamada determinística
                (globalThis as any).__AI_PORTION_ITEMS__ = aiItemsFiltered;
                console.log('🎯 Análise combinada final (Gemini):', { totalItems: detectedFoods.length, estimatedCalories, confidence });
              }
            } catch (e) {
              console.log('⚠️ Erro ao parsear JSON detalhado do Gemini, mantendo análise inicial:', e);
              const allFoods = [...detectedFoods, ...detectedLiquids];
              detectedFoods = removeDuplicatesAndEstimatePortions(allFoods.filter(item => item && item.length > 0));
            }
          } else {
            console.log('⚠️ Gemini detalhado indisponível, mantendo análise inicial');
            const allFoods = [...detectedFoods, ...detectedLiquids];
            detectedFoods = removeDuplicatesAndEstimatePortions(allFoods.filter(item => item && item.length > 0));
          }
        } catch (err) {
          console.log('⚠️ Falha na análise detalhada com Gemini:', err);
          const allFoods = [...detectedFoods, ...detectedLiquids];
          detectedFoods = removeDuplicatesAndEstimatePortions(allFoods.filter(item => item && item.length > 0));
        }
      }

    } catch (error) {
      console.log('❌ Erro na análise da imagem:', error);
      isFood = false;
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

    // 🔢 Integração determinística: chamar nutrition-calc com itens detectados
    let calcItems: Array<{ name: string; grams?: number; ml?: number; state?: string }>; 
    const aiPortionItems = (globalThis as any).__AI_PORTION_ITEMS__ as Array<{name: string; grams?: number; ml?: number; method?: string}> | undefined;
    if (aiPortionItems && aiPortionItems.length > 0) {
      // Preferir itens estimados pela IA
      calcItems = aiPortionItems.map((it) => ({
        name: it.name,
        grams: isLiquidName(it.name) ? undefined : it.grams,
        ml: isLiquidName(it.name) ? it.ml : undefined,
        state: it.method
      }));
    } else {
      // Fallback: porções padrão
      calcItems = (Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object'
        ? detectedFoods as Array<{nome: string, quantidade: number}>
        : (detectedFoods as string[]).map((n) => ({ nome: n, quantidade: PORCOES_BRASILEIRAS[n.toLowerCase()] || (isLiquidName(n) ? 200 : 100) }))
      )
        .map((f) => ({
          name: f.nome,
          grams: isLiquidName(f.nome) ? undefined : f.quantidade,
          ml: isLiquidName(f.nome) ? f.quantidade : undefined,
        }));
    }

    let calcTotals: any = null;
    let calcResolved: any[] | null = null;
    try {
      const calcRes = await fetch(`${supabaseUrl}/functions/v1/nutrition-calc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: calcItems, locale: 'pt-BR' })
      });
      if (calcRes.ok) {
        const calcJson = await calcRes.json();
        calcTotals = calcJson?.totals || null;
        calcResolved = Array.isArray(calcJson?.resolved) ? calcJson.resolved : null;
      }
    } catch (e) {
      console.log('⚠️ Erro ao chamar nutrition-calc:', e);
    }

    let macrosBlock = '';
    if (calcTotals) {
      // Cálculo por grama com base no peso efetivo total
      let totalGrams = 0;
      if (calcResolved) {
        try {
          totalGrams = calcResolved.reduce((acc: number, it: any) => acc + (Number(it.effective_grams) || 0), 0);
        } catch (_e) { totalGrams = 0; }
      }
      const perGram = totalGrams > 0 ? {
        kcal_pg: calcTotals.kcal / totalGrams,
        protein_pg: calcTotals.protein_g / totalGrams,
        carbs_pg: calcTotals.carbs_g / totalGrams,
        fat_pg: calcTotals.fat_g / totalGrams,
        fiber_pg: calcTotals.fiber_g / totalGrams,
      } : null;

      const perGramText = perGram ? `\n- Por grama: ${perGram.kcal_pg.toFixed(2)} kcal/g, P ${perGram.protein_pg.toFixed(3)} g/g, C ${perGram.carbs_pg.toFixed(3)} g/g, G ${perGram.fat_pg.toFixed(3)} g/g` : '';

      macrosBlock = `📊 Nutrientes (determinístico):\n- Calorias: ${Math.round(calcTotals.kcal)} kcal\n- Proteínas: ${calcTotals.protein_g.toFixed(1)} g\n- Carboidratos: ${calcTotals.carbs_g.toFixed(1)} g\n- Gorduras: ${calcTotals.fat_g.toFixed(1)} g\n- Fibras: ${calcTotals.fiber_g.toFixed(1)} g\n- Sódio: ${calcTotals.sodium_mg.toFixed(0)} mg${perGramText}\n\n`;
    }

    const finalMessage = `Oi ${actualUserName}! 😊 

📸 Analisei sua refeição e identifiquei:
${comboInfo}${foodList}

${macrosBlock}🤔 Esses alimentos estão corretos?`;

    // 💾 Salvar análise no banco ANTES da confirmação (corrigido para guest users)
    let savedAnalysis = null;
    
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

    return new Response(JSON.stringify({
      success: true,
      requires_confirmation: true,
      analysis_id: savedAnalysis?.id,
      sofia_analysis: {
        analysis: finalMessage,
        personality: 'amigavel',
        foods_detected: detectedFoods,
        confidence: confidence,
        estimated_calories: calcTotals ? Math.round(calcTotals.kcal) : estimatedCalories,
        nutrition_totals: calcTotals || null,
        confirmation_required: true
      },
      food_detection: {
        foods_detected: detectedFoods,
        is_food: true,
        confidence: confidence,
        estimated_calories: calcTotals ? Math.round(calcTotals.kcal) : estimatedCalories,
        nutrition_totals: calcTotals || null,
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