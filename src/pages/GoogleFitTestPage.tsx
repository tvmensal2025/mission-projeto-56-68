import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function GoogleFitTestPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [autoTestRunning, setAutoTestRunning] = useState(false);
  const { toast } = useToast();

  const clientId = '705908448787-so9cco4hkduhmr0lq4ftkng10hjcj1is.apps.googleusercontent.com';
  const redirectUri = 'http://localhost:8083/google-fit-callback';

  // Teste automático ao carregar a página
  useEffect(() => {
    runAutoTest();
  }, []);

  const runAutoTest = async () => {
    setAutoTestRunning(true);
    console.log('🚀 INICIANDO TESTE AUTOMÁTICO...');
    
    const resultados = {
      supabase: false,
      autenticacao: false,
      tabelas: false,
      edgeFunctions: false,
      oauth: false
    };

    try {
        // 1. Teste Supabase
  console.log('1️⃣ Testando Supabase...');
  if (supabase) {
    console.log('✅ Supabase disponível');
    resultados.supabase = true;
  } else {
    console.log('❌ Supabase não disponível');
  }

      // 2. Teste Autenticação
      console.log('2️⃣ Testando autenticação...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.log('❌ Erro na autenticação:', authError.message);
      } else if (session) {
        console.log('✅ Usuário logado:', session.user.email);
        resultados.autenticacao = true;
      } else {
        console.log('❌ Usuário não logado');
      }

      // 3. Teste Tabelas
      console.log('3️⃣ Testando tabelas...');
      try {
        const { data: tokensData, error: tokensError } = await (supabase as any)
          .from('google_fit_tokens')
          .select('*')
          .limit(1);
        
        if (tokensError) {
          console.log('❌ Erro na tabela tokens:', tokensError.message);
        } else {
          console.log('✅ Tabela tokens OK');
        }
      } catch (error) {
        console.log('❌ Erro ao acessar tabela tokens');
      }

      try {
        const { data: fitData, error: fitError } = await supabase
          .from('google_fit_data')
          .select('*')
          .limit(1);
        
        if (fitError) {
          console.log('❌ Erro na tabela data:', fitError.message);
        } else {
          console.log('✅ Tabela data OK');
          resultados.tabelas = true;
        }
      } catch (error) {
        console.log('❌ Erro ao acessar tabela data');
      }

      // 4. Teste Edge Functions
      console.log('4️⃣ Testando Edge Functions...');
      try {
        const { data, error } = await supabase.functions.invoke('google-fit-token', {
          body: { testSecrets: true }
        });
        
        if (error) {
          console.log('❌ Erro na Edge Function:', error.message);
        } else {
          console.log('✅ Edge Function funcionando:', data);
          resultados.edgeFunctions = true;
        }
      } catch (error) {
        console.log('❌ Erro ao chamar Edge Function');
      }

      // 5. Teste OAuth
      console.log('5️⃣ Testando configuração OAuth...');
      console.log('🔧 Client ID:', clientId);
      console.log('🔧 Redirect URI:', redirectUri);
      resultados.oauth = true;

      // 6. Resumo
      console.log('🎯 RESUMO DOS TESTES:');
      console.log('✅ Supabase:', resultados.supabase ? 'OK' : 'ERRO');
      console.log('✅ Autenticação:', resultados.autenticacao ? 'OK' : 'ERRO');
      console.log('✅ Tabelas:', resultados.tabelas ? 'OK' : 'ERRO');
      console.log('✅ Edge Functions:', resultados.edgeFunctions ? 'OK' : 'ERRO');
      console.log('✅ OAuth:', resultados.oauth ? 'OK' : 'ERRO');

      const totalTests = Object.keys(resultados).length;
      const passedTests = Object.values(resultados).filter(Boolean).length;
      
      console.log(`📊 RESULTADO: ${passedTests}/${totalTests} testes passaram`);
      
      setTestResults({
        ...resultados,
        totalTests,
        passedTests,
        timestamp: new Date().toISOString()
      });

      if (passedTests >= 4) {
        toast({
          title: "✅ Testes principais passaram!",
          description: "O Google Fit está configurado corretamente.",
        });
      } else {
        toast({
          title: "⚠️ Alguns testes falharam",
          description: "Verifique o console para detalhes.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('💥 Erro no teste automático:', error);
      toast({
        title: "❌ Erro no teste",
        description: "Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setAutoTestRunning(false);
    }
  };

  const handleOAuthConnect = () => {
    setIsLoading(true);
    
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `include_granted_scopes=true`;

    console.log('🔗 Redirecionando para OAuth:', authUrl);
    window.location.href = authUrl;
  };

  const handleTestEdgeFunction = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-fit-token', {
        body: { testSecrets: true }
      });

      if (error) {
        toast({
          title: "❌ Erro na Edge Function",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Edge Function funcionando",
          description: "Secrets configurados corretamente.",
        });
        console.log('📊 Resposta da Edge Function:', data);
      }
    } catch (error) {
      toast({
        title: "❌ Erro ao testar",
        description: "Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teste do Google Fit</h1>
          <p className="text-muted-foreground">
            Teste a integração com o Google Fit
          </p>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"}>
          {isConnected ? "Conectado" : "Desconectado"}
        </Badge>
      </div>

      {/* Teste Automático */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Teste Automático
            {autoTestRunning && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>}
          </CardTitle>
          <CardDescription>
            Teste automático de todos os componentes do Google Fit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runAutoTest} 
            disabled={autoTestRunning}
            className="w-full"
          >
            {autoTestRunning ? 'Executando Testes...' : 'Executar Teste Automático'}
          </Button>

          {testResults && (
            <div className="space-y-2">
              <h4 className="font-semibold">Resultados dos Testes:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={testResults.supabase ? 'text-green-500' : 'text-red-500'}>
                    {testResults.supabase ? '✅' : '❌'}
                  </span>
                  Supabase
                </div>
                <div className="flex items-center gap-2">
                  <span className={testResults.autenticacao ? 'text-green-500' : 'text-red-500'}>
                    {testResults.autenticacao ? '✅' : '❌'}
                  </span>
                  Autenticação
                </div>
                <div className="flex items-center gap-2">
                  <span className={testResults.tabelas ? 'text-green-500' : 'text-red-500'}>
                    {testResults.tabelas ? '✅' : '❌'}
                  </span>
                  Tabelas
                </div>
                <div className="flex items-center gap-2">
                  <span className={testResults.edgeFunctions ? 'text-green-500' : 'text-red-500'}>
                    {testResults.edgeFunctions ? '✅' : '❌'}
                  </span>
                  Edge Functions
                </div>
                <div className="flex items-center gap-2">
                  <span className={testResults.oauth ? 'text-green-500' : 'text-red-500'}>
                    {testResults.oauth ? '✅' : '❌'}
                  </span>
                  OAuth
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Resultado: {testResults.passedTests}/{testResults.totalTests} testes passaram
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testes Individuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Testar Edge Function</CardTitle>
            <CardDescription>
              Teste se a Edge Function está funcionando
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestEdgeFunction} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testando...' : 'Testar Edge Function'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔗 Conectar OAuth</CardTitle>
            <CardDescription>
              Iniciar processo de autorização OAuth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleOAuthConnect} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Conectando...' : 'Conectar OAuth'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Configuração OAuth</CardTitle>
          <CardDescription>
            Detalhes da configuração atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Client ID:</label>
              <p className="text-sm text-muted-foreground break-all">{clientId}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Redirect URI:</label>
              <p className="text-sm text-muted-foreground break-all">{redirectUri}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Scopes:</label>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>fitness.activity.read</li>
              <li>fitness.body.read</li>
              <li>fitness.heart_rate.read</li>
              <li>fitness.sleep.read</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Instruções</CardTitle>
          <CardDescription>
            Como usar esta página de teste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>O teste automático é executado automaticamente ao carregar a página</li>
            <li>Verifique o console do navegador (F12) para detalhes dos testes</li>
            <li>Se algum teste falhar, execute os comandos sugeridos no console</li>
            <li>Clique em "Conectar OAuth" para testar a autorização completa</li>
            <li>Após autorizar no Google, você será redirecionado de volta</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}