import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send,
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import SofiaConfirmationModal from './sofia/SofiaConfirmationModal';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  hasImage?: boolean;
  imageUrl?: string;
}

interface HealthChatBotProps {
  user?: any;
}

const HealthChatBot: React.FC<HealthChatBotProps> = ({ user: propUser }) => {
  const { user } = useAuth();
  const currentUser = propUser || user;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'sofia',
      content: `👋 Oi! Sou a Sofia, sua nutricionista virtual do Instituto dos Sonhos!\n\nEstou aqui para te ajudar com:\n📸 Análise de refeições (envie fotos!)\n📊 Dicas nutricionais personalizadas\n🍎 Orientações sobre alimentação saudável\n🎯 Apoio na sua jornada de transformação\n\nO que você gostaria de conversar hoje? Pode me enviar uma foto da sua refeição ou fazer qualquer pergunta sobre nutrição! ✨`,
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Chamar edge function do chat bot
      const { data, error } = await supabase.functions.invoke('health-chat-bot', {
        body: {
          message: inputMessage,
          userId: currentUser?.id || 'guest',
          userName: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'usuário'
        }
      });

      if (error) throw error;

      const sofiaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: data.response || 'Desculpe, tive um problema para processar sua mensagem. Pode tentar novamente?',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, sofiaResponse]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: 'Ops! Tive um probleminha técnico. Pode tentar novamente? 🤖💭',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || isLoading) return;

    setIsLoading(true);

    try {
      // Upload da imagem
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Adicionar mensagem do usuário
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: 'Enviou uma foto da refeição 📸',
        timestamp: new Date(),
        hasImage: true,
        imageUrl
      };

      setMessages(prev => [...prev, userMessage]);

      // Chamar análise da Sofia
      const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
        body: {
          imageUrl,
          userId: currentUser?.id || 'guest',
          userContext: {
            currentMeal: 'refeicao',
            userName: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'usuário'
          }
        }
      });

      if (error) throw error;

      let sofiaContent = '';
      if (data.success && data.requires_confirmation) {
        // Mostrar modal de confirmação OBRIGATÓRIO
        const userName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'usuário';
        
        const sofiaResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'sofia',
          content: data.sofia_analysis?.analysis || 'Analisei sua refeição!',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, sofiaResponse]);
        
        // Configurar dados para o modal de confirmação
        const foodsForModal = (data.food_detection?.foods_detected && data.food_detection.foods_detected.length > 0)
          ? data.food_detection.foods_detected
          : (data.sofia_analysis?.foods_detected && data.sofia_analysis.foods_detected.length > 0)
            ? data.sofia_analysis.foods_detected
            : (data.alimentos_identificados || []);
        setPendingAnalysis({
          analysisId: data.analysis_id,
          detectedFoods: foodsForModal,
          userName: userName
        });
        
        setShowConfirmationModal(true);
        toast.success('📸 Análise concluída! Confirme os alimentos.');
        
      } else if (data.success) {
        // Resposta sem confirmação (não deveria acontecer)
        const foodList = data.alimentos_identificados?.join(', ') || 'vários alimentos';
        sofiaContent = `📸 Analisei sua refeição!\n\n✨ Identifiquei: ${foodList}`;
        
        const sofiaResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'sofia',
          content: sofiaContent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, sofiaResponse]);
        toast.success('Foto analisada pela Sofia!');
        
      } else {
        // Erro na análise
        sofiaContent = data.message || 'Não consegui analisar a imagem. Pode me contar o que você está comendo?';
        
        const sofiaResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'sofia',
          content: sofiaContent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, sofiaResponse]);
      }

    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: 'Ops! Tive problemas para analisar sua foto. Pode tentar novamente ou me contar o que você está comendo?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Erro ao processar imagem');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implementar gravação de áudio
    toast.info('Funcionalidade de áudio em desenvolvimento');
  };

  const handleConfirmation = (response: string, calories?: number) => {
    const sofiaResponse: Message = {
      id: Date.now().toString(),
      type: 'sofia',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, sofiaResponse]);
    setPendingAnalysis(null);
    setShowConfirmationModal(false);
    
    if (calories) {
      toast.success(`✅ Análise confirmada! ${calories} kcal estimadas.`);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed z-50 ${
        isMinimized 
          ? 'bottom-4 right-4 w-80 h-16' 
          : 'bottom-4 right-4 w-96 h-[600px]'
      }`}
    >
      <Card className="h-full flex flex-col bg-white shadow-xl border border-purple-200">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm">Sofia - Nutricionista Virtual</CardTitle>
                <p className="text-xs opacity-90">Online e pronta para ajudar!</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Mensagens */}
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-purple-50/50 to-pink-50/50">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl break-words ${
                        message.type === 'user'
                          ? 'bg-purple-500 text-white rounded-br-sm'
                          : 'bg-white border border-purple-200 text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {message.type === 'sofia' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                            👩‍⚕️
                          </div>
                          <span className="text-xs font-medium text-purple-600">Sofia:</span>
                        </div>
                      )}
                      
                      {message.hasImage && message.imageUrl && (
                        <img 
                          src={message.imageUrl} 
                          alt="Imagem enviada" 
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      
                      <p className="whitespace-pre-line text-xs leading-relaxed">
                        {message.content}
                      </p>
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-purple-200 rounded-2xl rounded-bl-sm p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                        👩‍⚕️
                      </div>
                      <span className="text-xs font-medium text-purple-600">Sofia está digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input de Mensagem */}
            <div className="p-3 border-t border-border/50 bg-white">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="pr-20 h-9 text-xs border-purple-200 focus:border-purple-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-purple-100"
                      onClick={toggleRecording}
                      disabled={isLoading}
                    >
                      {isRecording ? (
                        <MicOff className="w-3 h-3 text-red-500" />
                      ) : (
                        <Mic className="w-3 h-3 text-gray-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-purple-100"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Camera className="w-3 h-3 text-gray-500" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  className="bg-purple-500 hover:bg-purple-600 text-white h-9 px-3"
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </>
        )}
      </Card>

      {/* Modal de confirmação obrigatório */}
      {showConfirmationModal && pendingAnalysis && (
        <SofiaConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setPendingAnalysis(null);
          }}
          analysisId={pendingAnalysis.analysisId}
          detectedFoods={pendingAnalysis.detectedFoods}
          userName={pendingAnalysis.userName}
          userId={currentUser?.id || 'guest'}
          onConfirmation={handleConfirmation}
        />
      )}
    </motion.div>
  );
};

export default HealthChatBot;