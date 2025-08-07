
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Trophy, 
  TrendingUp, 
  Users, 
  Target,
  Crown,
  Medal,
  Award,
  Star,
  Flame,
  ThumbsUp,
  Handshake
} from 'lucide-react';

interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: string;
  badge: string;
  position: number;
}

interface RankingSidebarProps {
  currentUserId?: string;
}

export function RankingSidebar({ currentUserId }: RankingSidebarProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedCategory, setSelectedCategory] = useState<'geral' | 'peso' | 'exercicio' | 'hidratacao' | 'metas' | 'social'>('geral');

  // Mock data - Em produção, virá do Supabase
  const mockRankings: RankingUser[] = [
    { id: '1', name: 'Maria Silva', avatar: '', points: 2450, level: 'Mestre', badge: '👑', position: 1 },
    { id: '2', name: 'João Santos', avatar: '', points: 2200, level: 'Expert', badge: '🏆', position: 2 },
    { id: '3', name: 'Ana Costa', avatar: '', points: 1980, level: 'Expert', badge: '⭐', position: 3 },
    { id: '4', name: 'Pedro Lima', avatar: '', points: 1750, level: 'Dedicado', badge: '🔥', position: 4 },
    { 
      id: '5', 
      name: 'Sofia Mendes', 
      avatar: 'https://imagensids.s3.us-east-1.amazonaws.com/Sofia%20sem%20fundo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZAQZCSRHU3YW55DQ%2F20250729%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250729T200136Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQChA3%2BbD1dZqLBDQqsI5BQFiUEGWdCUcevcJ9eXvyTkqAIgRI18C0sZ9AuXHxEfrihiBQnbyAcXCr9NQJ033v55sG0q3wIIrf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2MTk2MDE2MzAyODciDHNhM9pb2hgFxRbGmiqzAmX16D%2FTsmIZ44pytO6ppRtdkF2MNSclV%2B494zA1B%2FNYNYShq1yLQvYIE8mu%2Bw%2Fp623wtNUqHRK%2FVB55wp5C4S7VbqtWryvbWWgwqt78y32eIaXrv5AMKippOH9ueHFEAjsA%2FQbBN2mQZlD%2FiadabySlYFQSvWHJ6pKV077%2BwjTfedjHLgU0AusofsIolBqq%2FBoUHcMz2%2BRmhD3QIDshc7%2BBSOce76%2BuSEjWUql8fnYLrHn54Q%2BnQ5MIjGa8y1IZ7wBSXe4J0cZI%2FdgovKavwfAzfHm%2BmVcmS0mEIg0D1qK5UEOPcXwxfJU4a5f3nNXkRuoVlAfhVr0aDIeQ8oRjbJ923lFaz1m945SbBvcCeZnPFKODH6r9Xstrz5tp9fTj0FLZL7nRXb7KVq8fXGqLBQtD%2Bk8w%2FMykxAY6rQJsvxbhGbRYFYsd%2FgOTolaFps%2BmKV1R0j6pl0sTUgdJi94%2Fs6yv7igUxpCXKUdufJIk8NgOnIfkQYt88B0%2F0dYtStMeumcbgc%2Bpsi%2BlaUNd3I%2BBKgamg%2FY%2BnL4lo22YFVVJRgVEQ2ALLwQlqUW7wx%2BsATDs6LFkQ0zCZrjENrjvCcAGLdHw5R%2Fuo2nsg3yNuIHHMH%2BWz8ZBawseAP%2FwwgftK%2Bk%2BL5ira8wJtwX9FpgetHBlL2VXp3ZnamgV%2FuRJwHRXcVrqHr36zsizaedMk6KD6ITy%2BmPcx3Ai8vs37Ga24PnpfAbnGKqGLHOLhy8sAPjUQJX2jAOfGiYHHDRDaujJPQEshMpG0MZPXQur5oosX4M4qmQs8GSJvZAUcL7ZkahcF6ZHfltnM82YDtRx&X-Amz-Signature=898906fe6d7fd05f241153a3c5cbdb1980b83434d711179c47d010b057dc3eb4&X-Amz-SignedHeaders=host&response-content-disposition=inline', 
      points: 1620, 
      level: 'Dedicado', 
      badge: '💪', 
      position: 5 
    },
    { id: '6', name: 'Você', avatar: '', points: 1420, level: 'Dedicado', badge: '🎯', position: 8 },
  ];

  const currentUser = mockRankings.find(u => u.name === 'Você');

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Mestre': return 'text-purple-600 bg-purple-100';
      case 'Expert': return 'text-orange-600 bg-orange-100';
      case 'Dedicado': return 'text-blue-600 bg-blue-100';
      case 'Ativo': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />;
      case 2: return <Medal className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />;
      case 3: return <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />;
      default: return <span className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-xs md:text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'geral': return <Trophy className="w-3 h-3 md:w-4 md:h-4" />;
      case 'peso': return <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />;
      case 'exercicio': return <Flame className="w-3 h-3 md:w-4 md:h-4" />;
      case 'hidratacao': return <Star className="w-3 h-3 md:w-4 md:h-4" />;
      case 'metas': return <Target className="w-3 h-3 md:w-4 md:h-4" />;
      case 'social': return <Users className="w-3 h-3 md:w-4 md:h-4" />;
      default: return <Trophy className="w-3 h-3 md:w-4 md:h-4" />;
    }
  };

  return (
    <div className="w-full space-y-3 md:space-y-4">
      {/* Seu Ranking Atual */}
      {currentUser && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader className="pb-2 md:pb-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm md:text-base">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Seu Ranking
            </h3>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2">
                {getPositionIcon(currentUser.position)}
                <span className="text-lg md:text-xl">{currentUser.badge}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm md:text-base truncate">{currentUser.name}</p>
                <Badge className={`text-xs ${getLevelColor(currentUser.level)}`}>
                  {currentUser.level}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-lg md:text-xl font-bold text-primary">{currentUser.points}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
            
            <div className="space-y-1 md:space-y-2">
              <div className="flex justify-between text-xs">
                <span className="truncate">Próximo: Mestre</span>
                <span className="whitespace-nowrap">580 pts</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 md:h-2">
                <div 
                  className="bg-primary h-1.5 md:h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(currentUser.points % 1000) / 10}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-2 md:pb-3">
          <h3 className="font-semibold text-sm md:text-base">Rankings</h3>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-3">
          <Tabs value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <TabsList className="grid w-full grid-cols-3 h-8 md:h-10">
              <TabsTrigger value="week" className="text-xs md:text-sm">Semana</TabsTrigger>
              <TabsTrigger value="month" className="text-xs md:text-sm">Mês</TabsTrigger>
              <TabsTrigger value="year" className="text-xs md:text-sm">Ano</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-1 md:gap-2">
            {[
              { key: 'geral', label: 'Geral' },
              { key: 'peso', label: 'Peso' },
              { key: 'exercicio', label: 'Exercício' },
              { key: 'hidratacao', label: 'Hidratação' },
              { key: 'metas', label: 'Metas' },
              { key: 'social', label: 'Social' }
            ].map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.key as any)}
                className="flex items-center gap-1 h-7 md:h-8 text-xs px-2 md:px-3"
              >
                {getCategoryIcon(category.key)}
                <span className="truncate">{category.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Ranking */}
      <Card>
        <CardHeader className="pb-2 md:pb-3">
          <h3 className="font-semibold flex items-center gap-2 text-sm md:text-base">
            {getCategoryIcon(selectedCategory)}
            <span className="truncate">Top 10 - {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</span>
          </h3>
          <p className="text-xs text-muted-foreground capitalize">
            Ranking {selectedPeriod === 'week' ? 'semanal' : selectedPeriod === 'month' ? 'mensal' : 'anual'}
          </p>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-3">
          {mockRankings.slice(0, 10).map((user, index) => (
            <div key={user.id}>
              <div className="flex items-center gap-2 md:gap-3 py-1">
                <div className="flex items-center gap-1 md:gap-2 w-8 md:w-10">
                  {getPositionIcon(user.position)}
                  <span className="text-sm md:text-base">{user.badge}</span>
                </div>
                
                <Avatar className="w-6 h-6 md:w-8 md:h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs md:text-sm">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs md:text-sm truncate">
                    {user.name}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getLevelColor(user.level)} px-1 py-0`}
                  >
                    {user.level}
                  </Badge>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-xs md:text-sm">{user.points}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
              {index < mockRankings.length - 1 && <Separator className="mt-1 md:mt-2" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Conquistas */}
      <Card>
        <CardHeader className="pb-2 md:pb-3">
          <h3 className="font-semibold flex items-center gap-2 text-sm md:text-base">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            Conquistas
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {[
              { icon: '🔥', name: 'Sequência 7 dias', earned: true },
              { icon: '💪', name: 'Meta atingida', earned: true },
              { icon: '🏆', name: 'Top 3 semanal', earned: true },
              { icon: '⭐', name: 'Primeiro post', earned: true },
              { icon: '🤝', name: 'Apoio social', earned: false },
              { icon: '👑', name: 'Influenciador', earned: false },
            ].map((badge, index) => (
              <div 
                key={index}
                className={`p-2 md:p-3 rounded-lg text-center border transition-all ${
                  badge.earned ? 'bg-primary/10 border-primary/20' : 'bg-muted/50 border-muted opacity-50'
                }`}
              >
                <div className="text-lg md:text-xl mb-1">{badge.icon}</div>
                <p className="text-xs font-medium leading-tight">{badge.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
