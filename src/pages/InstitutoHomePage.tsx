import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Star, 
  Target, 
  Award,
  Play,
  CheckCircle,
  TrendingUp,
  Calendar,
  Quote,
  BarChart3,
  Shield,
  Zap,
  Trophy,
  Clock,
  UserCheck,
  Dumbbell,
  Activity,
  MapPin,
  Phone,
  Mail,
  Clock3,
  PersonStanding,
  Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import das imagens da Academia sem Dor
import academiaSemDorInterior from '@/assets/academia-sem-dor-interior.jpg';
import pilatesFisioterapia from '@/assets/pilates-fisioterapia.jpg';
import musculacaoOrientada from '@/assets/musculacao-orientada.jpg';

const InstitutoHomePage = () => {
  const [animationLoaded, setAnimationLoaded] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setAnimationLoaded(true);
    const timer = setTimeout(() => setStatsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { value: "10,000+", label: "Vidas Transformadas", icon: Users },
    { value: "98%", label: "Taxa de Sucesso", icon: Trophy },
    { value: "15+", label: "Profissionais", icon: UserCheck },
    { value: "24/7", label: "Suporte", icon: Clock }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      result: "Perdi 25kg em 6 meses",
      text: "Nunca imaginei que seria possível. O Instituto dos Sonhos mudou minha vida completamente.",
      rating: 5
    },
    {
      name: "João Santos",
      result: "Recuperei minha autoestima",
      text: "Além de emagrecer, encontrei o equilíbrio emocional que procurava há anos.",
      rating: 5
    },
    {
      name: "Ana Costa",
      result: "30kg mais leve e feliz",
      text: "O método integral funcionou para mim. Corpo e mente transformados!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/5 bg-grid-16" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-accent/10" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <Badge 
            variant="secondary" 
            className={`mb-6 bg-primary/10 text-primary border-primary/20 transition-all duration-1000 ${
              animationLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            🌱 #1 Instituto de Transformação do Brasil
          </Badge>
          
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight transition-all duration-1000 delay-200 px-4 text-center ${
            animationLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Instituto dos{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sonhos
            </span>
          </h1>
          
          <p className={`text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-400 px-4 text-center ${
            animationLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Transforme seu corpo e sua vida com nosso método exclusivo de{' '}
            <span className="font-semibold text-primary">emagrecimento integral</span>.
            Mais de 10.000 vidas já foram transformadas.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-600 px-4 ${
            animationLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg">
              <Link to="/auth">
                <Play className="mr-2 h-5 w-5" />
                Comece sua Transformação
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-all duration-300">
              <Heart className="mr-2 h-5 w-5" />
              Conheça nossos Programas
            </Button>
          </div>

          {/* Trust Badges */}
          <div className={`flex flex-wrap justify-center gap-6 text-muted-foreground text-sm transition-all duration-1000 delay-800 ${
            animationLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Método Comprovado</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              <span>5 Estrelas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Health theme */}
      <section className="py-16 px-4 -mt-12 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className={`bg-card/95 backdrop-blur-sm border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-primary animate-fade-in ${
                    statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-3" />
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Missão Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              Nossa Essência
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-4 text-center">
              Nossa Missão
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto px-4 text-center">
              Guiar pessoas na transformação integral da saúde física e emocional, proporcionando 
              emagrecimento sustentável, autoestima elevada, bem-estar e qualidade de vida.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Transformação de Dentro para Fora</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Acreditamos que a verdadeira mudança acontece quando alinhamos corpo, mente e emoções.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Resultados Sustentáveis</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Focamos em mudanças duradouras que se mantêm ao longo da vida, não apenas temporárias.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Abordagem Integral</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Combinamos ciência, tecnologia e cuidado humano para resultados extraordinários.
                  </p>
                </div>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-card to-secondary p-8 border border-primary/10">
              <div className="text-center">
                <Quote className="h-12 w-12 text-primary mx-auto mb-4" />
                <blockquote className="text-lg italic mb-4 text-foreground">
                  "Rafael e Sirlene acreditam que cada pessoa carrega dentro de si o potencial para uma vida extraordinária. 
                  Nossa missão é despertar esse potencial."
                </blockquote>
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning fill-current" />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-secondary/10 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              Histórias Reais
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-4 text-center">
              Transformações que Inspiram
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 text-center">
              Conheça algumas das milhares de pessoas que já transformaram suas vidas conosco
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border border-primary/10 hover:border-primary/30 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-warning fill-current" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-primary mb-4 mx-auto" />
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
                      {testimonial.result}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sofia & Dr. Vital Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-accent/5 via-primary/5 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary text-white border-0">
              🤖 Inteligência Artificial + ❤️ Cuidado Humano
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent px-4 text-center">
              Conheça Sua Equipe de IA
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4 text-center">
              No Instituto dos Sonhos, você tem o apoio de assistentes de IA revolucionários que 
              acompanham sua jornada 24/7. <span className="font-semibold text-primary">Sofia e Dr. Vital</span> são 
              seus companheiros digitais na transformação completa da sua vida.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Sofia Card */}
            <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-500 border-2 border-primary/30 hover:border-primary shadow-2xl hover:shadow-primary/25 bg-card">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute top-4 right-4 animate-pulse">
                <div className="w-3 h-3 bg-success rounded-full"></div>
              </div>
              
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary rounded-full p-1 animate-pulse">
                      <div className="w-full h-full bg-white rounded-full overflow-hidden">
                        <img 
                          src="https://imagensids.s3.us-east-1.amazonaws.com/Sofia%20sem%20fundo.png"
                          alt="Sofia - Sua Nutricionista Virtual"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                      IA
                    </div>
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-center group-hover:text-primary transition-colors text-foreground">
                  🌟 SOF.IA
                </CardTitle>
                <p className="text-center text-primary font-semibold text-sm sm:text-base">Sua Nutricionista Virtual</p>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="bg-secondary rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground italic text-center">
                    "Olá! Sou a Sofia, sua companheira digital na jornada de transformação. 
                    Estou aqui 24/7 para te apoiar com análises nutricionais inteligentes, 
                    motivação personalizada e todo o carinho que você merece! 💜"
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Análise de fotos de comida com IA</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Suporte emocional personalizado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Metas e missões diárias</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Relatórios de progresso</span>
                  </div>
                </div>
                
                <Button 
                  asChild 
                  className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/sofia">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Conversar com Sofia
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Dr. Vital Card */}
            <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-500 border-2 border-accent/30 hover:border-accent shadow-2xl hover:shadow-accent/25 bg-card">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute top-4 right-4 animate-pulse">
                <div className="w-3 h-3 bg-success rounded-full"></div>
              </div>
              
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-accent rounded-full p-1 animate-pulse">
                      <div className="w-full h-full bg-white rounded-full overflow-hidden">
                        <img 
                          src="https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png"
                          alt="Dr. Vital - Seu Médico Virtual"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-bold">
                      MD
                    </div>
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-center group-hover:text-accent transition-colors text-foreground">
                  👨‍⚕️ Dr. Vital
                </CardTitle>
                <p className="text-center text-accent font-semibold text-sm sm:text-base">Seu Médico Virtual</p>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="bg-secondary rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground italic text-center">
                    "Olá! Sou o Dr. Vital, seu médico virtual especialista em saúde integral. 
                    Analiso seus exames, acompanho sua evolução e forneço orientações médicas 
                    baseadas em evidências científicas! 🩺"
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">Análise de exames médicos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">Orientações médicas precisas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">Acompanhamento de resultados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">Relatórios semanais detalhados</span>
                  </div>
                </div>
                
                <Button 
                  asChild 
                  className="w-full bg-accent text-white hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/dashboard">
                    <Shield className="mr-2 h-4 w-4" />
                    Consultar Dr. Vital
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-card rounded-2xl p-8 shadow-2xl border-2 border-primary/30">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-white px-4 text-center">
              Transformação Completa com IA + Humano
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-white/70 mb-6 max-w-3xl mx-auto px-4 text-center">
              No Instituto dos Sonhos, você não está sozinho. <span className="font-semibold text-primary">Sofia e Dr. Vital</span> trabalham 
              junto com nossa equipe humana para garantir que você alcance seus objetivos de forma segura, 
              eficaz e com todo o suporte que merece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <Link to="/auth">
                  <Zap className="mr-2 h-5 w-5" />
                  Começar com Sofia
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary hover:scale-105 transition-all duration-300">
                <Link to="/dashboard">
                  <Shield className="mr-2 h-5 w-5" />
                  Acessar Dr. Vital
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Programas Section */}
      <section className="py-20 px-4 bg-gradient-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Nossos Programas
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 px-4 text-center">
              Programas de Transformação
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 text-center">
              Escolha o programa ideal para sua jornada de transformação
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="health-card group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  Programa de Recomeço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Um programa para quem já tentou de tudo. Aqui, você encontra acolhimento, 
                  estratégia e motivação real. Entenda como desinflamar seu corpo e transforme 
                  sua rotina com o apoio de especialistas.
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Acompanhamento personalizado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Estratégias anti-inflamatórias</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Suporte emocional 24/7</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                  Saiba Mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="health-card group hover:scale-105 transition-all duration-300 relative overflow-hidden border-primary/50 shadow-lg">
              <Badge className="absolute top-4 right-4 bg-primary text-white">
                Mais Popular
              </Badge>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-secondary transition-colors">
                  Emagreça com Consciência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Você não precisa sofrer para emagrecer. Oferecemos uma abordagem integrativa 
                  com foco em bem-estar físico e emocional. Com hipnose, coaching e práticas 
                  saudáveis, o emagrecimento vira consequência.
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Hipnose terapêutica</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Coaching nutricional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Práticas de mindfulness</span>
                  </li>
                </ul>
                <Button className="w-full bg-secondary hover:bg-secondary/90">
                  Começar Agora
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="health-card group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">
                  Academia Sem Dor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Acesso a uma academia completa com musculação, pilates, fisioterapia e 
                  orientação profissional. Cuidar da saúde física faz parte da transformação 
                  que você merece viver.
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Academia completa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Fisioterapia especializada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Personal trainer</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-white transition-colors">
                  Saiba Mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Academia Sem Dor - Seção Detalhada */}
      <section className="py-20 px-4 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary text-white border-0">
              🏋️‍♀️ Exclusividade do Instituto dos Sonhos
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 text-white px-4 text-center">
              Academia Sem Dor
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed px-4 text-center">
              Revolucionamos o conceito de exercício físico. Nossa <span className="font-semibold text-primary">Academia Sem Dor</span> é 
              um espaço único onde você treina sem sofrer, com foco no seu bem-estar total e transformação sustentável.
            </p>
          </div>

          {/* Hero da Academia */}
          <div className="mb-16 relative">
            <Card className="overflow-hidden shadow-2xl border-0">
              <div className="relative">
                <img 
                  src={academiaSemDorInterior}
                  alt="Interior da Academia Sem Dor"
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-teal-600/80 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 px-4">
                      Ative Seu Corpo com Suporte Total
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl px-4">
                      Academia completa • Pilates • Fisioterapia • Orientação Profissional
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Principais Diferenciais */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-500 border-2 border-green-200 hover:border-green-400 shadow-xl hover:shadow-green-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
                  Musculação Inteligente
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <img 
                  src={musculacaoOrientada}
                  alt="Musculação orientada"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <p className="text-muted-foreground mb-4">
                  Equipamentos modernos com orientação profissional personalizada. 
                  Treinos adaptados para cada biotipo e limitação física.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Personal trainer especializado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Equipamentos de última geração</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Treinos sem sobrecarga articular</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-500 border-2 border-teal-200 hover:border-teal-400 shadow-xl hover:shadow-teal-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PersonStanding className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-teal-600 transition-colors">
                  Pilates Terapêutico
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <img 
                  src={pilatesFisioterapia}
                  alt="Pilates e fisioterapia"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <p className="text-muted-foreground mb-4">
                  Fortalecimento do core e correção postural com técnicas avançadas. 
                  Movimento consciente para alívio de dores e tensões.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Correção postural completa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Fortalecimento do core</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Alívio de dores crônicas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-500 border-2 border-blue-200 hover:border-blue-400 shadow-xl hover:shadow-blue-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  Fisioterapia Integrada
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg mb-4 flex items-center justify-center">
                  <Activity className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Reabilitação e prevenção de lesões com equipe especializada. 
                  Tratamento integrado para máximo bem-estar físico.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Fisioterapeutas especializados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Prevenção de lesões</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Reabilitação completa</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações da Academia */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <Card className="bg-white p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MapPin className="h-6 w-6 text-green-600" />
                Nossa Estrutura Completa
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Sala de Musculação</p>
                      <p className="text-sm text-muted-foreground">150m² equipados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <PersonStanding className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Studio de Pilates</p>
                      <p className="text-sm text-muted-foreground">80m² especializados</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Clínica de Fisioterapia</p>
                      <p className="text-sm text-muted-foreground">5 salas equipadas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Espaço Wellness</p>
                      <p className="text-sm text-muted-foreground">Relaxamento total</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-card p-8 shadow-xl border border-border/50">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Clock3 className="h-6 w-6 text-success" />
                Horários & Contato
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-semibold text-foreground">Segunda a Sexta</p>
                    <p className="text-sm text-muted-foreground">06:00 - 22:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-semibold text-foreground">Sábados</p>
                    <p className="text-sm text-muted-foreground">08:00 - 18:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">(11) 99999-9999</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">E-mail</p>
                    <p className="text-sm text-muted-foreground">academia@institutodossonhos.com</p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-success text-success-foreground hover:bg-success/90 shadow-lg hover:shadow-xl transition-all duration-300">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Visita Gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>

          {/* CTA Final Academia sem Dor */}
          <div className="text-center bg-white rounded-2xl p-8 shadow-2xl border-2 border-green-200">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Cuidar da Saúde Física é Transformação
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
              Na <span className="font-semibold text-green-600">Academia Sem Dor</span>, cada movimento é pensado para seu bem-estar. 
              Venha descobrir como o exercício pode ser prazeroso, eficaz e completamente livre de dor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <Link to="/auth">
                  <Dumbbell className="mr-2 h-5 w-5" />
                  Começar na Academia
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white hover:scale-105 transition-all duration-300">
                <MapPin className="mr-2 h-5 w-5" />
                Conhecer a Estrutura
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Nós Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Nossos Fundadores
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre Rafael e Sirlene
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Especialistas em transformação integral com mais de 10 anos de experiência
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                O Instituto dos Sonhos foi fundado por Rafael Ferreira e Sirlene Freitas, 
                especialistas em emagrecimento, saúde emocional e estética integrativa.
              </p>
              
              <div className="space-y-6">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Rafael Ferreira</h4>
                      <p className="text-muted-foreground mb-3">
                        Coach, hipnólogo, psicoterapeuta, master coach e estudante de Biomedicina
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Hipnose Clínica</Badge>
                        <Badge variant="outline">Master Coach</Badge>
                        <Badge variant="outline">Psicoterapia</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Sirlene Freitas</h4>
                      <p className="text-muted-foreground mb-3">
                        Coach, hipnose, psicoterapia, inteligência emocional e estudante de Nutrição
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Inteligência Emocional</Badge>
                        <Badge variant="outline">Coaching</Badge>
                        <Badge variant="outline">Nutrição</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            <Card className="bg-gradient-card p-8 text-center">
              <Trophy className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-6">Nossa Equipe Multidisciplinar</h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Nutricionistas especializados</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Biomédicos qualificados</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Fisioterapeutas experientes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Educadores físicos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Psicólogos clínicos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Academia Sem Dor</span>
                </div>
              </div>
              <Button className="w-full mt-6" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Conheça Nossa Equipe
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-20 px-4 bg-gradient-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Nossos Pilares
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nossos Valores
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Os princípios que guiam cada decisão e cada transformação no Instituto dos Sonhos
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="health-card text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                  Humanização e Empatia
                </h4>
                <p className="text-muted-foreground text-sm">
                  Tratamos cada cliente como parte da família Instituto dos Sonhos
                </p>
              </CardContent>
            </Card>
            
            <Card className="health-card text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-3 group-hover:text-secondary transition-colors">
                  Ética e Transparência
                </h4>
                <p className="text-muted-foreground text-sm">
                  Compromisso com métodos saudáveis e verdadeiros
                </p>
              </CardContent>
            </Card>
            
            <Card className="health-card text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-3 group-hover:text-accent transition-colors">
                  Inovação Constante
                </h4>
                <p className="text-muted-foreground text-sm">
                  Uso de tecnologia e ciência de ponta
                </p>
              </CardContent>
            </Card>
            
            <Card className="health-card text-center group hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                  Equilíbrio Corpo-Mente
                </h4>
                <p className="text-muted-foreground text-sm">
                  Acreditamos que saúde emocional e física andam juntas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/20 to-secondary/30" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            🚀 Sua Transformação Começa Agora
          </Badge>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight px-4 text-center">
            "Tudo Começa com Uma{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Escolha
            </span>"
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed px-4 text-center">
            Neste exato momento, milhares de pessoas enfrentam dores, inseguranças e o peso 
            de tantas tentativas frustradas. Mas também existem aquelas que decidiram mudar. 
            <span className="font-semibold text-yellow-300"> E você pode ser a próxima.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-2xl text-lg px-8 py-6">
              <Link to="/auth">
                <Zap className="mr-2 h-5 w-5" />
                Começar Minha Transformação
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 text-lg px-8 py-6">
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Consultoria Gratuita
            </Button>
          </div>

          {/* Urgência */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-yellow-300" />
              <span className="text-white font-semibold">Oferta Limitada</span>
            </div>
            <p className="text-white/90 text-sm">
              Primeiras 100 pessoas ganham 3 meses de acompanhamento GRATUITO
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur-sm py-12 px-4 border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Instituto dos Sonhos</h3>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Transformação integral da saúde física e emocional. 
                Mais de 10.000 vidas já transformadas com nosso método exclusivo.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" asChild size="sm">
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth">Cadastrar</Link>
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Programas</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Programa de Recomeço</li>
                <li>Emagreça com Consciência</li>
                <li>Academia Sem Dor</li>
                <li>Coaching Nutricional</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Suporte 24/7</li>
                <li>WhatsApp: (11) 99999-9999</li>
                <li>contato@institutodossonhos.com</li>
                <li>Agendar Consulta</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Instituto dos Sonhos. Transformando vidas através da tecnologia.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">Termos de Uso</span>
              <span>•</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Política de Privacidade</span>
              <span>•</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Suporte</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InstitutoHomePage;