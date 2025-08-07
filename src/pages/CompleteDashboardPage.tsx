import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Home, Activity, GraduationCap, FileText, Users, Target, 
  Award, Settings, TrendingUp, Stethoscope, CreditCard, 
  Menu, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Importações dos componentes
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { DailyMissionsFinal as DailyMissions } from '@/components/daily-missions/DailyMissionsFinal';
import CoursePlatformNetflix from '@/components/dashboard/CoursePlatformNetflix';
import SessionsPage from '@/components/SessionsPage';
import GoalsPage from '@/pages/GoalsPage';
import DesafiosSection from '@/components/dashboard/DesafiosSection';

import HealthFeedPage from '@/pages/HealthFeedPage';
import PaymentPlans from '@/components/PaymentPlans';
import UserDrVitalPage from '@/pages/UserDrVitalPage';
import { UserProfile } from '@/components/UserProfile';
import DebugDataVerification from '@/components/DebugDataVerification';
import MyProgress from '@/components/MyProgress';
import SaboteurTest from '@/components/SaboteurTest';
import { getUserAvatar } from "@/lib/avatar-utils";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { UserProfileSidebar } from "@/components/ui/user-profile-sidebar";
import LockedMenuItem from '@/components/LockedMenuItem';
import LockedSection from '@/components/LockedSection';

type DashboardSection = 
  | 'dashboard' 
  | 'missions' 
  | 'courses' 
  | 'sessions' 
  | 'comunidade' 
  | 'goals'
  | 'challenges'

  | 'saboteur-test'
  | 'progress'
  | 'subscriptions'
  | 'dr-vital'
  | 'apps'
  | 'help'
  | 'profile'
  | 'debug';

const CompleteDashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileData, loading: profileLoading, loadProfile } = useUserProfile(user);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'text-primary' },
    { id: 'missions', icon: Activity, label: 'Missão do Dia', color: 'text-secondary' },
    { id: 'progress', icon: TrendingUp, label: 'Meu Progresso', color: 'text-cyan-500' },
    { id: 'goals', icon: Target, label: 'Minhas Metas', color: 'text-green-500' },
    { id: 'courses', icon: GraduationCap, label: 'Plataforma dos Sonhos', color: 'text-accent' },
    { id: 'sessions', icon: FileText, label: 'Sessões', color: 'text-muted-foreground' },
    { id: 'comunidade', icon: Users, label: 'Comunidade', color: 'text-blue-500' },
    { id: 'challenges', icon: Award, label: 'Desafios Individuais', color: 'text-orange-500' },
    { id: 'saboteur-test', icon: Settings, label: 'Teste de Sabotadores', color: 'text-gray-500' },
    { id: 'dr-vital', icon: Stethoscope, label: 'Dr. Vital', color: 'text-blue-600' },
    { id: 'subscriptions', icon: CreditCard, label: 'Assinaturas', color: 'text-purple-600' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'missions':
        return <DailyMissions user={user} />;
      case 'courses':
        return (
          <LockedSection
            title="Plataforma dos Sonhos"
            description="Nossa plataforma de cursos exclusiva estará disponível em breve! Prepare-se para uma experiência de aprendizado única."
            showPreview={false}
          />
        );
      case 'progress':
        return <MyProgress />;
      case 'saboteur-test':
        return <SaboteurTest />;
      case 'sessions':
        return (
          <LockedSection
            title="Sessões Personalizadas"
            description="Sessões exclusivas com nossos especialistas estarão disponíveis em breve! Aguarde por uma experiência personalizada única."
            showPreview={false}
          />
        );
      case 'goals':
        return <GoalsPage />;
      case 'challenges':
        return (
          <LockedSection
            title="Desafios Individuais"
            description="Desafios personalizados e gamificação avançada estarão disponíveis em breve! Prepare-se para conquistar seus objetivos de forma divertida."
            showPreview={false}
          />
        );

      case 'comunidade':
        return (
          <LockedSection
            title="Comunidade dos Sonhos"
            description="Nossa comunidade exclusiva estará disponível em breve! Conecte-se com outros membros e compartilhe sua jornada de transformação."
            showPreview={false}
          />
        );
      case 'subscriptions':
        return (
          <LockedSection
            title="Gestão de Assinaturas"
            description="Sistema completo de assinaturas e planos premium estará disponível em breve! Acesso exclusivo a funcionalidades avançadas."
            showPreview={false}
          />
        );
      case 'dr-vital':
        return <UserDrVitalPage />;
      case 'profile':
        return (
          <div className="p-6">
            <UserProfile 
              user={user} 
              onUpdateProfile={(data) => {
                console.log('Perfil atualizado:', data);
                toast({
                  title: "Perfil atualizado!",
                  description: "Suas informações foram salvas com sucesso.",
                });
              }}
            />
          </div>
        );
      case 'debug':
        return (
          <div className="p-6">
            <DebugDataVerification />
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 capitalize">{activeSection.replace('-', ' ')}</h1>
            <p className="text-muted-foreground">Esta funcionalidade está em desenvolvimento...</p>
          </div>
        );
    }
  };

  const SidebarContent = ({ isMobile = false }) => {
    // No mobile, sempre expandido
    const isExpanded = isMobile ? true : sidebarExpanded;
    
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Header com Menu - só mostra botão de expansão no desktop */}
        {!isMobile && (
          <div className="p-4 border-b border-border/10">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="hover:bg-accent/50 transition-smooth"
              >
                <Menu className="h-5 w-5" />
              </Button>
              {sidebarExpanded && (
                <span className="text-sm font-medium text-foreground">Menu</span>
              )}
            </div>
          </div>
        )}

        {/* Mobile header simples */}
        {isMobile && (
          <div className="p-4 border-b border-border/10">
            <span className="text-lg font-semibold text-foreground">Menu</span>
          </div>
        )}

        {/* Perfil do Usuário */}
        {!profileLoading && (
          <div className="p-4 border-b border-border/10">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="w-full p-0 h-auto hover:bg-accent/30 transition-smooth">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      {(() => {
                        const avatarData = getUserAvatar(profileData.avatarUrl, profileData.fullName || user?.email || 'User');
                        return (
                          <AvatarUpload
                            currentAvatar={profileData.avatarUrl}
                            userName={profileData.fullName || user?.email || 'User'}
                            size={isExpanded ? 'xl' : 'lg'}
                            onAvatarUpdate={async (newAvatarUrl) => {
                              // Recarregar perfil após atualização do avatar
                              await loadProfile();
                            }}
                            className="transition-all duration-200"
                          />
                        );
                      })()}
                      <div className={`absolute ${isExpanded ? '-bottom-1 -right-1 w-5 h-5' : '-bottom-0.5 -right-0.5 w-4 h-4'} bg-green-500 rounded-full border-2 border-background`}>
                        {isExpanded && <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                          {profileData.fullName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
                          {profileData.email || user?.email}
                        </p>
                        <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                          Online
                        </Badge>
                      </div>
                    )}
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-96 p-0">
                <UserProfileSidebar 
                  user={user} 
                  onUpdateProfile={(data) => {
                    console.log('Perfil atualizado:', data);
                    toast({
                      title: "Perfil atualizado!",
                      description: "Suas informações foram salvas com sucesso.",
                    });
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              // Itens que devem ser bloqueados
              const lockedItems = ['challenges', 'comunidade', 'sessions', 'subscriptions', 'courses'];
              
              if (lockedItems.includes(item.id)) {
                // Mapear IDs do menu para features do LockedMenuItem
                const featureMap: Record<string, 'desafios' | 'comunidade' | 'sessoes' | 'assinatura' | 'courses'> = {
                  'challenges': 'desafios',
                  'comunidade': 'comunidade', 
                  'sessions': 'sessoes',
                  'subscriptions': 'assinatura',
                  'courses': 'courses'
                };
                
                return (
                  <LockedMenuItem
                    key={item.id}
                    feature={featureMap[item.id]}
                    onClick={() => {
                      setActiveSection(item.id as DashboardSection);
                      setSidebarOpen(false);
                    }}
                    className={`${isExpanded ? 'justify-start' : 'justify-center'} gap-3 h-12 ${
                      activeSection === item.id ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    <Icon className={`h-7 w-7 ${item.color}`} />
                    {isExpanded && <span className="text-left text-base">{item.label}</span>}
                  </LockedMenuItem>
                );
              }
              
              // Itens normais (não bloqueados)
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className={`w-full ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 h-12 ${
                    activeSection === item.id ? 'bg-muted font-medium' : ''
                  }`}
                  onClick={() => {
                    setActiveSection(item.id as DashboardSection);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className={`h-7 w-7 ${item.color}`} />
                  {isExpanded && <span className="text-left text-base">{item.label}</span>}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Botão Sair na parte inferior */}
        <div className="p-3 border-t border-border/20">
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            size="sm"
            className={`${isExpanded ? 'w-full' : 'w-10'} h-8 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-smooth text-xs`}
          >
            <LogOut className="h-3 w-3" />
            {isExpanded && <span className="ml-1">Sair</span>}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 capitalize">Carregando...</h1>
          <p className="text-muted-foreground">Aguarde enquanto carregamos suas informações.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const userName = (user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário").split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Mobile Menu Trigger - Fixed position */}
        <div className="lg:hidden fixed top-2 left-2 z-50">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-card/90 backdrop-blur-sm shadow-elegant border border-border/20 hover:bg-accent/30 transition-smooth p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className={`hidden lg:block ${sidebarExpanded ? 'w-80' : 'w-20'} border-r border-border/20 bg-card/30 transition-all duration-300`}>
          <SidebarContent isMobile={false} />
        </aside>

        {/* Main Content - Mobile optimized */}
        <main className="flex-1 overflow-y-auto lg:ml-0 ml-0">
          <div className="lg:p-0 p-2 sm:p-4 pt-12 sm:pt-16 lg:pt-0 w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompleteDashboardPage;
