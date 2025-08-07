import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Target, 
  Flame, 
  TrendingUp, 
  BarChart3, 
  Send,
  Camera,
  Paperclip,
  Mic,
  MicOff,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  hasImage?: boolean;
}

const SofiaPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'sofia',
      content: '👋 Oi vv! Sou a Sofia, sua nutricionista virtual do Instituto dos Sonhos!\n\nEstou aqui para te ajudar com:\n📸 Análise de refeições (envie fotos!)\n📊 Dicas nutricionais personalizadas\n🍎 Orientações sobre alimentação saudável\n🎯 Apoio na sua jornada de transformação\n\nO que você gostaria de conversar hoje? Pode me enviar uma foto da sua refeição ou fazer qualquer pergunta sobre nutrição! ✨',
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');

    try {
      // Chamar edge function real
      const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/health-chat-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          userId: 'guest',
          userName: 'usuário'
        })
      });

      const data = await response.json();
      
      const sofiaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: data.response || 'Desculpe, tive um problema para processar sua mensagem.',
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
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: 'Enviou uma foto da refeição 📸',
      timestamp: new Date(),
      hasImage: true
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Converter para base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Chamar análise de imagem
      const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/sofia-image-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: base64,
          userId: 'guest',
          userContext: {
            currentMeal: 'refeicao',
            userName: 'usuário'
          }
        })
      });

      const data = await response.json();
      
      let sofiaContent = '';
      if (data.success && data.sofia_analysis) {
        sofiaContent = data.sofia_analysis.analysis || 'Analisei sua refeição!';
      } else {
        sofiaContent = data.message || 'Não consegui analisar a imagem. Pode me contar o que você está comendo?';
      }

      const sofiaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: sofiaContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, sofiaResponse]);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: 'Ops! Tive problemas para analisar sua foto. Pode tentar novamente ou me contar o que você está comendo?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implementar lógica de gravação de áudio
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                🏛️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">INSTITUTO DOS SONHOS</h1>
                <p className="text-sm text-muted-foreground">Sofia - Sua Nutricionista Virtual</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                🧬 SOF.I.A - Sua Nutricionista Virtual
              </Badge>
              <Badge variant="outline" className="border-success text-success">
                👤 vv
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="bg-muted/30 mb-6">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="metas" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Metas
            </TabsTrigger>
            <TabsTrigger 
              value="missao" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <Flame className="w-4 h-4 mr-2" />
              Missão do Dia
            </TabsTrigger>
            <TabsTrigger 
              value="desafios" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Desafios
            </TabsTrigger>
            <TabsTrigger 
              value="historico" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger 
              value="estatisticas" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 min-h-[calc(100vh-250px)] lg:h-[calc(100vh-200px)]">
              {/* Chat Principal */}
              <div className="lg:col-span-3">
                <Card className="h-full flex flex-col bg-gradient-card border border-border/50">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Sofia - Nutricionista Virtual</CardTitle>
                        <p className="text-sm opacity-90">16:36 - Online e pronta para ajudar!</p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Mensagens */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/50 to-pink-50/50">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[90%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl break-words overflow-wrap-anywhere ${
                              message.type === 'user'
                                ? 'bg-purple-500 text-white rounded-br-sm'
                                : 'bg-white border border-purple-200 text-gray-800 rounded-bl-sm shadow-sm'
                            }`}
                          >
                            {message.type === 'sofia' && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                                  👩‍⚕️
                                </div>
                                <span className="text-xs font-medium text-purple-600">Sofia:</span>
                              </div>
                            )}
                            <p className="whitespace-pre-line text-sm leading-relaxed">
                              {message.content}
                            </p>
                            <div className={`text-xs mt-2 ${
                              message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Input de Mensagem */}
                  <div className="p-4 border-t border-border/50 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Digite sua refeição, dúvida ou envie uma foto..."
                          className="pr-24 h-12 border-purple-200 focus:border-purple-400"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100"
                            onClick={toggleRecording}
                          >
                            {isRecording ? (
                              <MicOff className="w-4 h-4 text-red-500" />
                            ) : (
                              <Mic className="w-4 h-4 text-gray-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-100"
                          >
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                      <Button 
                        onClick={handleSendMessage}
                        className="bg-purple-500 hover:bg-purple-600 text-white h-12 px-6"
                        disabled={!inputMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
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
                </Card>
              </div>

              {/* Painel Lateral */}
              <div className="lg:col-span-1 space-y-4">
                {/* Sofia Info */}
                <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Sofia AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-purple-700">
                      <p className="font-medium mb-2">Suas especialidades:</p>
                      <ul className="space-y-1 text-xs">
                        <li>📸 Análise de refeições (envie fotos!)</li>
                        <li>📊 Dicas nutricionais personalizadas</li>
                        <li>🍎 Orientações sobre alimentação saudável</li>
                        <li>🎯 Apoio na sua jornada de transformação</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações Rápidas */}
                <Card className="bg-gradient-card border border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-foreground">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start text-xs h-8"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-3 h-3 mr-2" />
                      Câmera
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start text-xs h-8"
                    >
                      <ImageIcon className="w-3 h-3 mr-2" />
                      Galeria
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start text-xs h-8"
                      onClick={toggleRecording}
                    >
                      <Mic className="w-3 h-3 mr-2" />
                      Áudio
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metas">
            <Card className="bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Suas Metas Nutricionais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missao">
            <Card className="bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Missão do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="desafios">
            <Card className="bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Desafios Nutricionais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card className="bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Histórico de Conversas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estatisticas">
            <Card className="bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Estatísticas Nutricionais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SofiaPage;