import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Star } from 'lucide-react';
import FeatureLockGuard from '@/components/FeatureLockGuard';

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Funcionalidades essenciais para começar sua jornada',
    icon: Zap,
    features: [
      'Dashboard completo',
      'Missões diárias',
      'Teste de sabotadores',
      'Gráficos básicos',
      'Suporte por email'
    ],
    popular: false,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 49,90',
    period: '/mês',
    description: 'Tudo do básico + recursos avançados',
    icon: Crown,
    features: [
      'Todas as funcionalidades básicas',
      'Integração Google Fit',
      'Relatórios semanais personalizados',
      'Comunidade premium',
      'Suporte prioritário',
      'Sessões personalizadas'
    ],
    popular: true,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 'R$ 99,90',
    period: '/mês',
    description: 'Para profissionais da saúde e coaches',
    icon: Star,
    features: [
      'Todas as funcionalidades premium',
      'Dashboard administrativo completo',
      'Gestão de múltiplos clientes',
      'Relatórios avançados',
      'API para integrações',
      'Suporte 24/7',
      'Treinamentos exclusivos'
    ],
    popular: false,
    color: 'from-red-500 to-red-600'
  }
];

const benefits = [
  {
    title: 'Resultados Rápidos',
    description: 'Veja mudanças significativas em suas métricas de saúde em poucas semanas',
    icon: Zap
  },
  {
    title: 'Tecnologia Avançada',
    description: 'IA e análise de dados para insights personalizados sobre sua saúde',
    icon: Crown
  },
  {
    title: 'Suporte Especializado',
    description: 'Equipe de especialistas em saúde e bem-estar para te ajudar',
    icon: Star
  }
];

export default function SubscriptionPage() {
  const handleSubscribe = (planId: string) => {
    // Aqui seria implementada a integração com gateway de pagamento
    console.log('Assinando plano:', planId);
    
    // Simular redirecionamento para pagamento
    alert(`Redirecionando para pagamento do plano ${planId}`);
  };

  return (
    <FeatureLockGuard feature="assinatura">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
            <p className="text-xl text-muted-foreground">
              Transforme sua saúde com as ferramentas certas para você
            </p>
          </div>

          {/* Planos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{plan.price}</div>
                      <div className="text-muted-foreground">{plan.period}</div>
                    </div>
                    
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'bg-secondary hover:bg-secondary/90'
                      }`}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      Escolher {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Benefícios */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-8">Por que escolher nossa plataforma?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posso cancelar minha assinatura a qualquer momento?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sim! Você pode cancelar sua assinatura a qualquer momento através do seu painel de controle. 
                    O acesso será mantido até o final do período atual.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Existe um período de teste gratuito?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Oferecemos 7 dias de teste gratuito para todos os planos. 
                    Você pode experimentar todas as funcionalidades sem compromisso.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Como funciona o suporte?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    O suporte por email está disponível para todos os planos. 
                    Assinantes Premium e Professional têm acesso prioritário e suporte 24/7.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </FeatureLockGuard>
  );
} 