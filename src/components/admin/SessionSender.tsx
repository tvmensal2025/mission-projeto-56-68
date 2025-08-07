import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Users, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionSenderProps {
  sessionId: string;
  sessionTitle: string;
  userIds?: string[];
  onSuccess?: () => void;
}

export const SessionSender: React.FC<SessionSenderProps> = ({
  sessionId,
  sessionTitle,
  userIds = [],
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  const sendToAllUsers = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      const { data, error } = await supabase.rpc('assign_session_to_all_users', {
        session_id_param: sessionId,
        admin_user_id: currentUser?.id
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string; error?: string; assignments_created?: number };
      
      if (result?.success) {
        toast({
          title: "✅ Sucesso!",
          description: result.message || "Sessão enviada para todos os usuários"
        });
        onSuccess?.();
      } else {
        throw new Error(result?.error || "Erro desconhecido");
      }
    } catch (error: any) {
      console.error('Error sending session to all users:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Não foi possível enviar a sessão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendToSelectedUsers = async () => {
    if (userIds.length === 0) {
      toast({
        title: "⚠️ Atenção",
        description: "Nenhum usuário selecionado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      const { data, error } = await supabase.rpc('assign_session_to_users', {
        session_id_param: sessionId,
        user_ids_param: userIds,
        admin_user_id: currentUser?.id
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string; error?: string; assignments_created?: number };
      
      if (result?.success) {
        toast({
          title: "✅ Sucesso!",
          description: result.message || `Sessão enviada para ${result.assignments_created || userIds.length} usuários`
        });
        onSuccess?.();
      } else {
        throw new Error(result?.error || "Erro desconhecido");
      }
    } catch (error: any) {
      console.error('Error sending session to selected users:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Não foi possível enviar a sessão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Enviar Sessão
        </CardTitle>
        <CardDescription>
          {sessionTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            onClick={sendToSelectedUsers}
            disabled={loading || userIds.length === 0}
            variant="outline"
            className="w-full"
          >
            <User className="w-4 h-4 mr-2" />
            Enviar para Selecionados ({userIds.length})
          </Button>
          
          <Button 
            onClick={sendToAllUsers}
            disabled={loading}
            className="w-full"
          >
            <Users className="w-4 h-4 mr-2" />
            Enviar para Todos os Usuários
          </Button>
        </div>
        
        {loading && (
          <div className="text-center text-sm text-muted-foreground">
            Enviando sessão...
          </div>
        )}
      </CardContent>
    </Card>
  );
};