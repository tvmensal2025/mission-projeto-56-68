// EXECUTAR TODOS OS TESTES DO GOOGLE FIT
// Execute este script no console do navegador

async function executarTodosTestes() {
  console.log('🚀 EXECUTANDO TODOS OS TESTES DO GOOGLE FIT');
  console.log('==========================================');
  
  const resultados = {
    supabase: false,
    autenticacao: false,
    tabelas: false,
    edgeFunctions: false,
    oauth: false,
    dados: false
  };
  
  try {
    // 1. TESTE SUPABASE
    console.log('\n1️⃣ TESTANDO SUPABASE...');
    if (!window.supabase) {
      console.log('❌ Supabase não está disponível');
      return;
    }
    console.log('✅ Supabase disponível');
    resultados.supabase = true;
    
    // 2. TESTE AUTENTICAÇÃO
    console.log('\n2️⃣ TESTANDO AUTENTICAÇÃO...');
    const { data: { session }, error: authError } = await window.supabase.auth.getSession();
    
    if (authError || !session) {
      console.log('❌ Usuário não está logado');
      console.log('💡 Redirecionando para login...');
      window.location.href = '/auth';
      return;
    }
    
    console.log('✅ Usuário logado:', session.user.email);
    resultados.autenticacao = true;
    
    // 3. TESTE TABELAS
    console.log('\n3️⃣ TESTANDO TABELAS...');
    
    // Testar google_fit_tokens
    const { data: tokensData, error: tokensError } = await window.supabase
      .from('google_fit_tokens')
      .select('*')
      .limit(1);
    
    if (tokensError) {
      console.log('❌ Erro na tabela google_fit_tokens:', tokensError.message);
      console.log('💡 Execute o SQL no Supabase SQL Editor:');
      console.log(`
-- Execute este SQL no Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS google_fit_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE google_fit_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own Google Fit tokens" ON google_fit_tokens;
CREATE POLICY "Users can manage their own Google Fit tokens" ON google_fit_tokens
  FOR ALL USING (auth.uid() = user_id);
      `);
    } else {
      console.log('✅ Tabela google_fit_tokens OK');
    }
    
    // Testar google_fit_data
    const { data: fitData, error: fitError } = await window.supabase
      .from('google_fit_data')
      .select('*')
      .limit(1);
    
    if (fitError) {
      console.log('❌ Erro na tabela google_fit_data:', fitError.message);
      console.log('💡 Execute o SQL no Supabase SQL Editor:');
      console.log(`
-- Execute este SQL no Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS google_fit_data (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  value REAL,
  unit TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  source TEXT,
  active_minutes INTEGER DEFAULT 0,
  sleep_duration_hours DECIMAL(4,2) DEFAULT 0,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  heart_rate_resting INTEGER,
  heart_rate_max INTEGER,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can manage their own Google Fit data" ON google_fit_data
  FOR ALL USING (auth.uid() = user_id);
      `);
    } else {
      console.log('✅ Tabela google_fit_data OK');
    }
    
    resultados.tabelas = true;
    
    // 4. TESTE EDGE FUNCTIONS
    console.log('\n4️⃣ TESTANDO EDGE FUNCTIONS...');
    
    // Testar google-fit-token
    const { data, error } = await window.supabase.functions.invoke('google-fit-token', {
      body: {
        testSecrets: true
      }
    });
    
    if (error) {
      console.log('❌ Erro na função google-fit-token:', error.message);
    } else {
      console.log('✅ Função google-fit-token funcionando');
      console.log('📊 Secrets configurados:', data);
    }
    
    resultados.edgeFunctions = true;
    
    // 5. TESTE OAUTH
    console.log('\n5️⃣ TESTANDO CONFIGURAÇÃO OAUTH...');
    
    const clientId = '705908448787-so9cco4hkduhmr0lq4ftkng10hjcj1is.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:8083/google-fit-callback';
    
    console.log('🔧 Configuração OAuth:');
    console.log('- Client ID:', clientId);
    console.log('- Redirect URI:', redirectUri);
    
    resultados.oauth = true;
    
    // 6. TESTE DADOS EXISTENTES
    console.log('\n6️⃣ TESTANDO DADOS EXISTENTES...');
    
    const { data: existingTokens } = await window.supabase
      .from('google_fit_tokens')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (existingTokens && existingTokens.length > 0) {
      console.log('✅ Tokens encontrados:', existingTokens.length);
      resultados.dados = true;
    } else {
      console.log('ℹ️ Nenhum token encontrado - precisa fazer OAuth');
    }
    
    // 7. RESUMO FINAL
    console.log('\n🎯 RESUMO DOS TESTES:');
    console.log('=====================');
    console.log('✅ Supabase:', resultados.supabase ? 'OK' : 'ERRO');
    console.log('✅ Autenticação:', resultados.autenticacao ? 'OK' : 'ERRO');
    console.log('✅ Tabelas:', resultados.tabelas ? 'OK' : 'ERRO');
    console.log('✅ Edge Functions:', resultados.edgeFunctions ? 'OK' : 'ERRO');
    console.log('✅ OAuth:', resultados.oauth ? 'OK' : 'ERRO');
    console.log('✅ Dados:', resultados.dados ? 'OK' : 'ERRO');
    
    const totalTests = Object.keys(resultados).length;
    const passedTests = Object.values(resultados).filter(Boolean).length;
    
    console.log(`\n📊 RESULTADO: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests >= 4) {
      console.log('✅ TESTES PRINCIPAIS PASSARAM!');
      console.log('💡 Agora vamos testar o OAuth completo...');
      
      // 8. TESTE OAUTH COMPLETO
      console.log('\n🚀 INICIANDO TESTE OAUTH COMPLETO...');
      console.log('💡 Redirecionando para teste OAuth...');
      
      setTimeout(() => {
        window.location.href = '/google-fit-test';
      }, 3000);
      
    } else {
      console.log('⚠️ ALGUNS TESTES FALHARAM');
      console.log('💡 Verifique os erros acima e execute os comandos sugeridos');
    }
    
  } catch (error) {
    console.error('💥 Erro nos testes:', error);
  }
}

// Executar todos os testes
executarTodosTestes();
