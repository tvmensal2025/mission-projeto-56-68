import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const geminiApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
const ollamaBaseUrl = Deno.env.get('OLLAMA_BASE_URL') || 'http://ollama:11434';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  service?: 'openai' | 'gemini' | 'ollama';
  messages?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  functionality?: string; // opcional: usar configuração do DB
}

const callOpenAI = async (messages: any[], model: string, temperature: number, max_tokens: number) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || 'Erro na resposta',
    usage: data.usage,
    model: data.model
  };
};

const callGemini = async (prompt: string, model: string, temperature: number, max_tokens: number) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: max_tokens,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro na resposta Gemini',
    usage: { total_tokens: max_tokens },
    model: model
  };
};

// Ollama (local) - chama o endpoint de chat do Ollama
const callOllama = async (
  messages: any[] | undefined,
  prompt: string | undefined,
  model: string,
  temperature: number,
  max_tokens: number
) => {
  const url = `${ollamaBaseUrl.replace(/\/$/, '')}/api/chat`;

  // Converter prompt em mensagens caso necessário
  const chatMessages = messages && messages.length > 0
    ? messages
    : [{ role: 'user', content: prompt || '' }];

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      options: {
        temperature,
        num_predict: max_tokens,
      },
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();

  // Estruturas possíveis: { message: { content } } ou { response }
  const content = data?.message?.content || data?.response || 'Erro na resposta Ollama';

  return {
    content,
    // Ollama não retorna tokens; aproximar por max_tokens solicitado
    usage: { total_tokens: max_tokens },
    model,
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let { 
      service = 'openai', 
      messages, 
      prompt, 
      model = 'gpt-4.1-2025-04-14', 
      temperature = 0.7, 
      max_tokens = 1000,
      functionality
    }: ChatRequest = await req.json();

    // Se functionality informada, buscar configs no DB e sobrescrever parâmetros
    if (functionality) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (supabaseUrl && supabaseKey) {
          const sb = createClient(supabaseUrl, supabaseKey);
          const { data: cfg, error: cfgErr } = await sb
            .from('ai_configurations')
            .select('service, model, max_tokens, temperature, system_prompt, level, preset_level, is_enabled')
            .eq('functionality', functionality)
            .single();
          if (!cfgErr && cfg && cfg.is_enabled !== false) {
            service = (cfg.service || service) as typeof service;
            model = cfg.model || model;
            max_tokens = cfg.max_tokens ?? max_tokens;
            temperature = cfg.temperature ?? temperature;
            // Injetar system_prompt se existir e ainda não houver mensagem de sistema
            const hasSystem = Array.isArray(messages) && messages.some(m => m.role === 'system');
            if (cfg.system_prompt && !hasSystem) {
              messages = [
                { role: 'system' as const, content: cfg.system_prompt },
                ...(messages || (prompt ? [{ role: 'user' as const, content: prompt }] : []))
              ];
              prompt = undefined; // já convertido para messages
            }
          }
        }
      } catch (err) {
        console.warn('Falha ao carregar configuração de IA para', functionality, err);
      }
    }

    console.log(`Processando ${service} - Model: ${model}`);

    let result: any;

    if (service === 'ollama') {
      if (!ollamaBaseUrl) {
        throw new Error('OLLAMA_BASE_URL não está configurada');
      }
      result = await callOllama(messages, prompt, model, temperature, max_tokens);
    } else if (service === 'gemini') {
      if (!geminiApiKey) {
        throw new Error('GOOGLE_AI_API_KEY não está configurada');
      }
      // Para Gemini, converter messages em prompt ou usar prompt direto
      const promptText = prompt || messages?.map(m => `${m.role}: ${m.content}`).join('\n') || '';
      result = await callGemini(promptText, model, temperature, max_tokens);
    } else {
      if (!openAIApiKey) {
        throw new Error('OPENAI_API_KEY não está configurada');
      }
      // Para OpenAI, usar messages ou converter prompt
      const messagesArray = messages || [{ role: 'user' as const, content: prompt || '' }];
      if (!messagesArray.length) {
        throw new Error('Messages ou prompt são obrigatórios');
      }
      result = await callOpenAI(messagesArray, model, temperature, max_tokens);
    }

    console.log(`Resposta ${service} recebida - Tokens: ${result.usage?.total_tokens || 'N/A'}`);

    // Registrar log básico se possível
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey);
        await sb.from('ai_system_logs').insert({
          event_type: 'chat_request',
          functionality: functionality || 'generic',
          level: 'info',
          description: `Provider=${service} Model=${model}`,
          config_snapshot: { service, model, temperature, max_tokens },
          metadata: { usage: result?.usage, has_messages: !!messages, has_prompt: !!prompt },
          timestamp: new Date().toISOString()
        });
      }
    } catch (_) {}

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na edge function gpt-chat:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro interno na função de chat'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});