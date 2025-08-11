import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const GoogleFitCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        if (error) throw new Error(`OAuth error: ${error}`);
        if (!code) throw new Error('Código de autorização não encontrado');

        setMessage('Processando autorização...');

        // redirect_uri dinâmico (ambiente atual)
        const redirectUri = window.location.origin + window.location.pathname;
        const { data, error: tokenError } = await supabase.functions.invoke('google-fit-token', {
          body: { code, redirect_uri: redirectUri }
        });
        if (tokenError) throw new Error(tokenError.message);

        if (data && data.access_token) {
          setStatus('success');
          setMessage('Conectado! Sincronizando em segundo plano...');

          // Dispara sincronização em background (não bloquear navegação)
          setTimeout(() => {
            supabase.functions.invoke('google-fit-sync', {
              body: {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                date_range: {
                  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0]
                }
              }
            }).catch(() => {/* silencioso */});
          }, 0);

          // Redireciona imediatamente para o dashboard
          window.location.replace('/dashboard');
          return;
        }

        throw new Error('Tokens não recebidos');
      } catch (error: any) {
        setStatus('error');
        setMessage(`Erro: ${error.message || 'Erro desconhecido'}`);
        toast({ title: 'Erro na Conexão', description: error.message || 'Erro ao conectar com Google Fit', variant: 'destructive' });
        // Fallback: enviar usuário ao dashboard mesmo em erro
        setTimeout(() => { window.location.replace('/dashboard'); }, 2000);
      }
    };

    setTimeout(handleCallback, 200);
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle>
            {status === 'loading' && 'Conectando Google Fit...'}
            {status === 'success' && 'Conectado com Sucesso!'}
            {status === 'error' && 'Erro na Conexão'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button onClick={() => window.location.replace('/dashboard')} className="w-full">
            <Activity className="h-4 w-4 mr-2" /> Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};