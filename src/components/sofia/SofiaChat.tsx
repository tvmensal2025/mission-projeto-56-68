import React, { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Bot, User as UserIcon, Mic, Camera, Send, Image, X, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface SofiaChatProps {
  user: User | null;
}

const SofiaChat: React.FC<SofiaChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Criar mensagem inicial quando o usuário estiver disponível
  useEffect(() => {
    if (user && messages.length === 0) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'querido(a)';
      setMessages([{
        id: '1',
        type: 'sofia',
        content: `Oi ${userName}! 👋 Sou a Sofia, sua nutricionista virtual do Instituto dos Sonhos!

Estou aqui para te ajudar com:
🍽️ Análise de refeições (envie fotos!)
📊 Dicas nutricionais personalizadas
💪 Orientações sobre alimentação saudável
🎯 Apoio na sua jornada de transformação

O que você gostaria de conversar hoje? Pode me enviar uma foto da sua refeição ou fazer qualquer pergunta sobre nutrição! ✨`,
        timestamp: new Date()
      }]);
    }
  }, [user, messages.length]);

  // Buscar convites pendentes (metas em grupo) para este usuário
  async function loadPendingInvites() {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_goal_invitations')
        .select('id, goal_id, invitee_name, invitee_email, status, created_at')
        .eq('invitee_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (!error) setPendingInvites(data || []);
    } catch (e) {
      console.error('Erro ao carregar convites:', e);
    }
  }

  useEffect(() => { loadPendingInvites(); }, [user]);
  useEffect(() => {
    const i = setInterval(() => loadPendingInvites(), 30000);
    return () => clearInterval(i);
  }, [user]);

  async function acceptInvite(inviteId: string, goalId: string) {
    try {
      if (!user) return;
      // inserir participação
      await supabase.from('user_goal_participants').insert({ goal_id: goalId, user_id: user.id, can_view_progress: true });
      // atualizar convite
      await supabase.from('user_goal_invitations').update({ status: 'approved' }).eq('id', inviteId);
      await loadPendingInvites();
      toast.success('Meta sincronizada! Vocês poderão ver o progresso um do outro.');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'sofia',
        content: 'Parabéns! 🎉 Sua nova meta compartilhada foi aprovada e sincronizada. Estou aqui para te ajudar nessa jornada!',
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
      toast.error('Não foi possível aceitar o convite.');
    }
  }

  async function rejectInvite(inviteId: string) {
    try {
      await supabase.from('user_goal_invitations').update({ status: 'rejected' }).eq('id', inviteId);
      await loadPendingInvites();
      toast.info('Convite recusado.');
    } catch (e) {
      console.error(e);
      toast.error('Não foi possível recusar o convite.');
    }
  }

  // Auto scroll para a última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      if (!user) {
        toast.error('Você precisa estar logado para enviar imagens');
        return null;
      }

      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        toast.error('Erro ao fazer upload da imagem');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem');
      return null;
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 10) return 'breakfast';
    else if (currentHour >= 11 && currentHour < 15) return 'lunch';
    else if (currentHour >= 18 && currentHour < 22) return 'dinner';
    else return 'snack';
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || !user || isLoading) return;

    let imageUrl: string | undefined;

    // Upload da imagem se houver
    if (selectedImage) {
      toast.info('📸 Fazendo upload da imagem...');
      imageUrl = await handleImageUpload(selectedImage);
      if (!imageUrl) return; // Para se falhou o upload
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage || '📷 Imagem enviada',
      timestamp: new Date(),
      imageUrl
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      let data, error;

      if (imageUrl) {
        toast.info('🔍 Sofia está analisando sua imagem...');
        const analysisResult = await supabase.functions.invoke('sofia-image-analysis', {
          body: {
            imageUrl: imageUrl,
            userId: user.id,
            userContext: {
              currentMeal: getMealType(),
              message: currentMessage
            }
          }
        });

        if (analysisResult.data && analysisResult.data.sofia_analysis) {
          const analysis = analysisResult.data.sofia_analysis;
          data = {
            response: analysis.formatted_response || analysis.analysis || 'Analisei sua refeição!',
            character: 'Sof.ia'
          };
          error = analysisResult.error;
          toast.success('✅ Análise da Sofia concluída!');
        } else {
          data = {
            response: analysisResult.data?.message || 'Não consegui identificar alimentos na imagem. Tente uma foto mais clara ou descreva sua refeição!',
            character: 'Sof.ia'
          };
          error = null;
        }
      } else {
        const chatResult = await supabase.functions.invoke('health-chat-bot', {
          body: {
            message: currentMessage,
            userId: user.id,
            conversationHistory
          }
        });
        data = chatResult.data;
        error = chatResult.error;
      }

      if (error) {
        console.error('❌ Erro da Edge Function:', error);
        throw new Error(error.message || 'Erro na comunicação com o servidor');
      }

      const sofiaMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: data.response || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, sofiaMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente!');
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'sofia',
        content: 'Ops! Tive um probleminha técnico. Pode tentar novamente? 😊',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicClick = () => {
    toast.info('🎤 Funcionalidade de áudio em desenvolvimento!');
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="space-y-4">
      {/* Notificações de novas metas (Sofia pisca) */}
      {pendingInvites.length > 0 && (
        <Card className="border-2 border-amber-300 bg-amber-50 animate-pulse">
          <CardContent className="p-4">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-amber-800 text-sm">
                  ✨ Nova meta compartilhada com você! Aguardando sua aprovação.
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => acceptInvite(inv.id, inv.goal_id)}>Aceitar</Button>
                  <Button size="sm" variant="outline" onClick={() => rejectInvite(inv.id)}>Recusar</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="bg-gray-50 border-2 border-dashed border-gray-200">
        <CardContent className="p-4">
          <ScrollArea className="h-[500px] pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map(message => (
                <div key={message.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - 
                    {message.type === 'user' ? ` ${userName}:` : ' Sof.ia:'}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-100 text-blue-900 ml-8' 
                      : 'bg-purple-100 text-purple-900'
                  }`}>
                    {message.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Imagem enviada" 
                          className="max-w-full h-auto rounded-lg border" 
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">
                      {message.type === 'sofia' ? (
                        <div className="flex items-start gap-2">
                          <Bot className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span>{message.content}</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <UserIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>"{message.content}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Sofia está digitando...</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Image Preview */}
      {imagePreview && (
        <Card className="border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeSelectedImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Imagem selecionada. Clique em "Enviar" para que Sofia analise sua refeição!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Area */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="⌨️ Digite sua refeição, dúvida ou envie uma foto..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handleMicClick} 
              disabled={isLoading}
              title="Funcionalidade de áudio (em desenvolvimento)"
            >
              <Mic className="h-4 w-4" />
              Áudio
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handleCameraClick} 
              disabled={isLoading}
              title="Tirar foto"
            >
              <Camera className="h-4 w-4" />
              Câmera
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handleGalleryClick} 
              disabled={isLoading}
              title="Selecionar da galeria"
            >
              <Image className="h-4 w-4" />
              Galeria
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              title="Enviar mensagem"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file inputs */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleImageSelect} 
        className="hidden" 
      />
      <input 
        ref={cameraInputRef} 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={handleImageSelect} 
        className="hidden" 
      />
    </div>
  );
};

export default SofiaChat;