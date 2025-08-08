import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  height_cm: number;
  birth_date: string;
  gender: 'M' | 'F';
  avatar_url?: string;
}

export interface ProfessionalEvaluation {
  id?: string;
  user_id: string;
  evaluation_date: string;
  weight_kg: number;
  abdominal_circumference_cm: number;
  waist_circumference_cm: number;
  hip_circumference_cm: number;
  
  // Dobras cutâneas
  skinfold_triceps_mm?: number;
  skinfold_suprailiac_mm?: number;
  skinfold_thigh_mm?: number;
  skinfold_chest_mm?: number;
  skinfold_abdomen_mm?: number;
  
  // Métricas calculadas
  body_fat_percentage?: number;
  fat_mass_kg?: number;
  lean_mass_kg?: number;
  muscle_mass_kg?: number;
  bmi?: number;
  bmr_kcal?: number;
  waist_to_height_ratio?: number;
  waist_to_hip_ratio?: number;
  muscle_to_fat_ratio?: number;
  risk_level?: 'low' | 'moderate' | 'high';
  
  notes?: string;
  created_at?: string;
}

export const useProfessionalEvaluation = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [evaluations, setEvaluations] = useState<ProfessionalEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega todos os usuários (para admin)
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Busca usuários da tabela profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        // Se a tabela não existir, cria usuários mock
        if (profilesError.code === 'PGRST116' || profilesError.code === '42P01') {
          const mockUsers = [
            {
              id: '1',
              name: 'Usuário Teste 1',
              email: 'teste1@email.com',
              height_cm: 175,
              birth_date: '1990-01-01',
              gender: 'M' as const,
              avatar_url: ''
            },
            {
              id: '2',
              name: 'Usuário Teste 2',
              email: 'teste2@email.com',
              height_cm: 165,
              birth_date: '1995-05-15',
              gender: 'F' as const,
              avatar_url: ''
            }
          ];
          setUsers(mockUsers);
          return;
        }
        throw profilesError;
      }

      // Mapeia os dados dos profiles
      const combinedUsers = profiles?.map(profile => {
        // Tenta extrair altura e outros dados do profile
        const height = profile.height_cm || 170;
        const birthDate = profile.birth_date || profile.date_of_birth || '1990-01-01';
        const gender = profile.gender || 'M';
        
        return {
          id: profile.id || profile.user_id,
          name: profile.full_name || 'Sem nome',
          email: profile.email || '',
          height_cm: typeof height === 'number' ? height : 170,
          birth_date: birthDate,
          gender: gender === 'F' || gender === 'feminino' ? 'F' : 'M',
          avatar_url: profile.avatar_url || ''
        } as UserProfile;
      }) || [];

      setUsers(combinedUsers);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
      
      // Se houver erro, usa dados mock
      const mockUsers = [
        {
          id: '1',
          name: 'Usuário Exemplo',
          email: 'exemplo@email.com',
          height_cm: 175,
          birth_date: '1990-01-01',
          gender: 'M' as const,
          avatar_url: ''
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // Carrega avaliações de um usuário
  const loadUserEvaluations = async (userId: string) => {
    try {
      setLoading(true);
      
      // Since professional_evaluations table doesn't exist, keep current local state
      console.log('Professional evaluations table not available, keeping local state');
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
      setError('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  // Salva nova avaliação
  const saveEvaluation = async (evaluation: Omit<ProfessionalEvaluation, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      // Since professional_evaluations table doesn't exist, just return a mock result
      console.log('Professional evaluations table not available, storing mock locally');
      const mockResult: ProfessionalEvaluation = { id: `mock-${Date.now()}`, ...evaluation } as any;
      setEvaluations(prev => [mockResult, ...prev]);
      return mockResult;
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err);
      setError('Erro ao salvar avaliação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deleta avaliação
  const deleteEvaluation = async (evaluationId: string) => {
    try {
      setLoading(true);
      
      // Since professional_evaluations table doesn't exist, just remove from local state
      console.log('Professional evaluations table not available, removing from local state only');
      setEvaluations(prev => prev.filter(e => e.id !== evaluationId));
    } catch (err) {
      console.error('Erro ao deletar avaliação:', err);
      setError('Erro ao deletar avaliação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Calcula % de gordura usando Jackson & Pollock 3 dobras
  const calculateBodyFatPercentage = (
    user: UserProfile,
    measurements: Partial<ProfessionalEvaluation>
  ): number => {
    const age = new Date().getFullYear() - new Date(user.birth_date).getFullYear();
    let bodyDensity = 0;
    
    if (user.gender === 'M') {
      // Homens: Peitoral, Abdômen, Coxa
      const sumSkinfolds = (measurements.skinfold_chest_mm || 0) + 
                          (measurements.skinfold_abdomen_mm || 0) + 
                          (measurements.skinfold_thigh_mm || 0);
      bodyDensity = 1.10938 - (0.0008267 * sumSkinfolds) + 
                   (0.0000016 * sumSkinfolds * sumSkinfolds) - 
                   (0.0002574 * age);
    } else {
      // Mulheres: Tríceps, Supra-ilíaca, Coxa
      const sumSkinfolds = (measurements.skinfold_triceps_mm || 0) + 
                          (measurements.skinfold_suprailiac_mm || 0) + 
                          (measurements.skinfold_thigh_mm || 0);
      bodyDensity = 1.0994921 - (0.0009929 * sumSkinfolds) + 
                   (0.0000023 * sumSkinfolds * sumSkinfolds) - 
                   (0.0001392 * age);
    }
    
    // Fórmula de Siri
    const bodyFatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
    return Math.max(0, Math.min(50, bodyFatPercentage));
  };

  // Calcula TMB usando Mifflin-St Jeor
  const calculateBMR = (user: UserProfile, weight: number): number => {
    const age = new Date().getFullYear() - new Date(user.birth_date).getFullYear();
    
    if (user.gender === 'M') {
      return (10 * weight) + (6.25 * user.height_cm) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * user.height_cm) - (5 * age) - 161;
    }
  };

  // Calcula todas as métricas
  const calculateMetricsFromHook = (
    user: UserProfile,
    measurements: Partial<ProfessionalEvaluation>
  ): Partial<ProfessionalEvaluation> => {
    if (!measurements.weight_kg) return measurements;

    const bodyFatPercentage = calculateBodyFatPercentage(user, measurements);
    const fatMass = measurements.weight_kg * (bodyFatPercentage / 100);
    const leanMass = measurements.weight_kg - fatMass;
    const muscleMass = leanMass * 0.45; // Estimativa
    const bmi = measurements.weight_kg / Math.pow(user.height_cm / 100, 2);
    const bmr = calculateBMR(user, measurements.weight_kg);
    
    let waistToHeightRatio = 0;
    let waistToHipRatio = 0;
    let muscleToFatRatio = 0;
    
    if (measurements.waist_circumference_cm) {
      waistToHeightRatio = measurements.waist_circumference_cm / user.height_cm;
    }
    
    if (measurements.hip_circumference_cm && measurements.hip_circumference_cm > 0) {
      waistToHipRatio = (measurements.waist_circumference_cm || 0) / measurements.hip_circumference_cm;
    }
    
    if (fatMass > 0) {
      muscleToFatRatio = muscleMass / fatMass;
    }

    // Determina nível de risco
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (waistToHeightRatio > 0.6 || bmi > 30) {
      riskLevel = 'high';
    } else if (waistToHeightRatio > 0.5 || bmi > 25) {
      riskLevel = 'moderate';
    }

    return {
      ...measurements,
      body_fat_percentage: bodyFatPercentage,
      fat_mass_kg: fatMass,
      lean_mass_kg: leanMass,
      muscle_mass_kg: muscleMass,
      bmi,
      bmr_kcal: Math.round(bmr),
      waist_to_height_ratio: waistToHeightRatio,
      waist_to_hip_ratio: waistToHipRatio,
      muscle_to_fat_ratio: muscleToFatRatio,
      risk_level: riskLevel
    };
  };

  // Carrega dados iniciais
  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    evaluations,
    loading,
    error,
    loadUsers,
    loadUserEvaluations,
    saveEvaluation,
    deleteEvaluation,
    calculateMetricsFromHook
  };
};