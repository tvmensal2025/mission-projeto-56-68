import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  Target, 
  Brain, 
  DollarSign, 
  Star,
  Zap,
  Send,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  questions?: number;
  areas?: number;
}

const SessionTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates: Template[] = [
    {
      id: '12-areas',
      title: '12 Áreas',
      description: 'Avalie o equilíbrio das 12 áreas fundamentais da vida através de uma interface interativa com emojis. Receba análises personalizadas e um plano de ação para melhorar seu bem-estar geral.',
      duration: '10-15 minutos',
      category: 'Avaliação Geral',
      icon: <Target className="w-6 h-6" />,
      features: ['Seleção por Emojis', 'Roda Radar Visual', 'Plano de Ação'],
      color: 'bg-blue-500',
      areas: 12
    },
    {
      id: '147-perguntas',
      title: '147 Perguntas',
      description: 'Mapeamento completo de sintomas em 12 sistemas corporais com avaliação de frequência e intensidade. Sistema adaptativo que coleta dados para visualização em roda e evolução temporal.',
      duration: '12-15 minutos',
      category: 'Sintomas',
      icon: <Brain className="w-6 h-6" />,
      features: ['Frequência + Intensidade', 'Roda Visual de Resultados', 'Evolução Temporal'],
      color: 'bg-purple-500',
      questions: 147
    },
    {
      id: '8-pilares',
      title: '8 Pilares',
      description: 'Avaliação dos 8 pilares fundamentais da prosperidade financeira. Interface interativa com análise personalizada e plano de ação para impulsionar sua abundância.',
      duration: '10-15 minutos',
      category: 'Financeiro',
      icon: <DollarSign className="w-6 h-6" />,
      features: ['8 Pilares Financeiros', 'Roda Visual de Resultados', 'Plano de Ação Personalizado'],
      color: 'bg-yellow-500',
      areas: 8
    },
    {
      id: '8-competencias',
      title: '8 Competências',
      description: 'Avaliação das 8 competências profissionais fundamentais. Interface interativa com análise personalizada e plano de desenvolvimento para impulsionar sua carreira.',
      duration: '9-15 minutos',
      category: 'Profissional',
      icon: <Star className="w-6 h-6" />,
      features: ['8 Competências Profissionais', 'Roda Visual de Resultados', 'Plano de Desenvolvimento'],
      color: 'bg-red-500',
      areas: 8
    }
  ];

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Implementar lógica para usar o template
  };

  const handleSendToAll = (templateId: string) => {
    // Implementar lógica para enviar para todos os usuários
    console.log('Enviando template para todos os usuários:', templateId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Templates de Sessão Prontos</h2>
          <p className="text-muted-foreground mt-2">
            Modelos pré-configurados para diferentes tipos de avaliação
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-card border border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${template.color} text-white`}>
                      {template.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl text-foreground">
                          {template.title}
                        </CardTitle>
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/20 text-primary border-primary/30"
                        >
                          {template.questions && `${template.questions} Perguntas`}
                          {template.areas && `${template.areas} ${template.areas === 12 ? 'Áreas' : template.areas === 8 && template.category === 'Financeiro' ? 'Pilares' : 'Competências'}`}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm max-w-3xl">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleUseTemplate(template.id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Usar Template
                    </Button>
                    <Button 
                      onClick={() => handleSendToAll(template.id)}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar p/ Todos
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{template.duration}</span>
                    </div>
                    <div className="flex gap-2">
                      {template.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-success" />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>

                {/* Preview de tags/categorias */}
                <div className="flex gap-2 mt-4">
                  {template.id === '12-areas' && (
                    <div className="flex gap-1">
                      {['Saúde', 'Família', 'Carreira', 'Finanças', 'Relacionamentos', 'Diversão', 'Crescimento'].map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {template.id === '147-perguntas' && (
                    <div className="flex gap-1">
                      {['Digestivo', 'Respiratório', 'Cardiovascular', 'Neurológico', 'Musculoesquelético', 'Imunológico'].map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {template.id === '8-pilares' && (
                    <div className="flex gap-1">
                      {['Mindset', 'Planejamento', 'Investimentos', 'Renda', 'Gastos', 'Proteção', 'Impostos'].map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {template.id === '8-competencias' && (
                    <div className="flex gap-1">
                      {['Liderança', 'Comunicação', 'Inovação', 'Estratégia', 'Execução', 'Relacionamento', 'Adaptabilidade'].map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-red-100 text-red-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Ação de Atribuição em Massa */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary text-primary-foreground">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Atribuição em Massa</h3>
                <p className="text-muted-foreground text-sm">
                  Atribua todas as sessões disponíveis para todos os usuários de uma só vez
                </p>
              </div>
            </div>
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <Send className="w-5 h-5 mr-2" />
              Atribuir Todas as Sessões a Todos os Usuários
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
              <div className="text-sm">
                <p className="font-medium text-warning-foreground mb-1">O que esta ação faz:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Atribui TODAS as sessões disponíveis a TODOS os usuários</li>
                  <li>• Usuários poderão ver e completar todas as sessões</li>
                  <li>• Não duplica atribuições já existentes</li>
                  <li>• Status inicial: "pending" (pendente)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionTemplates;