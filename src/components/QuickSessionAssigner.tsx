import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const QuickSessionAssigner: React.FC = () => {
  const { toast } = useToast();

  const assignTestSession = async () => {
    try {
      // Atribuir primeira sessão ativa ao usuário atual
      const userId = '48a9a95d-adbc-4cf7-9450-c52899b0edfc';
      const sessionId = '896fedea-2dbc-4faa-92b1-ea08fbc4b40c'; // Roda das Competências

      const assignment = {
        user_id: userId,
        session_id: sessionId,
        status: 'pending',
        progress: 0,
        assigned_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_sessions')
        .upsert([assignment], { 
          onConflict: 'user_id,session_id',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Erro ao atribuir sessão:', error);
        toast({
          title: "Erro",
          description: `Erro ao atribuir sessão: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Sessão Atribuída!",
          description: "Sessão de teste foi atribuída com sucesso",
        });
      }

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const assignAllSessions = async () => {
    try {
      // Usar a nova função SQL
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.rpc('assign_session_to_all_users', {
        session_id_param: '896fedea-2dbc-4faa-92b1-ea08fbc4b40c', // Roda das Competências
        admin_user_id: user?.id
      });

      if (error) {
        console.error('Erro ao atribuir sessões:', error);
        toast({
          title: "Erro",
          description: `Erro ao atribuir sessões: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      const result = data as { success: boolean; message?: string; error?: string };
      
      if (result?.success) {
        toast({
          title: "✅ Sessão Atribuída!",
          description: result.message || "Sessão atribuída para todos os usuários",
        });
      } else {
        toast({
          title: "Erro",
          description: result?.error || "Erro desconhecido",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Teste de Atribuição
        </CardTitle>
        <CardDescription>
          Atribuir sessões para teste
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={assignTestSession}
          className="w-full"
          variant="outline"
        >
          Atribuir 1 Sessão de Teste
        </Button>
        
        <Button 
          onClick={assignAllSessions}
          className="w-full"
        >
          Atribuir Todas as Sessões
        </Button>
      </CardContent>
    </Card>
  );
};