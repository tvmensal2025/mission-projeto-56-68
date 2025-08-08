export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_categories: {
        Row: {
          avg_score: number | null
          category_name: string
          color_code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_activity_date: string | null
          total_points: number | null
          total_sessions: number | null
          user_id: string | null
        }
        Insert: {
          avg_score?: number | null
          category_name: string
          color_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          total_points?: number | null
          total_sessions?: number | null
          user_id?: string | null
        }
        Update: {
          avg_score?: number | null
          category_name?: string
          color_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_date?: string | null
          total_points?: number | null
          total_sessions?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      activity_sessions: {
        Row: {
          category_id: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          intensity_level: number | null
          notes: string | null
          satisfaction_score: number | null
          session_date: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intensity_level?: number | null
          notes?: string | null
          satisfaction_score?: number | null
          session_date?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intensity_level?: number | null
          notes?: string | null
          satisfaction_score?: number | null
          session_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_sessions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "activity_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_configurations: {
        Row: {
          cost_per_request: number | null
          created_at: string | null
          functionality: string
          id: string
          is_enabled: boolean
          level: string | null
          max_tokens: number
          model: string
          personality: string | null
          priority: number | null
          service: string
          system_prompt: string | null
          temperature: number
          updated_at: string | null
        }
        Insert: {
          cost_per_request?: number | null
          created_at?: string | null
          functionality: string
          id?: string
          is_enabled?: boolean
          level?: string | null
          max_tokens?: number
          model?: string
          personality?: string | null
          priority?: number | null
          service?: string
          system_prompt?: string | null
          temperature?: number
          updated_at?: string | null
        }
        Update: {
          cost_per_request?: number | null
          created_at?: string | null
          functionality?: string
          id?: string
          is_enabled?: boolean
          level?: string | null
          max_tokens?: number
          model?: string
          personality?: string | null
          priority?: number | null
          service?: string
          system_prompt?: string | null
          temperature?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_documents: {
        Row: {
          content: string
          created_at: string | null
          functionality: string
          id: string
          name: string
          type: string
          uploaded_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          functionality?: string
          id?: string
          name: string
          type?: string
          uploaded_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          functionality?: string
          id?: string
          name?: string
          type?: string
          uploaded_at?: string | null
        }
        Relationships: []
      }
      ai_fallback_configs: {
        Row: {
          created_at: string | null
          fallback_config: Json
          functionality: string
          id: string
          last_verified: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fallback_config: Json
          functionality: string
          id?: string
          last_verified?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fallback_config?: Json
          functionality?: string
          id?: string
          last_verified?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_system_logs: {
        Row: {
          config_snapshot: Json | null
          created_by: string | null
          description: string | null
          error_details: Json | null
          event_type: string
          functionality: string
          id: string
          level: string
          metadata: Json | null
          timestamp: string | null
        }
        Insert: {
          config_snapshot?: Json | null
          created_by?: string | null
          description?: string | null
          error_details?: Json | null
          event_type: string
          functionality: string
          id?: string
          level: string
          metadata?: Json | null
          timestamp?: string | null
        }
        Update: {
          config_snapshot?: Json | null
          created_by?: string | null
          description?: string | null
          error_details?: Json | null
          event_type?: string
          functionality?: string
          id?: string
          level?: string
          metadata?: Json | null
          timestamp?: string | null
        }
        Relationships: []
      }
      alimentos: {
        Row: {
          categoria: string
          created_at: string | null
          culinarias: string | null
          disponibilidade: string | null
          id: number
          nome: string
          nome_cientifico: string | null
          nome_ingles: string | null
          origem: string | null
          regiao_origem: string | null
          sazonalidade: string | null
          subcategoria: string | null
          updated_at: string | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          culinarias?: string | null
          disponibilidade?: string | null
          id?: number
          nome: string
          nome_cientifico?: string | null
          nome_ingles?: string | null
          origem?: string | null
          regiao_origem?: string | null
          sazonalidade?: string | null
          subcategoria?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          culinarias?: string | null
          disponibilidade?: string | null
          id?: number
          nome?: string
          nome_cientifico?: string | null
          nome_ingles?: string | null
          origem?: string | null
          regiao_origem?: string | null
          sazonalidade?: string | null
          subcategoria?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alimentos_alias: {
        Row: {
          alias_norm: string
          alimento_id: number
          created_at: string
          id: number
        }
        Insert: {
          alias_norm: string
          alimento_id: number
          created_at?: string
          id?: number
        }
        Update: {
          alias_norm?: string
          alimento_id?: number
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "alimentos_alias_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      alimentos_completos: {
        Row: {
          categoria: string
          contraindicacoes: string | null
          created_at: string | null
          culinarias: string | null
          disponibilidade: string | null
          dosagem_terapeutica: string | null
          forma_preparo_medicinal: string | null
          id: number
          indicacoes_terapeuticas: string[] | null
          interacoes_medicamentosas: string[] | null
          nome: string
          nome_cientifico: string | null
          nome_ingles: string | null
          origem: string | null
          principios_ativos: string[] | null
          propriedades_medicinais: string | null
          regiao_origem: string | null
          sazonalidade: string | null
          subcategoria: string | null
          updated_at: string | null
        }
        Insert: {
          categoria: string
          contraindicacoes?: string | null
          created_at?: string | null
          culinarias?: string | null
          disponibilidade?: string | null
          dosagem_terapeutica?: string | null
          forma_preparo_medicinal?: string | null
          id?: number
          indicacoes_terapeuticas?: string[] | null
          interacoes_medicamentosas?: string[] | null
          nome: string
          nome_cientifico?: string | null
          nome_ingles?: string | null
          origem?: string | null
          principios_ativos?: string[] | null
          propriedades_medicinais?: string | null
          regiao_origem?: string | null
          sazonalidade?: string | null
          subcategoria?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          contraindicacoes?: string | null
          created_at?: string | null
          culinarias?: string | null
          disponibilidade?: string | null
          dosagem_terapeutica?: string | null
          forma_preparo_medicinal?: string | null
          id?: number
          indicacoes_terapeuticas?: string[] | null
          interacoes_medicamentosas?: string[] | null
          nome?: string
          nome_cientifico?: string | null
          nome_ingles?: string | null
          origem?: string | null
          principios_ativos?: string[] | null
          propriedades_medicinais?: string | null
          regiao_origem?: string | null
          sazonalidade?: string | null
          subcategoria?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alimentos_densidades: {
        Row: {
          alimento_id: number
          densidade_g_ml: number
        }
        Insert: {
          alimento_id: number
          densidade_g_ml: number
        }
        Update: {
          alimento_id?: number
          densidade_g_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "alimentos_densidades_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: true
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      alimentos_doencas: {
        Row: {
          alimento_id: number | null
          contraindicacoes: string | null
          created_at: string | null
          doenca_id: number | null
          dosagem_recomendada: string | null
          evidencia_cientifica: string | null
          forma_preparo_otima: string | null
          frequencia_consumo: string | null
          id: number
          interacoes: string | null
          mecanismo_acao: string | null
          nivel_evidencia: number | null
          tipo_relacao: string | null
        }
        Insert: {
          alimento_id?: number | null
          contraindicacoes?: string | null
          created_at?: string | null
          doenca_id?: number | null
          dosagem_recomendada?: string | null
          evidencia_cientifica?: string | null
          forma_preparo_otima?: string | null
          frequencia_consumo?: string | null
          id?: number
          interacoes?: string | null
          mecanismo_acao?: string | null
          nivel_evidencia?: number | null
          tipo_relacao?: string | null
        }
        Update: {
          alimento_id?: number | null
          contraindicacoes?: string | null
          created_at?: string | null
          doenca_id?: number | null
          dosagem_recomendada?: string | null
          evidencia_cientifica?: string | null
          forma_preparo_otima?: string | null
          frequencia_consumo?: string | null
          id?: number
          interacoes?: string | null
          mecanismo_acao?: string | null
          nivel_evidencia?: number | null
          tipo_relacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alimentos_doencas_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alimentos_doencas_doenca_id_fkey"
            columns: ["doenca_id"]
            isOneToOne: false
            referencedRelation: "doencas_condicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      alimentos_epf: {
        Row: {
          alimento_id: number
          epf: number
        }
        Insert: {
          alimento_id: number
          epf: number
        }
        Update: {
          alimento_id?: number
          epf?: number
        }
        Relationships: [
          {
            foreignKeyName: "alimentos_epf_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: true
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      alimentos_principios_ativos: {
        Row: {
          alimento_id: number | null
          biodisponibilidade: string | null
          concentracao: number | null
          created_at: string | null
          estabilidade: string | null
          forma_quimica: string | null
          id: number
          principio_ativo_id: number | null
        }
        Insert: {
          alimento_id?: number | null
          biodisponibilidade?: string | null
          concentracao?: number | null
          created_at?: string | null
          estabilidade?: string | null
          forma_quimica?: string | null
          id?: number
          principio_ativo_id?: number | null
        }
        Update: {
          alimento_id?: number | null
          biodisponibilidade?: string | null
          concentracao?: number | null
          created_at?: string | null
          estabilidade?: string | null
          forma_quimica?: string | null
          id?: number
          principio_ativo_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alimentos_principios_ativos_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alimentos_principios_ativos_principio_ativo_id_fkey"
            columns: ["principio_ativo_id"]
            isOneToOne: false
            referencedRelation: "principios_ativos"
            referencedColumns: ["id"]
          },
        ]
      }
      alimentos_yield: {
        Row: {
          alimento_id: number
          factor: number
          from_state: string
          id: number
          to_state: string
        }
        Insert: {
          alimento_id: number
          factor: number
          from_state: string
          id?: number
          to_state: string
        }
        Update: {
          alimento_id?: number
          factor?: number
          from_state?: string
          id?: number
          to_state?: string
        }
        Relationships: [
          {
            foreignKeyName: "alimentos_yield_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          challenges_faced: string | null
          created_at: string
          goal_achievement_rating: number | null
          id: string
          improvements_noted: string | null
          next_week_goals: string | null
          satisfaction_rating: number | null
          user_id: string
          week_start_date: string
          weight_change: number | null
        }
        Insert: {
          challenges_faced?: string | null
          created_at?: string
          goal_achievement_rating?: number | null
          id?: string
          improvements_noted?: string | null
          next_week_goals?: string | null
          satisfaction_rating?: number | null
          user_id: string
          week_start_date: string
          weight_change?: number | null
        }
        Update: {
          challenges_faced?: string | null
          created_at?: string
          goal_achievement_rating?: number | null
          id?: string
          improvements_noted?: string | null
          next_week_goals?: string | null
          satisfaction_rating?: number | null
          user_id?: string
          week_start_date?: string
          weight_change?: number | null
        }
        Relationships: []
      }
      backup_rls_policies: {
        Row: {
          created_at: string | null
          id: number
          policy_definition: string | null
          policy_name: string | null
          table_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          policy_definition?: string | null
          policy_name?: string | null
          table_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          policy_definition?: string | null
          policy_name?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      beneficios_objetivo: {
        Row: {
          alimento_id: number | null
          beneficio: string
          created_at: string | null
          descricao: string | null
          estudos_referencia: string | null
          evidencia_cientifica: string | null
          id: number
          intensidade: number | null
          mecanismo_acao: string | null
          objetivo: string
        }
        Insert: {
          alimento_id?: number | null
          beneficio: string
          created_at?: string | null
          descricao?: string | null
          estudos_referencia?: string | null
          evidencia_cientifica?: string | null
          id?: number
          intensidade?: number | null
          mecanismo_acao?: string | null
          objetivo: string
        }
        Update: {
          alimento_id?: number | null
          beneficio?: string
          created_at?: string | null
          descricao?: string | null
          estudos_referencia?: string | null
          evidencia_cientifica?: string | null
          id?: number
          intensidade?: number | null
          mecanismo_acao?: string | null
          objetivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficios_objetivo_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_daily_logs: {
        Row: {
          created_at: string | null
          id: string
          log_date: string
          notes: string | null
          numeric_value: number | null
          participation_id: string | null
          value_logged: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_date: string
          notes?: string | null
          numeric_value?: number | null
          participation_id?: string | null
          value_logged?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          numeric_value?: number | null
          participation_id?: string | null
          value_logged?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_daily_logs_participation_id_fkey"
            columns: ["participation_id"]
            isOneToOne: false
            referencedRelation: "challenge_participations"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participations: {
        Row: {
          best_streak: number | null
          challenge_id: string | null
          current_streak: number | null
          daily_logs: Json | null
          id: string
          is_completed: boolean | null
          last_updated: string | null
          notes: string | null
          points_earned: number | null
          progress: number | null
          ranking_position: number | null
          started_at: string | null
          status: string | null
          target_value: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          best_streak?: number | null
          challenge_id?: string | null
          current_streak?: number | null
          daily_logs?: Json | null
          id?: string
          is_completed?: boolean | null
          last_updated?: string | null
          notes?: string | null
          points_earned?: number | null
          progress?: number | null
          ranking_position?: number | null
          started_at?: string | null
          status?: string | null
          target_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          best_streak?: number | null
          challenge_id?: string | null
          current_streak?: number | null
          daily_logs?: Json | null
          id?: string
          is_completed?: boolean | null
          last_updated?: string | null
          notes?: string | null
          points_earned?: number | null
          progress?: number | null
          ranking_position?: number | null
          started_at?: string | null
          status?: string | null
          target_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          badge_icon: string | null
          badge_name: string | null
          category: string | null
          challenge_type: string | null
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          daily_log_target: number | null
          daily_log_unit: string | null
          description: string | null
          difficulty: string | null
          duration_days: number | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_group_challenge: boolean | null
          is_public: boolean | null
          max_participants: number | null
          points_reward: number | null
          target_value: number | null
          tips: string[] | null
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          badge_icon?: string | null
          badge_name?: string | null
          category?: string | null
          challenge_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          daily_log_target?: number | null
          daily_log_unit?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_group_challenge?: boolean | null
          is_public?: boolean | null
          max_participants?: number | null
          points_reward?: number | null
          target_value?: number | null
          tips?: string[] | null
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          badge_icon?: string | null
          badge_name?: string | null
          category?: string | null
          challenge_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          daily_log_target?: number | null
          daily_log_unit?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_group_challenge?: boolean | null
          is_public?: boolean | null
          max_participants?: number | null
          points_reward?: number | null
          target_value?: number | null
          tips?: string[] | null
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      combinacoes_ideais: {
        Row: {
          alimento1_id: number | null
          alimento2_id: number | null
          beneficio: string
          created_at: string | null
          exemplo_pratico: string | null
          explicacao: string | null
          id: number
          intensidade: number | null
          nome_combinacao: string | null
        }
        Insert: {
          alimento1_id?: number | null
          alimento2_id?: number | null
          beneficio: string
          created_at?: string | null
          exemplo_pratico?: string | null
          explicacao?: string | null
          id?: number
          intensidade?: number | null
          nome_combinacao?: string | null
        }
        Update: {
          alimento1_id?: number | null
          alimento2_id?: number | null
          beneficio?: string
          created_at?: string | null
          exemplo_pratico?: string | null
          explicacao?: string | null
          id?: number
          intensidade?: number | null
          nome_combinacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combinacoes_ideais_alimento1_id_fkey"
            columns: ["alimento1_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combinacoes_ideais_alimento2_id_fkey"
            columns: ["alimento2_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      combinacoes_terapeuticas: {
        Row: {
          alimento1_id: number | null
          alimento2_id: number | null
          beneficio_sinergia: string | null
          contraindicacoes: string | null
          created_at: string | null
          dosagem_recomendada: string | null
          evidencia_cientifica: string | null
          forma_preparo: string | null
          id: number
          mecanismo_sinergia: string | null
          nivel_evidencia: number | null
          nome_combinacao: string | null
        }
        Insert: {
          alimento1_id?: number | null
          alimento2_id?: number | null
          beneficio_sinergia?: string | null
          contraindicacoes?: string | null
          created_at?: string | null
          dosagem_recomendada?: string | null
          evidencia_cientifica?: string | null
          forma_preparo?: string | null
          id?: number
          mecanismo_sinergia?: string | null
          nivel_evidencia?: number | null
          nome_combinacao?: string | null
        }
        Update: {
          alimento1_id?: number | null
          alimento2_id?: number | null
          beneficio_sinergia?: string | null
          contraindicacoes?: string | null
          created_at?: string | null
          dosagem_recomendada?: string | null
          evidencia_cientifica?: string | null
          forma_preparo?: string | null
          id?: number
          mecanismo_sinergia?: string | null
          nivel_evidencia?: number | null
          nome_combinacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combinacoes_terapeuticas_alimento1_id_fkey"
            columns: ["alimento1_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combinacoes_terapeuticas_alimento2_id_fkey"
            columns: ["alimento2_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      company_data: {
        Row: {
          admin_email: string | null
          company_description: string | null
          company_name: string | null
          created_at: string | null
          id: string
          max_users: number | null
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          admin_email?: string | null
          company_description?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          max_users?: number | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_email?: string | null
          company_description?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          max_users?: number | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_access: {
        Row: {
          access_granted: boolean | null
          content_id: string
          content_type: string
          created_at: string
          expires_at: string | null
          granted_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          access_granted?: boolean | null
          content_id: string
          content_type: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          access_granted?: boolean | null
          content_id?: string
          content_type?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contexto_cultural: {
        Row: {
          alimento_id: number | null
          created_at: string | null
          culinaria: string | null
          festividade: string | null
          id: number
          preferencia_dieta: string | null
          receita_tradicional: string | null
          regiao: string | null
          religiao: string | null
          significado_cultural: string | null
        }
        Insert: {
          alimento_id?: number | null
          created_at?: string | null
          culinaria?: string | null
          festividade?: string | null
          id?: number
          preferencia_dieta?: string | null
          receita_tradicional?: string | null
          regiao?: string | null
          religiao?: string | null
          significado_cultural?: string | null
        }
        Update: {
          alimento_id?: number | null
          created_at?: string | null
          culinaria?: string | null
          festividade?: string | null
          id?: number
          preferencia_dieta?: string | null
          receita_tradicional?: string | null
          regiao?: string | null
          religiao?: string | null
          significado_cultural?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contexto_cultural_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      contraindicacoes: {
        Row: {
          alimento_id: number | null
          alternativa: string | null
          categoria: string | null
          created_at: string | null
          descricao: string
          id: number
          recomendacao: string | null
          severidade: string | null
          sintomas: string | null
          tipo: string
        }
        Insert: {
          alimento_id?: number | null
          alternativa?: string | null
          categoria?: string | null
          created_at?: string | null
          descricao: string
          id?: number
          recomendacao?: string | null
          severidade?: string | null
          sintomas?: string | null
          tipo: string
        }
        Update: {
          alimento_id?: number | null
          alternativa?: string | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string
          id?: number
          recomendacao?: string | null
          severidade?: string | null
          sintomas?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "contraindicacoes_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          order_index: number
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          instructor_name: string | null
          is_premium: boolean | null
          is_published: boolean | null
          price: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_premium?: boolean | null
          is_published?: boolean | null
          price?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_premium?: boolean | null
          is_published?: boolean | null
          price?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_saboteurs: {
        Row: {
          characteristics: string[] | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          impact: string | null
          is_active: boolean | null
          name: string
          questions: string[] | null
          strategies: string[] | null
          updated_at: string | null
        }
        Insert: {
          characteristics?: string[] | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          impact?: string | null
          is_active?: boolean | null
          name: string
          questions?: string[] | null
          strategies?: string[] | null
          updated_at?: string | null
        }
        Update: {
          characteristics?: string[] | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          impact?: string | null
          is_active?: boolean | null
          name?: string
          questions?: string[] | null
          strategies?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_advanced_tracking: {
        Row: {
          bedtime: string | null
          comfort_eating: boolean | null
          created_at: string | null
          daily_score: number | null
          date: string
          day_highlight: string | null
          dreams_remembered: boolean | null
          eating_mindfully: boolean | null
          energy_afternoon: number | null
          energy_evening: number | null
          energy_morning: number | null
          first_drink: string | null
          focus_level: number | null
          goals_achieved: number | null
          gratitude_notes: string | null
          id: string
          improvement_area: string | null
          meals_planned: boolean | null
          meditation_minutes: number | null
          mood_general: number | null
          morning_routine_completed: boolean | null
          personal_growth_moment: string | null
          priorities_set: boolean | null
          reminded_to_drink: number | null
          satisfied_with_food: boolean | null
          sleep_quality_notes: string | null
          steps_current: number | null
          steps_goal: number | null
          stress_triggers: string | null
          tomorrow_intention: string | null
          tracking_completion_percent: number | null
          updated_at: string | null
          user_id: string | null
          wake_up_naturally: boolean | null
          wake_up_time: string | null
          water_current_ml: number | null
          water_goal_ml: number | null
          workout_completed: boolean | null
          workout_enjoyment: number | null
          workout_planned: boolean | null
        }
        Insert: {
          bedtime?: string | null
          comfort_eating?: boolean | null
          created_at?: string | null
          daily_score?: number | null
          date?: string
          day_highlight?: string | null
          dreams_remembered?: boolean | null
          eating_mindfully?: boolean | null
          energy_afternoon?: number | null
          energy_evening?: number | null
          energy_morning?: number | null
          first_drink?: string | null
          focus_level?: number | null
          goals_achieved?: number | null
          gratitude_notes?: string | null
          id?: string
          improvement_area?: string | null
          meals_planned?: boolean | null
          meditation_minutes?: number | null
          mood_general?: number | null
          morning_routine_completed?: boolean | null
          personal_growth_moment?: string | null
          priorities_set?: boolean | null
          reminded_to_drink?: number | null
          satisfied_with_food?: boolean | null
          sleep_quality_notes?: string | null
          steps_current?: number | null
          steps_goal?: number | null
          stress_triggers?: string | null
          tomorrow_intention?: string | null
          tracking_completion_percent?: number | null
          updated_at?: string | null
          user_id?: string | null
          wake_up_naturally?: boolean | null
          wake_up_time?: string | null
          water_current_ml?: number | null
          water_goal_ml?: number | null
          workout_completed?: boolean | null
          workout_enjoyment?: number | null
          workout_planned?: boolean | null
        }
        Update: {
          bedtime?: string | null
          comfort_eating?: boolean | null
          created_at?: string | null
          daily_score?: number | null
          date?: string
          day_highlight?: string | null
          dreams_remembered?: boolean | null
          eating_mindfully?: boolean | null
          energy_afternoon?: number | null
          energy_evening?: number | null
          energy_morning?: number | null
          first_drink?: string | null
          focus_level?: number | null
          goals_achieved?: number | null
          gratitude_notes?: string | null
          id?: string
          improvement_area?: string | null
          meals_planned?: boolean | null
          meditation_minutes?: number | null
          mood_general?: number | null
          morning_routine_completed?: boolean | null
          personal_growth_moment?: string | null
          priorities_set?: boolean | null
          reminded_to_drink?: number | null
          satisfied_with_food?: boolean | null
          sleep_quality_notes?: string | null
          steps_current?: number | null
          steps_goal?: number | null
          stress_triggers?: string | null
          tomorrow_intention?: string | null
          tracking_completion_percent?: number | null
          updated_at?: string | null
          user_id?: string | null
          wake_up_naturally?: boolean | null
          wake_up_time?: string | null
          water_current_ml?: number | null
          water_goal_ml?: number | null
          workout_completed?: boolean | null
          workout_enjoyment?: number | null
          workout_planned?: boolean | null
        }
        Relationships: []
      }
      daily_mission_sessions: {
        Row: {
          completed_sections: string[] | null
          created_at: string | null
          date: string
          id: string
          is_completed: boolean | null
          streak_days: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_sections?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          is_completed?: boolean | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_sections?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          is_completed?: boolean | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          category: string | null
          created_at: string | null
          current_value: number | null
          date_assigned: string | null
          date_completed: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_completed: boolean | null
          mission_type: string
          points: number | null
          target_value: number | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          date_assigned?: string | null
          date_completed?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_completed?: boolean | null
          mission_type: string
          points?: number | null
          target_value?: number | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          date_assigned?: string | null
          date_completed?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_completed?: boolean | null
          mission_type?: string
          points?: number | null
          target_value?: number | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_responses: {
        Row: {
          answer: string
          created_at: string | null
          date: string
          id: string
          points_earned: number | null
          question_id: string
          section: string
          text_response: string | null
          user_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          date?: string
          id?: string
          points_earned?: number | null
          question_id: string
          section: string
          text_response?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          date?: string
          id?: string
          points_earned?: number | null
          question_id?: string
          section?: string
          text_response?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      device_sync_log: {
        Row: {
          device_type: string
          error_message: string | null
          id: string
          integration_name: string
          last_sync_date: string | null
          records_synced: number | null
          sync_status: string | null
          sync_type: string
          synced_at: string | null
          user_id: string | null
        }
        Insert: {
          device_type: string
          error_message?: string | null
          id?: string
          integration_name: string
          last_sync_date?: string | null
          records_synced?: number | null
          sync_status?: string | null
          sync_type: string
          synced_at?: string | null
          user_id?: string | null
        }
        Update: {
          device_type?: string
          error_message?: string | null
          id?: string
          integration_name?: string
          last_sync_date?: string | null
          records_synced?: number | null
          sync_status?: string | null
          sync_type?: string
          synced_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      doencas_condicoes: {
        Row: {
          abordagem_nutricional: string | null
          alimentos_beneficos: string[] | null
          alimentos_evitar: string[] | null
          categoria: string | null
          causas: string[] | null
          complicacoes: string[] | null
          created_at: string | null
          descricao: string | null
          estilo_vida: string[] | null
          exames_diagnostico: string[] | null
          fatores_risco: string[] | null
          id: number
          nome: string
          sintomas: string[] | null
          suplementos_recomendados: string[] | null
          tratamentos_convencionais: string[] | null
        }
        Insert: {
          abordagem_nutricional?: string | null
          alimentos_beneficos?: string[] | null
          alimentos_evitar?: string[] | null
          categoria?: string | null
          causas?: string[] | null
          complicacoes?: string[] | null
          created_at?: string | null
          descricao?: string | null
          estilo_vida?: string[] | null
          exames_diagnostico?: string[] | null
          fatores_risco?: string[] | null
          id?: number
          nome: string
          sintomas?: string[] | null
          suplementos_recomendados?: string[] | null
          tratamentos_convencionais?: string[] | null
        }
        Update: {
          abordagem_nutricional?: string | null
          alimentos_beneficos?: string[] | null
          alimentos_evitar?: string[] | null
          categoria?: string | null
          causas?: string[] | null
          complicacoes?: string[] | null
          created_at?: string | null
          descricao?: string | null
          estilo_vida?: string[] | null
          exames_diagnostico?: string[] | null
          fatores_risco?: string[] | null
          id?: number
          nome?: string
          sintomas?: string[] | null
          suplementos_recomendados?: string[] | null
          tratamentos_convencionais?: string[] | null
        }
        Relationships: []
      }
      exercicio_nutricao: {
        Row: {
          alimento_id: number | null
          beneficio_exercicio: string | null
          combinacao_exercicio: string | null
          created_at: string | null
          dosagem_exercicio: string | null
          hidratacao_relacionada: string | null
          id: number
          timing: string | null
          tipo_exercicio: string | null
        }
        Insert: {
          alimento_id?: number | null
          beneficio_exercicio?: string | null
          combinacao_exercicio?: string | null
          created_at?: string | null
          dosagem_exercicio?: string | null
          hidratacao_relacionada?: string | null
          id?: number
          timing?: string | null
          tipo_exercicio?: string | null
        }
        Update: {
          alimento_id?: number | null
          beneficio_exercicio?: string | null
          combinacao_exercicio?: string | null
          created_at?: string | null
          dosagem_exercicio?: string | null
          hidratacao_relacionada?: string | null
          id?: number
          timing?: string | null
          tipo_exercicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercicio_nutricao_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sessions: {
        Row: {
          avg_heart_rate: number | null
          calories_burned: number | null
          created_at: string | null
          device_type: string | null
          distance_km: number | null
          duration_minutes: number
          ended_at: string | null
          exercise_type: string
          id: string
          max_heart_rate: number | null
          min_heart_rate: number | null
          notes: string | null
          started_at: string | null
          steps: number | null
          user_id: string | null
          zones: Json | null
        }
        Insert: {
          avg_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string | null
          device_type?: string | null
          distance_km?: number | null
          duration_minutes: number
          ended_at?: string | null
          exercise_type: string
          id?: string
          max_heart_rate?: number | null
          min_heart_rate?: number | null
          notes?: string | null
          started_at?: string | null
          steps?: number | null
          user_id?: string | null
          zones?: Json | null
        }
        Update: {
          avg_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string | null
          device_type?: string | null
          distance_km?: number | null
          duration_minutes?: number
          ended_at?: string | null
          exercise_type?: string
          id?: string
          max_heart_rate?: number | null
          min_heart_rate?: number | null
          notes?: string | null
          started_at?: string | null
          steps?: number | null
          user_id?: string | null
          zones?: Json | null
        }
        Relationships: []
      }
      exercise_tracking: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          date: string
          duration_minutes: number | null
          energy_after: number | null
          exercise_type: string | null
          id: string
          motivation_level: number | null
          source: string | null
          target_achieved: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          energy_after?: number | null
          exercise_type?: string | null
          id?: string
          motivation_level?: number | null
          source?: string | null
          target_achieved?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          energy_after?: number | null
          exercise_type?: string | null
          id?: string
          motivation_level?: number | null
          source?: string | null
          target_achieved?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      food_analysis: {
        Row: {
          created_at: string
          emotional_state: string | null
          food_items: Json
          hunger_after: number | null
          hunger_before: number | null
          id: string
          meal_type: string
          nutrition_analysis: Json
          satisfaction_level: number | null
          sofia_analysis: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotional_state?: string | null
          food_items: Json
          hunger_after?: number | null
          hunger_before?: number | null
          id?: string
          meal_type: string
          nutrition_analysis: Json
          satisfaction_level?: number | null
          sofia_analysis: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotional_state?: string | null
          food_items?: Json
          hunger_after?: number | null
          hunger_before?: number | null
          id?: string
          meal_type?: string
          nutrition_analysis?: Json
          satisfaction_level?: number | null
          sofia_analysis?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_patterns: {
        Row: {
          confidence_score: number | null
          context_data: Json | null
          detected_at: string
          id: string
          is_active: boolean | null
          pattern_description: string
          pattern_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          context_data?: Json | null
          detected_at?: string
          id?: string
          is_active?: boolean | null
          pattern_description: string
          pattern_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          context_data?: Json | null
          detected_at?: string
          id?: string
          is_active?: boolean | null
          pattern_description?: string
          pattern_type?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_updates: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          new_value: number
          notes: string | null
          previous_value: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          new_value: number
          notes?: string | null
          previous_value?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          new_value?: number
          notes?: string | null
          previous_value?: number | null
          user_id?: string
        }
        Relationships: []
      }
      google_fit_data: {
        Row: {
          active_minutes: number | null
          calories_burned: number | null
          created_at: string | null
          data_date: string
          distance_meters: number | null
          heart_rate_avg: number | null
          heart_rate_max: number | null
          heart_rate_resting: number | null
          height_cm: number | null
          id: string
          raw_data: Json | null
          sleep_duration_hours: number | null
          steps_count: number | null
          sync_timestamp: string | null
          user_id: string | null
          weight_kg: number | null
        }
        Insert: {
          active_minutes?: number | null
          calories_burned?: number | null
          created_at?: string | null
          data_date: string
          distance_meters?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          heart_rate_resting?: number | null
          height_cm?: number | null
          id?: string
          raw_data?: Json | null
          sleep_duration_hours?: number | null
          steps_count?: number | null
          sync_timestamp?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          active_minutes?: number | null
          calories_burned?: number | null
          created_at?: string | null
          data_date?: string
          distance_meters?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          heart_rate_resting?: number | null
          height_cm?: number | null
          id?: string
          raw_data?: Json | null
          sleep_duration_hours?: number | null
          steps_count?: number | null
          sync_timestamp?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      health_diary: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          exercise_minutes: number | null
          id: string
          mood_rating: number | null
          notes: string | null
          sleep_hours: number | null
          user_id: string
          water_intake: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_hours?: number | null
          user_id: string
          water_intake?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_hours?: number | null
          user_id?: string
          water_intake?: number | null
        }
        Relationships: []
      }
      health_integrations: {
        Row: {
          api_key: string | null
          client_id: string | null
          client_secret: string | null
          config: Json | null
          created_at: string | null
          display_name: string
          enabled: boolean | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          client_id?: string | null
          client_secret?: string | null
          config?: Json | null
          created_at?: string | null
          display_name: string
          enabled?: boolean | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          client_id?: string | null
          client_secret?: string | null
          config?: Json | null
          created_at?: string | null
          display_name?: string
          enabled?: boolean | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      heart_rate_data: {
        Row: {
          activity_type: string | null
          created_at: string | null
          device_model: string | null
          device_type: string | null
          heart_rate_bpm: number
          heart_rate_variability: number | null
          id: string
          max_hr: number | null
          recorded_at: string | null
          recovery_time: number | null
          resting_hr: number | null
          stress_level: number | null
          user_id: string | null
          zone_time: Json | null
        }
        Insert: {
          activity_type?: string | null
          created_at?: string | null
          device_model?: string | null
          device_type?: string | null
          heart_rate_bpm: number
          heart_rate_variability?: number | null
          id?: string
          max_hr?: number | null
          recorded_at?: string | null
          recovery_time?: number | null
          resting_hr?: number | null
          stress_level?: number | null
          user_id?: string | null
          zone_time?: Json | null
        }
        Update: {
          activity_type?: string | null
          created_at?: string | null
          device_model?: string | null
          device_type?: string | null
          heart_rate_bpm?: number
          heart_rate_variability?: number | null
          id?: string
          max_hr?: number | null
          recorded_at?: string | null
          recovery_time?: number | null
          resting_hr?: number | null
          stress_level?: number | null
          user_id?: string | null
          zone_time?: Json | null
        }
        Relationships: []
      }
      impacto_ambiental: {
        Row: {
          alimento_id: number | null
          alternativas_sustentaveis: string | null
          certificacoes: string | null
          created_at: string | null
          emissao_gases: number | null
          id: number
          pegada_carbono: number | null
          sustentabilidade: string | null
          uso_agua: number | null
          uso_terra: number | null
        }
        Insert: {
          alimento_id?: number | null
          alternativas_sustentaveis?: string | null
          certificacoes?: string | null
          created_at?: string | null
          emissao_gases?: number | null
          id?: number
          pegada_carbono?: number | null
          sustentabilidade?: string | null
          uso_agua?: number | null
          uso_terra?: number | null
        }
        Update: {
          alimento_id?: number | null
          alternativas_sustentaveis?: string | null
          certificacoes?: string | null
          created_at?: string | null
          emissao_gases?: number | null
          id?: number
          pegada_carbono?: number | null
          sustentabilidade?: string | null
          uso_agua?: number | null
          uso_terra?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "impacto_ambiental_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      informacoes_economicas: {
        Row: {
          alimento_id: number | null
          categoria_preco: string | null
          created_at: string | null
          custo_beneficio: number | null
          disponibilidade_mercado: string | null
          id: number
          preco_medio: number | null
          versao_importada: boolean | null
          versao_local: boolean | null
          versao_organica: boolean | null
        }
        Insert: {
          alimento_id?: number | null
          categoria_preco?: string | null
          created_at?: string | null
          custo_beneficio?: number | null
          disponibilidade_mercado?: string | null
          id?: number
          preco_medio?: number | null
          versao_importada?: boolean | null
          versao_local?: boolean | null
          versao_organica?: boolean | null
        }
        Update: {
          alimento_id?: number | null
          categoria_preco?: string | null
          created_at?: string | null
          custo_beneficio?: number | null
          disponibilidade_mercado?: string | null
          id?: number
          preco_medio?: number | null
          versao_importada?: boolean | null
          versao_local?: boolean | null
          versao_organica?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "informacoes_economicas_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          is_premium: boolean | null
          lesson_type: string | null
          module_id: string
          objectives: string | null
          order_index: number
          prerequisites: string | null
          quiz_json: string | null
          resources: string | null
          tags: Json | null
          thumbnail_url: string | null
          title: string
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          lesson_type?: string | null
          module_id: string
          objectives?: string | null
          order_index: number
          prerequisites?: string | null
          quiz_json?: string | null
          resources?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          lesson_type?: string | null
          module_id?: string
          objectives?: string | null
          order_index?: number
          prerequisites?: string | null
          quiz_json?: string | null
          resources?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      life_wheel: {
        Row: {
          career_score: number | null
          created_at: string | null
          evaluation_date: string | null
          family_score: number | null
          finances_score: number | null
          health_score: number | null
          id: string
          leisure_score: number | null
          notes: string | null
          overall_satisfaction: number | null
          personal_growth_score: number | null
          relationships_score: number | null
          spirituality_score: number | null
          user_id: string | null
        }
        Insert: {
          career_score?: number | null
          created_at?: string | null
          evaluation_date?: string | null
          family_score?: number | null
          finances_score?: number | null
          health_score?: number | null
          id?: string
          leisure_score?: number | null
          notes?: string | null
          overall_satisfaction?: number | null
          personal_growth_score?: number | null
          relationships_score?: number | null
          spirituality_score?: number | null
          user_id?: string | null
        }
        Update: {
          career_score?: number | null
          created_at?: string | null
          evaluation_date?: string | null
          family_score?: number | null
          finances_score?: number | null
          health_score?: number | null
          id?: string
          leisure_score?: number | null
          notes?: string | null
          overall_satisfaction?: number | null
          personal_growth_score?: number | null
          relationships_score?: number | null
          spirituality_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      medical_documents: {
        Row: {
          clinic_name: string | null
          created_at: string | null
          description: string | null
          doctor_name: string | null
          exam_date: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          results: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clinic_name?: string | null
          created_at?: string | null
          description?: string | null
          doctor_name?: string | null
          exam_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          results?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clinic_name?: string | null
          created_at?: string | null
          description?: string | null
          doctor_name?: string | null
          exam_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          results?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          points: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title?: string
        }
        Relationships: []
      }
      mock_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mood_tracking: {
        Row: {
          created_at: string | null
          date: string | null
          energy_level: number | null
          id: string
          mood_emoji: string | null
          mood_score: number | null
          notes: string | null
          sleep_quality: number | null
          stress_level: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          energy_level?: number | null
          id?: string
          mood_emoji?: string | null
          mood_score?: number | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          energy_level?: number | null
          id?: string
          mood_emoji?: string | null
          mood_score?: number | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          enabled: boolean | null
          id: string
          push_notifications: boolean | null
          sms_notifications: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          enabled?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          enabled?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications_sent: {
        Row: {
          challenge_id: string | null
          channel: string
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          channel: string
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sent_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      nutricao_demografica: {
        Row: {
          alimento_id: number | null
          beneficio_especifico: string | null
          consideracoes_especiais: string | null
          created_at: string | null
          dosagem_especifica: string | null
          faixa_etaria: string | null
          genero: string | null
          id: number
        }
        Insert: {
          alimento_id?: number | null
          beneficio_especifico?: string | null
          consideracoes_especiais?: string | null
          created_at?: string | null
          dosagem_especifica?: string | null
          faixa_etaria?: string | null
          genero?: string | null
          id?: number
        }
        Update: {
          alimento_id?: number | null
          beneficio_especifico?: string | null
          consideracoes_especiais?: string | null
          created_at?: string | null
          dosagem_especifica?: string | null
          faixa_etaria?: string | null
          genero?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "nutricao_demografica_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      nutricao_gestacao: {
        Row: {
          alimento_id: number | null
          beneficio_gestacao: string | null
          contraindicacao_gestacao: boolean | null
          created_at: string | null
          dosagem_gestacao: string | null
          fase: string | null
          id: number
          observacoes_gestacao: string | null
          risco_gestacao: string | null
        }
        Insert: {
          alimento_id?: number | null
          beneficio_gestacao?: string | null
          contraindicacao_gestacao?: boolean | null
          created_at?: string | null
          dosagem_gestacao?: string | null
          fase?: string | null
          id?: number
          observacoes_gestacao?: string | null
          risco_gestacao?: string | null
        }
        Update: {
          alimento_id?: number | null
          beneficio_gestacao?: string | null
          contraindicacao_gestacao?: boolean | null
          created_at?: string | null
          dosagem_gestacao?: string | null
          fase?: string | null
          id?: number
          observacoes_gestacao?: string | null
          risco_gestacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutricao_gestacao_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      preparo_conservacao: {
        Row: {
          alimento_id: number | null
          condicoes_conservacao: string | null
          conservacao: string | null
          created_at: string | null
          dicas_preparo: string | null
          id: number
          metodo_preparo: string | null
          temperatura_ideal: number | null
          tempo_conservacao: number | null
          tempo_cozimento: number | null
          validade_congelado: number | null
          validade_enlatado: number | null
          validade_fresco: number | null
        }
        Insert: {
          alimento_id?: number | null
          condicoes_conservacao?: string | null
          conservacao?: string | null
          created_at?: string | null
          dicas_preparo?: string | null
          id?: number
          metodo_preparo?: string | null
          temperatura_ideal?: number | null
          tempo_conservacao?: number | null
          tempo_cozimento?: number | null
          validade_congelado?: number | null
          validade_enlatado?: number | null
          validade_fresco?: number | null
        }
        Update: {
          alimento_id?: number | null
          condicoes_conservacao?: string | null
          conservacao?: string | null
          created_at?: string | null
          dicas_preparo?: string | null
          id?: number
          metodo_preparo?: string | null
          temperatura_ideal?: number | null
          tempo_conservacao?: number | null
          tempo_cozimento?: number | null
          validade_congelado?: number | null
          validade_enlatado?: number | null
          validade_fresco?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "preparo_conservacao_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      preventive_health_analyses: {
        Row: {
          analysis_data: Json | null
          analysis_type: string
          created_at: string
          id: string
          recommendations: string[] | null
          risk_factors: string[] | null
          risk_score: number | null
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          analysis_type: string
          created_at?: string
          id?: string
          recommendations?: string[] | null
          risk_factors?: string[] | null
          risk_score?: number | null
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          analysis_type?: string
          created_at?: string
          id?: string
          recommendations?: string[] | null
          risk_factors?: string[] | null
          risk_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      principios_ativos: {
        Row: {
          beneficios_terapeuticos: string[] | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          dosagem_segura: string | null
          efeitos_colaterais: string[] | null
          evidencia_cientifica: string | null
          id: number
          interacoes_medicamentosas: string[] | null
          mecanismo_acao: string | null
          nivel_evidencia: number | null
          nome: string
        }
        Insert: {
          beneficios_terapeuticos?: string[] | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          dosagem_segura?: string | null
          efeitos_colaterais?: string[] | null
          evidencia_cientifica?: string | null
          id?: number
          interacoes_medicamentosas?: string[] | null
          mecanismo_acao?: string | null
          nivel_evidencia?: number | null
          nome: string
        }
        Update: {
          beneficios_terapeuticos?: string[] | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          dosagem_segura?: string | null
          efeitos_colaterais?: string[] | null
          evidencia_cientifica?: string | null
          id?: number
          interacoes_medicamentosas?: string[] | null
          mecanismo_acao?: string | null
          nivel_evidencia?: number | null
          nome?: string
        }
        Relationships: []
      }
      professional_evaluations: {
        Row: {
          abdominal_circumference_cm: number
          bmi: number | null
          bmr_kcal: number | null
          body_fat_percentage: number | null
          created_at: string | null
          evaluation_date: string
          extracellular_water_liters: number | null
          extracellular_water_percent: number | null
          fat_mass_kg: number | null
          hip_circumference_cm: number
          hydration_index: number | null
          id: string
          intracellular_water_liters: number | null
          intracellular_water_percent: number | null
          lean_mass_kg: number | null
          metabolic_age: number | null
          muscle_mass_kg: number | null
          muscle_to_fat_ratio: number | null
          notes: string | null
          phase_angle: number | null
          risk_level: string | null
          skinfold_abdomen_mm: number | null
          skinfold_chest_mm: number | null
          skinfold_suprailiac_mm: number | null
          skinfold_thigh_mm: number | null
          skinfold_triceps_mm: number | null
          total_body_water_liters: number | null
          total_body_water_percent: number | null
          updated_at: string | null
          user_id: string
          waist_circumference_cm: number
          waist_to_height_ratio: number | null
          waist_to_hip_ratio: number | null
          weight_kg: number
        }
        Insert: {
          abdominal_circumference_cm: number
          bmi?: number | null
          bmr_kcal?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          evaluation_date?: string
          extracellular_water_liters?: number | null
          extracellular_water_percent?: number | null
          fat_mass_kg?: number | null
          hip_circumference_cm: number
          hydration_index?: number | null
          id?: string
          intracellular_water_liters?: number | null
          intracellular_water_percent?: number | null
          lean_mass_kg?: number | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          muscle_to_fat_ratio?: number | null
          notes?: string | null
          phase_angle?: number | null
          risk_level?: string | null
          skinfold_abdomen_mm?: number | null
          skinfold_chest_mm?: number | null
          skinfold_suprailiac_mm?: number | null
          skinfold_thigh_mm?: number | null
          skinfold_triceps_mm?: number | null
          total_body_water_liters?: number | null
          total_body_water_percent?: number | null
          updated_at?: string | null
          user_id: string
          waist_circumference_cm: number
          waist_to_height_ratio?: number | null
          waist_to_hip_ratio?: number | null
          weight_kg: number
        }
        Update: {
          abdominal_circumference_cm?: number
          bmi?: number | null
          bmr_kcal?: number | null
          body_fat_percentage?: number | null
          created_at?: string | null
          evaluation_date?: string
          extracellular_water_liters?: number | null
          extracellular_water_percent?: number | null
          fat_mass_kg?: number | null
          hip_circumference_cm?: number
          hydration_index?: number | null
          id?: string
          intracellular_water_liters?: number | null
          intracellular_water_percent?: number | null
          lean_mass_kg?: number | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          muscle_to_fat_ratio?: number | null
          notes?: string | null
          phase_angle?: number | null
          risk_level?: string | null
          skinfold_abdomen_mm?: number | null
          skinfold_chest_mm?: number | null
          skinfold_suprailiac_mm?: number | null
          skinfold_thigh_mm?: number | null
          skinfold_triceps_mm?: number | null
          total_body_water_liters?: number | null
          total_body_water_percent?: number | null
          updated_at?: string | null
          user_id?: string
          waist_circumference_cm?: number
          waist_to_height_ratio?: number | null
          waist_to_hip_ratio?: number | null
          weight_kg?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: string[] | null
          activity_level: string | null
          address: string | null
          admin_level: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          current_weight: number | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          goals: string[] | null
          height: number | null
          height_cm: number | null
          id: string
          is_admin: boolean | null
          is_super_admin: boolean | null
          language: string | null
          password_changed_at: string | null
          phone: string | null
          postal_code: string | null
          preferences: Json | null
          require_password_change: boolean | null
          role: string | null
          state: string | null
          target_weight: number | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          activity_level?: string | null
          address?: string | null
          admin_level?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_weight?: number | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: string[] | null
          height?: number | null
          height_cm?: number | null
          id?: string
          is_admin?: boolean | null
          is_super_admin?: boolean | null
          language?: string | null
          password_changed_at?: string | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          require_password_change?: boolean | null
          role?: string | null
          state?: string | null
          target_weight?: number | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          activity_level?: string | null
          address?: string | null
          admin_level?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_weight?: number | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: string[] | null
          height?: number | null
          height_cm?: number | null
          id?: string
          is_admin?: boolean | null
          is_super_admin?: boolean | null
          language?: string | null
          password_changed_at?: string | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          require_password_change?: boolean | null
          role?: string | null
          state?: string | null
          target_weight?: number | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      protocolos_nutricionais: {
        Row: {
          alimentos_evitar: string[] | null
          contraindicacoes: string | null
          created_at: string | null
          descricao: string | null
          duracao: string | null
          estilo_vida: string[] | null
          evidencia_cientifica: string | null
          fase1_alimentos: string[] | null
          fase2_alimentos: string[] | null
          fase3_alimentos: string[] | null
          id: number
          nivel_evidencia: number | null
          nome: string
          objetivo: string | null
          suplementos_recomendados: string[] | null
        }
        Insert: {
          alimentos_evitar?: string[] | null
          contraindicacoes?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao?: string | null
          estilo_vida?: string[] | null
          evidencia_cientifica?: string | null
          fase1_alimentos?: string[] | null
          fase2_alimentos?: string[] | null
          fase3_alimentos?: string[] | null
          id?: number
          nivel_evidencia?: number | null
          nome: string
          objetivo?: string | null
          suplementos_recomendados?: string[] | null
        }
        Update: {
          alimentos_evitar?: string[] | null
          contraindicacoes?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao?: string | null
          estilo_vida?: string[] | null
          evidencia_cientifica?: string | null
          fase1_alimentos?: string[] | null
          fase2_alimentos?: string[] | null
          fase3_alimentos?: string[] | null
          id?: number
          nivel_evidencia?: number | null
          nome?: string
          objetivo?: string | null
          suplementos_recomendados?: string[] | null
        }
        Relationships: []
      }
      receita_componentes: {
        Row: {
          alimento_id: number
          grams: number
          id: number
          receita_id: number
        }
        Insert: {
          alimento_id: number
          grams: number
          id?: number
          receita_id: number
        }
        Update: {
          alimento_id?: number
          grams?: number
          id?: number
          receita_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "receita_componentes_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receita_componentes_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "receitas"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas: {
        Row: {
          created_at: string
          id: number
          nome: string
        }
        Insert: {
          created_at?: string
          id?: number
          nome: string
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string
        }
        Relationships: []
      }
      receitas_terapeuticas: {
        Row: {
          beneficios_terapeuticos: string[] | null
          contraindicacoes: string | null
          created_at: string | null
          dificuldade: string | null
          dosagem_recomendada: string | null
          frequencia_consumo: string | null
          id: number
          ingredientes: Json | null
          instrucoes_preparo: string | null
          nome: string
          objetivo_terapeutico: string | null
          tempo_preparo: number | null
        }
        Insert: {
          beneficios_terapeuticos?: string[] | null
          contraindicacoes?: string | null
          created_at?: string | null
          dificuldade?: string | null
          dosagem_recomendada?: string | null
          frequencia_consumo?: string | null
          id?: number
          ingredientes?: Json | null
          instrucoes_preparo?: string | null
          nome: string
          objetivo_terapeutico?: string | null
          tempo_preparo?: number | null
        }
        Update: {
          beneficios_terapeuticos?: string[] | null
          contraindicacoes?: string | null
          created_at?: string | null
          dificuldade?: string | null
          dosagem_recomendada?: string | null
          frequencia_consumo?: string | null
          id?: number
          ingredientes?: Json | null
          instrucoes_preparo?: string | null
          nome?: string
          objetivo_terapeutico?: string | null
          tempo_preparo?: number | null
        }
        Relationships: []
      }
      saboteur_assessments: {
        Row: {
          assessment_date: string | null
          completed: boolean | null
          completion_time: number | null
          created_at: string | null
          description: string | null
          id: string
          title: string | null
          total_questions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          completed?: boolean | null
          completion_time?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string | null
          total_questions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          completed?: boolean | null
          completion_time?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string | null
          total_questions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saboteur_responses: {
        Row: {
          answer: number
          assessment_id: string | null
          created_at: string | null
          id: string
          question_id: string
          question_text: string
          saboteur_id: string
          saboteur_name: string
          user_id: string | null
        }
        Insert: {
          answer: number
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          question_id: string
          question_text: string
          saboteur_id: string
          saboteur_name: string
          user_id?: string | null
        }
        Update: {
          answer?: number
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          question_id?: string
          question_text?: string
          saboteur_id?: string
          saboteur_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saboteur_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "saboteur_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      saboteur_results: {
        Row: {
          assessment_id: string | null
          created_at: string | null
          id: string
          max_possible_score: number
          percentage: number
          recommendations: string | null
          saboteur_id: string
          saboteur_name: string
          score: number
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          max_possible_score: number
          percentage: number
          recommendations?: string | null
          saboteur_id: string
          saboteur_name: string
          score: number
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          max_possible_score?: number
          percentage?: number
          recommendations?: string | null
          saboteur_id?: string
          saboteur_name?: string
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saboteur_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "saboteur_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      saude_especifica: {
        Row: {
          alimento_id: number | null
          categoria_saude: string | null
          created_at: string | null
          dosagem_recomendada: string | null
          efeito: string | null
          efeitos_colaterais: string | null
          frequencia_recomendada: string | null
          id: number
          interacoes_medicamentosas: string | null
          mecanismo: string | null
        }
        Insert: {
          alimento_id?: number | null
          categoria_saude?: string | null
          created_at?: string | null
          dosagem_recomendada?: string | null
          efeito?: string | null
          efeitos_colaterais?: string | null
          frequencia_recomendada?: string | null
          id?: number
          interacoes_medicamentosas?: string | null
          mecanismo?: string | null
        }
        Update: {
          alimento_id?: number | null
          categoria_saude?: string | null
          created_at?: string | null
          dosagem_recomendada?: string | null
          efeito?: string | null
          efeitos_colaterais?: string | null
          frequencia_recomendada?: string | null
          id?: number
          interacoes_medicamentosas?: string | null
          mecanismo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saude_especifica_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      seguranca_alimentar: {
        Row: {
          alimento_id: number | null
          bacterias_comuns: string | null
          created_at: string | null
          grupos_risco: string | null
          id: number
          metais_pesados: string | null
          parasitas_comuns: string | null
          pesticidas_comuns: string | null
          recomendacoes_seguranca: string | null
          risco_contaminacao: string | null
          toxinas_naturais: string | null
        }
        Insert: {
          alimento_id?: number | null
          bacterias_comuns?: string | null
          created_at?: string | null
          grupos_risco?: string | null
          id?: number
          metais_pesados?: string | null
          parasitas_comuns?: string | null
          pesticidas_comuns?: string | null
          recomendacoes_seguranca?: string | null
          risco_contaminacao?: string | null
          toxinas_naturais?: string | null
        }
        Update: {
          alimento_id?: number | null
          bacterias_comuns?: string | null
          created_at?: string | null
          grupos_risco?: string | null
          id?: number
          metais_pesados?: string | null
          parasitas_comuns?: string | null
          pesticidas_comuns?: string | null
          recomendacoes_seguranca?: string | null
          risco_contaminacao?: string | null
          toxinas_naturais?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguranca_alimentar_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          estimated_time: number | null
          follow_up_questions: string[] | null
          id: string
          is_active: boolean | null
          materials_needed: string[] | null
          target_saboteurs: string[] | null
          title: string
          tools: Json | null
          tools_data: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: number | null
          follow_up_questions?: string[] | null
          id?: string
          is_active?: boolean | null
          materials_needed?: string[] | null
          target_saboteurs?: string[] | null
          title: string
          tools?: Json | null
          tools_data?: Json | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: number | null
          follow_up_questions?: string[] | null
          id?: string
          is_active?: boolean | null
          materials_needed?: string[] | null
          target_saboteurs?: string[] | null
          title?: string
          tools?: Json | null
          tools_data?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sleep_tracking: {
        Row: {
          created_at: string | null
          date: string
          hours: number | null
          id: string
          quality: number | null
          source: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          hours?: number | null
          id?: string
          quality?: number | null
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          hours?: number | null
          id?: string
          quality?: number | null
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sofia_conversations: {
        Row: {
          context_data: Json | null
          conversation_type: string | null
          created_at: string | null
          id: string
          sofia_response: string
          updated_at: string | null
          user_id: string | null
          user_message: string
        }
        Insert: {
          context_data?: Json | null
          conversation_type?: string | null
          created_at?: string | null
          id?: string
          sofia_response: string
          updated_at?: string | null
          user_id?: string | null
          user_message: string
        }
        Update: {
          context_data?: Json | null
          conversation_type?: string | null
          created_at?: string | null
          id?: string
          sofia_response?: string
          updated_at?: string | null
          user_id?: string | null
          user_message?: string
        }
        Relationships: []
      }
      sofia_conversations_backup: {
        Row: {
          created_at: string | null
          id: string
          messages: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sofia_food_analysis: {
        Row: {
          confirmation_prompt_sent: boolean | null
          confirmation_status: string | null
          confirmed_by_user: boolean | null
          created_at: string | null
          foods_detected: Json
          id: string
          image_url: string | null
          sofia_analysis: string | null
          total_calories: number | null
          user_id: string | null
          user_message: string | null
          user_name: string | null
        }
        Insert: {
          confirmation_prompt_sent?: boolean | null
          confirmation_status?: string | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          foods_detected?: Json
          id?: string
          image_url?: string | null
          sofia_analysis?: string | null
          total_calories?: number | null
          user_id?: string | null
          user_message?: string | null
          user_name?: string | null
        }
        Update: {
          confirmation_prompt_sent?: boolean | null
          confirmation_status?: string | null
          confirmed_by_user?: boolean | null
          created_at?: string | null
          foods_detected?: Json
          id?: string
          image_url?: string | null
          sofia_analysis?: string | null
          total_calories?: number | null
          user_id?: string | null
          user_message?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      subscription_invoices: {
        Row: {
          amount: number
          asaas_payment_id: string | null
          bank_slip_url: string | null
          created_at: string
          due_date: string
          id: string
          invoice_url: string | null
          paid_date: string | null
          payment_method: string | null
          pix_qr_code: string | null
          status: string | null
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          asaas_payment_id?: string | null
          bank_slip_url?: string | null
          created_at?: string
          due_date: string
          id?: string
          invoice_url?: string | null
          paid_date?: string | null
          payment_method?: string | null
          pix_qr_code?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          asaas_payment_id?: string | null
          bank_slip_url?: string | null
          created_at?: string
          due_date?: string
          id?: string
          invoice_url?: string | null
          paid_date?: string | null
          payment_method?: string | null
          pix_qr_code?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          interval_count: number | null
          interval_type: string | null
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_count?: number | null
          interval_type?: string | null
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_count?: number | null
          interval_type?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      substituicoes: {
        Row: {
          alimento_original_id: number | null
          alimento_substituto_id: number | null
          created_at: string | null
          desvantagens: string | null
          id: number
          motivo: string
          observacoes: string | null
          proporcao_substituicao: number | null
          similaridade: number | null
          vantagens: string | null
        }
        Insert: {
          alimento_original_id?: number | null
          alimento_substituto_id?: number | null
          created_at?: string | null
          desvantagens?: string | null
          id?: number
          motivo: string
          observacoes?: string | null
          proporcao_substituicao?: number | null
          similaridade?: number | null
          vantagens?: string | null
        }
        Update: {
          alimento_original_id?: number | null
          alimento_substituto_id?: number | null
          created_at?: string | null
          desvantagens?: string | null
          id?: number
          motivo?: string
          observacoes?: string | null
          proporcao_substituicao?: number | null
          similaridade?: number | null
          vantagens?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substituicoes_alimento_original_id_fkey"
            columns: ["alimento_original_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substituicoes_alimento_substituto_id_fkey"
            columns: ["alimento_substituto_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      substituicoes_inteligentes: {
        Row: {
          alimento_original_id: number | null
          alimento_substituto_id: number | null
          beneficio_esperado: string | null
          contraindicacoes: string | null
          created_at: string | null
          desvantagens: string | null
          doenca_condicao_id: number | null
          dosagem_equivalente: string | null
          forma_preparo: string | null
          id: number
          motivo_substituicao: string | null
          similaridade_nutricional: number | null
          tempo_adaptacao: string | null
          vantagens: string | null
        }
        Insert: {
          alimento_original_id?: number | null
          alimento_substituto_id?: number | null
          beneficio_esperado?: string | null
          contraindicacoes?: string | null
          created_at?: string | null
          desvantagens?: string | null
          doenca_condicao_id?: number | null
          dosagem_equivalente?: string | null
          forma_preparo?: string | null
          id?: number
          motivo_substituicao?: string | null
          similaridade_nutricional?: number | null
          tempo_adaptacao?: string | null
          vantagens?: string | null
        }
        Update: {
          alimento_original_id?: number | null
          alimento_substituto_id?: number | null
          beneficio_esperado?: string | null
          contraindicacoes?: string | null
          created_at?: string | null
          desvantagens?: string | null
          doenca_condicao_id?: number | null
          dosagem_equivalente?: string | null
          forma_preparo?: string | null
          id?: number
          motivo_substituicao?: string | null
          similaridade_nutricional?: number | null
          tempo_adaptacao?: string | null
          vantagens?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substituicoes_inteligentes_alimento_original_id_fkey"
            columns: ["alimento_original_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substituicoes_inteligentes_alimento_substituto_id_fkey"
            columns: ["alimento_substituto_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substituicoes_inteligentes_doenca_condicao_id_fkey"
            columns: ["doenca_condicao_id"]
            isOneToOne: false
            referencedRelation: "doencas_condicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_achievements: {
        Row: {
          achieved_at: string | null
          achievement_type: string
          current_value: number | null
          description: string | null
          icon: string | null
          id: string
          is_milestone: boolean | null
          points_earned: number | null
          streak_days: number | null
          target_value: number | null
          title: string
          tracking_category: string
          user_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          achievement_type: string
          current_value?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_milestone?: boolean | null
          points_earned?: number | null
          streak_days?: number | null
          target_value?: number | null
          title: string
          tracking_category: string
          user_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          achievement_type?: string
          current_value?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_milestone?: boolean | null
          points_earned?: number | null
          streak_days?: number | null
          target_value?: number | null
          title?: string
          tracking_category?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_type: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          progress: number | null
          target: number | null
          title: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_type: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          title: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_type?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          title?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_anamnesis: {
        Row: {
          biggest_weight_loss_challenge: string | null
          city_state: string | null
          compulsive_eating_situations: string | null
          created_at: string | null
          current_bmi: number | null
          current_weight: number | null
          daily_energy_level: number | null
          daily_stress_level: number | null
          eats_in_secret: boolean | null
          eats_until_uncomfortable: boolean | null
          emotional_events_during_weight_gain: string | null
          family_depression_anxiety_history: boolean | null
          family_diabetes_history: boolean | null
          family_eating_disorders_history: boolean | null
          family_heart_disease_history: boolean | null
          family_obesity_history: boolean | null
          family_other_chronic_diseases: string | null
          family_thyroid_problems_history: boolean | null
          feels_guilt_after_eating: boolean | null
          food_relationship_score: number | null
          forbidden_foods: Json | null
          full_address: string | null
          general_quality_of_life: number | null
          had_rebound_effect: boolean | null
          has_compulsive_eating: boolean | null
          height_cm: number | null
          highest_adult_weight: number | null
          how_found_method: string | null
          id: string
          ideal_weight_goal: number | null
          least_effective_treatment: string | null
          lowest_adult_weight: number | null
          main_treatment_goals: string | null
          major_weight_gain_periods: string | null
          marital_status: string | null
          most_effective_treatment: string | null
          motivation_for_seeking_treatment: string | null
          physical_activity_frequency: string | null
          physical_activity_type: string | null
          previous_weight_treatments: Json | null
          problematic_foods: Json | null
          profession: string | null
          sleep_hours_per_night: number | null
          sleep_quality_score: number | null
          timeframe_to_achieve_goal: string | null
          treatment_success_definition: string | null
          updated_at: string | null
          user_id: string
          weight_fluctuation_classification: string | null
          weight_gain_started_age: number | null
        }
        Insert: {
          biggest_weight_loss_challenge?: string | null
          city_state?: string | null
          compulsive_eating_situations?: string | null
          created_at?: string | null
          current_bmi?: number | null
          current_weight?: number | null
          daily_energy_level?: number | null
          daily_stress_level?: number | null
          eats_in_secret?: boolean | null
          eats_until_uncomfortable?: boolean | null
          emotional_events_during_weight_gain?: string | null
          family_depression_anxiety_history?: boolean | null
          family_diabetes_history?: boolean | null
          family_eating_disorders_history?: boolean | null
          family_heart_disease_history?: boolean | null
          family_obesity_history?: boolean | null
          family_other_chronic_diseases?: string | null
          family_thyroid_problems_history?: boolean | null
          feels_guilt_after_eating?: boolean | null
          food_relationship_score?: number | null
          forbidden_foods?: Json | null
          full_address?: string | null
          general_quality_of_life?: number | null
          had_rebound_effect?: boolean | null
          has_compulsive_eating?: boolean | null
          height_cm?: number | null
          highest_adult_weight?: number | null
          how_found_method?: string | null
          id?: string
          ideal_weight_goal?: number | null
          least_effective_treatment?: string | null
          lowest_adult_weight?: number | null
          main_treatment_goals?: string | null
          major_weight_gain_periods?: string | null
          marital_status?: string | null
          most_effective_treatment?: string | null
          motivation_for_seeking_treatment?: string | null
          physical_activity_frequency?: string | null
          physical_activity_type?: string | null
          previous_weight_treatments?: Json | null
          problematic_foods?: Json | null
          profession?: string | null
          sleep_hours_per_night?: number | null
          sleep_quality_score?: number | null
          timeframe_to_achieve_goal?: string | null
          treatment_success_definition?: string | null
          updated_at?: string | null
          user_id: string
          weight_fluctuation_classification?: string | null
          weight_gain_started_age?: number | null
        }
        Update: {
          biggest_weight_loss_challenge?: string | null
          city_state?: string | null
          compulsive_eating_situations?: string | null
          created_at?: string | null
          current_bmi?: number | null
          current_weight?: number | null
          daily_energy_level?: number | null
          daily_stress_level?: number | null
          eats_in_secret?: boolean | null
          eats_until_uncomfortable?: boolean | null
          emotional_events_during_weight_gain?: string | null
          family_depression_anxiety_history?: boolean | null
          family_diabetes_history?: boolean | null
          family_eating_disorders_history?: boolean | null
          family_heart_disease_history?: boolean | null
          family_obesity_history?: boolean | null
          family_other_chronic_diseases?: string | null
          family_thyroid_problems_history?: boolean | null
          feels_guilt_after_eating?: boolean | null
          food_relationship_score?: number | null
          forbidden_foods?: Json | null
          full_address?: string | null
          general_quality_of_life?: number | null
          had_rebound_effect?: boolean | null
          has_compulsive_eating?: boolean | null
          height_cm?: number | null
          highest_adult_weight?: number | null
          how_found_method?: string | null
          id?: string
          ideal_weight_goal?: number | null
          least_effective_treatment?: string | null
          lowest_adult_weight?: number | null
          main_treatment_goals?: string | null
          major_weight_gain_periods?: string | null
          marital_status?: string | null
          most_effective_treatment?: string | null
          motivation_for_seeking_treatment?: string | null
          physical_activity_frequency?: string | null
          physical_activity_type?: string | null
          previous_weight_treatments?: Json | null
          problematic_foods?: Json | null
          profession?: string | null
          sleep_hours_per_night?: number | null
          sleep_quality_score?: number | null
          timeframe_to_achieve_goal?: string | null
          treatment_success_definition?: string | null
          updated_at?: string | null
          user_id?: string
          weight_fluctuation_classification?: string | null
          weight_gain_started_age?: number | null
        }
        Relationships: []
      }
      user_assessments: {
        Row: {
          areas: Json
          assessment_type: string
          completed_at: string | null
          created_at: string | null
          id: string
          scores: Json
          total_score: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          areas: Json
          assessment_type: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          scores: Json
          total_score: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          areas?: Json
          assessment_type?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          scores?: Json
          total_score?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_behavior_patterns: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          pattern_data: Json
          pattern_type: string
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pattern_data: Json
          pattern_type: string
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pattern_data?: Json
          pattern_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_custom_saboteurs: {
        Row: {
          created_at: string | null
          id: string
          saboteur_id: string | null
          score: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          saboteur_id?: string | null
          score?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          saboteur_id?: string | null
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_saboteurs_saboteur_id_fkey"
            columns: ["saboteur_id"]
            isOneToOne: false
            referencedRelation: "custom_saboteurs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_foods: {
        Row: {
          created_at: string
          food_category: string
          food_name: string
          id: string
          last_used: string | null
          nutrition_data: Json | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          food_category: string
          food_name: string
          id?: string
          last_used?: string | null
          nutrition_data?: Json | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          food_category?: string
          food_name?: string
          id?: string
          last_used?: string | null
          nutrition_data?: Json | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          challenge_id: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          difficulty: string | null
          estimated_points: number | null
          evidence_required: boolean | null
          evidence_url: string | null
          final_points: number | null
          id: string
          is_group_goal: boolean | null
          is_public: boolean | null
          peso_meta_kg: number | null
          rejection_reason: string | null
          status: string | null
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          challenge_id?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          difficulty?: string | null
          estimated_points?: number | null
          evidence_required?: boolean | null
          evidence_url?: string | null
          final_points?: number | null
          id?: string
          is_group_goal?: boolean | null
          is_public?: boolean | null
          peso_meta_kg?: number | null
          rejection_reason?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          challenge_id?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          difficulty?: string | null
          estimated_points?: number | null
          evidence_required?: boolean | null
          evidence_url?: string | null
          final_points?: number | null
          id?: string
          is_group_goal?: boolean | null
          is_public?: boolean | null
          peso_meta_kg?: number | null
          rejection_reason?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals_backup: {
        Row: {
          admin_notes: string | null
          category: string | null
          challenge_id: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          difficulty: string | null
          evidence_required: boolean | null
          evidence_url: string | null
          id: string | null
          is_group_goal: boolean | null
          is_public: boolean | null
          status: string | null
          target_date: string | null
          target_value: number | null
          title: string | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          challenge_id?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          difficulty?: string | null
          evidence_required?: boolean | null
          evidence_url?: string | null
          id?: string | null
          is_group_goal?: boolean | null
          is_public?: boolean | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          challenge_id?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          difficulty?: string | null
          evidence_required?: boolean | null
          evidence_url?: string | null
          id?: string | null
          is_group_goal?: boolean | null
          is_public?: boolean | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          title?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          completed_at: string | null
          date_assigned: string
          id: string
          is_completed: boolean | null
          mission_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          date_assigned?: string
          id?: string
          is_completed?: boolean | null
          mission_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          date_assigned?: string
          id?: string
          is_completed?: boolean | null
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          channels: Json | null
          created_at: string | null
          frequency: string | null
          id: string
          is_enabled: boolean | null
          notification_type: string
          preferred_time: string | null
          smart_timing: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channels?: Json | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type: string
          preferred_time?: string | null
          smart_timing?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channels?: Json | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type?: string
          preferred_time?: string | null
          smart_timing?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_physical_data: {
        Row: {
          altura_cm: number
          created_at: string | null
          id: string
          idade: number
          nivel_atividade: string | null
          sexo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          altura_cm: number
          created_at?: string | null
          id?: string
          idade: number
          nivel_atividade?: string | null
          sexo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          altura_cm?: number
          created_at?: string | null
          id?: string
          idade?: number
          nivel_atividade?: string | null
          sexo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          id: string
          is_completed: boolean | null
          lesson_id: string
          user_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id: string
          user_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string
          user_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_scores: {
        Row: {
          created_at: string | null
          current_level: number | null
          daily_score: number | null
          date: string | null
          id: string
          level_points: number | null
          missions_completed: number | null
          streak_days: number | null
          total_missions: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          daily_score?: number | null
          date?: string | null
          id?: string
          level_points?: number | null
          missions_completed?: number | null
          streak_days?: number | null
          total_missions?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          daily_score?: number | null
          date?: string | null
          id?: string
          level_points?: number | null
          missions_completed?: number | null
          streak_days?: number | null
          total_missions?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          assigned_at: string | null
          auto_save_data: Json | null
          completed_at: string | null
          created_at: string | null
          cycle_number: number | null
          due_date: string | null
          feedback: Json | null
          id: string
          is_locked: boolean | null
          last_activity: string | null
          next_available_date: string | null
          notes: string | null
          progress: number | null
          review_count: number | null
          sent_at: string | null
          session_id: string | null
          started_at: string | null
          status: string | null
          tools_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          assigned_at?: string | null
          auto_save_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          cycle_number?: number | null
          due_date?: string | null
          feedback?: Json | null
          id?: string
          is_locked?: boolean | null
          last_activity?: string | null
          next_available_date?: string | null
          notes?: string | null
          progress?: number | null
          review_count?: number | null
          sent_at?: string | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          tools_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          assigned_at?: string | null
          auto_save_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          cycle_number?: number | null
          due_date?: string | null
          feedback?: Json | null
          id?: string
          is_locked?: boolean | null
          last_activity?: string | null
          next_available_date?: string | null
          notes?: string | null
          progress?: number | null
          review_count?: number | null
          sent_at?: string | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          tools_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          asaas_customer_id: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          asaas_customer_id?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          asaas_customer_id?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      valores_nutricionais: {
        Row: {
          acucar: number | null
          ala: number | null
          alanina: number | null
          alimento_id: number | null
          amido: number | null
          arginina: number | null
          aspartico: number | null
          calcio: number | null
          calorias: number | null
          carboidrato: number | null
          carga_glicemica: number | null
          carotenoides: number | null
          cistina: number | null
          cobre: number | null
          created_at: string | null
          cromo: number | null
          curcumina: number | null
          densidade_calorica: number | null
          dha: number | null
          epa: number | null
          fenilalanina: number | null
          ferro: number | null
          fibras: number | null
          fibras_insoluveis: number | null
          fibras_soluveis: number | null
          flavonoides: number | null
          fosforo: number | null
          glicina: number | null
          glutamico: number | null
          gordura: number | null
          gordura_insaturada: number | null
          gordura_saturada: number | null
          gordura_trans: number | null
          histidina: number | null
          id: number
          indice_glicemico: number | null
          indice_saciedade: number | null
          isoleucina: number | null
          leucina: number | null
          licopeno: number | null
          lisina: number | null
          luteina: number | null
          magnesio: number | null
          manganes: number | null
          metionina: number | null
          molibdenio: number | null
          omega_3: number | null
          omega_6: number | null
          omega_9: number | null
          pdcaas: number | null
          polifenois: number | null
          potassio: number | null
          prolina: number | null
          proteina: number | null
          quercetina: number | null
          resveratrol: number | null
          selenio: number | null
          serina: number | null
          sodio: number | null
          tirosina: number | null
          treonina: number | null
          triptofano: number | null
          updated_at: string | null
          valina: number | null
          valor_biologico: number | null
          vitamina_a: number | null
          vitamina_b1: number | null
          vitamina_b12: number | null
          vitamina_b2: number | null
          vitamina_b3: number | null
          vitamina_b5: number | null
          vitamina_b6: number | null
          vitamina_b7: number | null
          vitamina_b9: number | null
          vitamina_c: number | null
          vitamina_d: number | null
          vitamina_e: number | null
          vitamina_k: number | null
          zeaxantina: number | null
          zinco: number | null
        }
        Insert: {
          acucar?: number | null
          ala?: number | null
          alanina?: number | null
          alimento_id?: number | null
          amido?: number | null
          arginina?: number | null
          aspartico?: number | null
          calcio?: number | null
          calorias?: number | null
          carboidrato?: number | null
          carga_glicemica?: number | null
          carotenoides?: number | null
          cistina?: number | null
          cobre?: number | null
          created_at?: string | null
          cromo?: number | null
          curcumina?: number | null
          densidade_calorica?: number | null
          dha?: number | null
          epa?: number | null
          fenilalanina?: number | null
          ferro?: number | null
          fibras?: number | null
          fibras_insoluveis?: number | null
          fibras_soluveis?: number | null
          flavonoides?: number | null
          fosforo?: number | null
          glicina?: number | null
          glutamico?: number | null
          gordura?: number | null
          gordura_insaturada?: number | null
          gordura_saturada?: number | null
          gordura_trans?: number | null
          histidina?: number | null
          id?: number
          indice_glicemico?: number | null
          indice_saciedade?: number | null
          isoleucina?: number | null
          leucina?: number | null
          licopeno?: number | null
          lisina?: number | null
          luteina?: number | null
          magnesio?: number | null
          manganes?: number | null
          metionina?: number | null
          molibdenio?: number | null
          omega_3?: number | null
          omega_6?: number | null
          omega_9?: number | null
          pdcaas?: number | null
          polifenois?: number | null
          potassio?: number | null
          prolina?: number | null
          proteina?: number | null
          quercetina?: number | null
          resveratrol?: number | null
          selenio?: number | null
          serina?: number | null
          sodio?: number | null
          tirosina?: number | null
          treonina?: number | null
          triptofano?: number | null
          updated_at?: string | null
          valina?: number | null
          valor_biologico?: number | null
          vitamina_a?: number | null
          vitamina_b1?: number | null
          vitamina_b12?: number | null
          vitamina_b2?: number | null
          vitamina_b3?: number | null
          vitamina_b5?: number | null
          vitamina_b6?: number | null
          vitamina_b7?: number | null
          vitamina_b9?: number | null
          vitamina_c?: number | null
          vitamina_d?: number | null
          vitamina_e?: number | null
          vitamina_k?: number | null
          zeaxantina?: number | null
          zinco?: number | null
        }
        Update: {
          acucar?: number | null
          ala?: number | null
          alanina?: number | null
          alimento_id?: number | null
          amido?: number | null
          arginina?: number | null
          aspartico?: number | null
          calcio?: number | null
          calorias?: number | null
          carboidrato?: number | null
          carga_glicemica?: number | null
          carotenoides?: number | null
          cistina?: number | null
          cobre?: number | null
          created_at?: string | null
          cromo?: number | null
          curcumina?: number | null
          densidade_calorica?: number | null
          dha?: number | null
          epa?: number | null
          fenilalanina?: number | null
          ferro?: number | null
          fibras?: number | null
          fibras_insoluveis?: number | null
          fibras_soluveis?: number | null
          flavonoides?: number | null
          fosforo?: number | null
          glicina?: number | null
          glutamico?: number | null
          gordura?: number | null
          gordura_insaturada?: number | null
          gordura_saturada?: number | null
          gordura_trans?: number | null
          histidina?: number | null
          id?: number
          indice_glicemico?: number | null
          indice_saciedade?: number | null
          isoleucina?: number | null
          leucina?: number | null
          licopeno?: number | null
          lisina?: number | null
          luteina?: number | null
          magnesio?: number | null
          manganes?: number | null
          metionina?: number | null
          molibdenio?: number | null
          omega_3?: number | null
          omega_6?: number | null
          omega_9?: number | null
          pdcaas?: number | null
          polifenois?: number | null
          potassio?: number | null
          prolina?: number | null
          proteina?: number | null
          quercetina?: number | null
          resveratrol?: number | null
          selenio?: number | null
          serina?: number | null
          sodio?: number | null
          tirosina?: number | null
          treonina?: number | null
          triptofano?: number | null
          updated_at?: string | null
          valina?: number | null
          valor_biologico?: number | null
          vitamina_a?: number | null
          vitamina_b1?: number | null
          vitamina_b12?: number | null
          vitamina_b2?: number | null
          vitamina_b3?: number | null
          vitamina_b5?: number | null
          vitamina_b6?: number | null
          vitamina_b7?: number | null
          vitamina_b9?: number | null
          vitamina_c?: number | null
          vitamina_d?: number | null
          vitamina_e?: number | null
          vitamina_k?: number | null
          zeaxantina?: number | null
          zinco?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "valores_nutricionais_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      valores_nutricionais_completos: {
        Row: {
          ala: number | null
          alimento_id: number | null
          aminoacidos_essenciais: Json | null
          betaina: number | null
          calcio: number | null
          calorias: number | null
          carboidrato: number | null
          carboidratos: number | null
          carga_glicemica: number | null
          carotenoides: number | null
          cobre: number | null
          colina: number | null
          created_at: string | null
          dha: number | null
          epa: number | null
          ferro: number | null
          fibra: number | null
          fibras: number | null
          fibras_insoluveis: number | null
          fibras_soluveis: number | null
          flavonoides: number | null
          fosforo: number | null
          gordura: number | null
          gordura_insaturada: number | null
          gordura_saturada: number | null
          gordura_trans: number | null
          gorduras: number | null
          id: number
          indice_glicemico: number | null
          indice_saciedade: number | null
          inositol: number | null
          kcal: number | null
          magnesio: number | null
          manganes: number | null
          omega_3: number | null
          omega_6: number | null
          omega_9: number | null
          pdcaas: number | null
          polifenois: number | null
          potassio: number | null
          proteina: number | null
          quercetina: number | null
          resveratrol: number | null
          selenio: number | null
          sodio: number | null
          sodio_mg: number | null
          taurina: number | null
          valor_biologico: number | null
          vitamina_a: number | null
          vitamina_b1: number | null
          vitamina_b12: number | null
          vitamina_b2: number | null
          vitamina_b3: number | null
          vitamina_b5: number | null
          vitamina_b6: number | null
          vitamina_b7: number | null
          vitamina_b9: number | null
          vitamina_c: number | null
          vitamina_d: number | null
          vitamina_e: number | null
          vitamina_k: number | null
          zinco: number | null
        }
        Insert: {
          ala?: number | null
          alimento_id?: number | null
          aminoacidos_essenciais?: Json | null
          betaina?: number | null
          calcio?: number | null
          calorias?: number | null
          carboidrato?: number | null
          carboidratos?: number | null
          carga_glicemica?: number | null
          carotenoides?: number | null
          cobre?: number | null
          colina?: number | null
          created_at?: string | null
          dha?: number | null
          epa?: number | null
          ferro?: number | null
          fibra?: number | null
          fibras?: number | null
          fibras_insoluveis?: number | null
          fibras_soluveis?: number | null
          flavonoides?: number | null
          fosforo?: number | null
          gordura?: number | null
          gordura_insaturada?: number | null
          gordura_saturada?: number | null
          gordura_trans?: number | null
          gorduras?: number | null
          id?: number
          indice_glicemico?: number | null
          indice_saciedade?: number | null
          inositol?: number | null
          kcal?: number | null
          magnesio?: number | null
          manganes?: number | null
          omega_3?: number | null
          omega_6?: number | null
          omega_9?: number | null
          pdcaas?: number | null
          polifenois?: number | null
          potassio?: number | null
          proteina?: number | null
          quercetina?: number | null
          resveratrol?: number | null
          selenio?: number | null
          sodio?: number | null
          sodio_mg?: number | null
          taurina?: number | null
          valor_biologico?: number | null
          vitamina_a?: number | null
          vitamina_b1?: number | null
          vitamina_b12?: number | null
          vitamina_b2?: number | null
          vitamina_b3?: number | null
          vitamina_b5?: number | null
          vitamina_b6?: number | null
          vitamina_b7?: number | null
          vitamina_b9?: number | null
          vitamina_c?: number | null
          vitamina_d?: number | null
          vitamina_e?: number | null
          vitamina_k?: number | null
          zinco?: number | null
        }
        Update: {
          ala?: number | null
          alimento_id?: number | null
          aminoacidos_essenciais?: Json | null
          betaina?: number | null
          calcio?: number | null
          calorias?: number | null
          carboidrato?: number | null
          carboidratos?: number | null
          carga_glicemica?: number | null
          carotenoides?: number | null
          cobre?: number | null
          colina?: number | null
          created_at?: string | null
          dha?: number | null
          epa?: number | null
          ferro?: number | null
          fibra?: number | null
          fibras?: number | null
          fibras_insoluveis?: number | null
          fibras_soluveis?: number | null
          flavonoides?: number | null
          fosforo?: number | null
          gordura?: number | null
          gordura_insaturada?: number | null
          gordura_saturada?: number | null
          gordura_trans?: number | null
          gorduras?: number | null
          id?: number
          indice_glicemico?: number | null
          indice_saciedade?: number | null
          inositol?: number | null
          kcal?: number | null
          magnesio?: number | null
          manganes?: number | null
          omega_3?: number | null
          omega_6?: number | null
          omega_9?: number | null
          pdcaas?: number | null
          polifenois?: number | null
          potassio?: number | null
          proteina?: number | null
          quercetina?: number | null
          resveratrol?: number | null
          selenio?: number | null
          sodio?: number | null
          sodio_mg?: number | null
          taurina?: number | null
          valor_biologico?: number | null
          vitamina_a?: number | null
          vitamina_b1?: number | null
          vitamina_b12?: number | null
          vitamina_b2?: number | null
          vitamina_b3?: number | null
          vitamina_b5?: number | null
          vitamina_b6?: number | null
          vitamina_b7?: number | null
          vitamina_b9?: number | null
          vitamina_c?: number | null
          vitamina_d?: number | null
          vitamina_e?: number | null
          vitamina_k?: number | null
          zinco?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "valores_nutricionais_completos_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      water_tracking: {
        Row: {
          amount_ml: number
          created_at: string | null
          date: string
          id: string
          source: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          date: string
          id?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          date?: string
          id?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_analyses: {
        Row: {
          created_at: string | null
          id: string
          media_imc: number | null
          observacoes: string | null
          peso_final: number | null
          peso_inicial: number | null
          semana_fim: string
          semana_inicio: string
          tendencia: string | null
          user_id: string | null
          variacao_gordura_corporal: number | null
          variacao_massa_muscular: number | null
          variacao_peso: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_imc?: number | null
          observacoes?: string | null
          peso_final?: number | null
          peso_inicial?: number | null
          semana_fim: string
          semana_inicio: string
          tendencia?: string | null
          user_id?: string | null
          variacao_gordura_corporal?: number | null
          variacao_massa_muscular?: number | null
          variacao_peso?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_imc?: number | null
          observacoes?: string | null
          peso_final?: number | null
          peso_inicial?: number | null
          semana_fim?: string
          semana_inicio?: string
          tendencia?: string | null
          user_id?: string | null
          variacao_gordura_corporal?: number | null
          variacao_massa_muscular?: number | null
          variacao_peso?: number | null
        }
        Relationships: []
      }
      weekly_insights: {
        Row: {
          average_energy: number | null
          average_mood: number | null
          average_stress: number | null
          created_at: string | null
          exercise_frequency: number | null
          id: string
          most_common_gratitude: string | null
          sleep_consistency: number | null
          streak_days: number | null
          total_points: number | null
          user_id: string | null
          water_consistency: number | null
          week_start_date: string
        }
        Insert: {
          average_energy?: number | null
          average_mood?: number | null
          average_stress?: number | null
          created_at?: string | null
          exercise_frequency?: number | null
          id?: string
          most_common_gratitude?: string | null
          sleep_consistency?: number | null
          streak_days?: number | null
          total_points?: number | null
          user_id?: string | null
          water_consistency?: number | null
          week_start_date: string
        }
        Update: {
          average_energy?: number | null
          average_mood?: number | null
          average_stress?: number | null
          created_at?: string | null
          exercise_frequency?: number | null
          id?: string
          most_common_gratitude?: string | null
          sleep_consistency?: number | null
          streak_days?: number | null
          total_points?: number | null
          user_id?: string | null
          water_consistency?: number | null
          week_start_date?: string
        }
        Relationships: []
      }
      weighings: {
        Row: {
          basal_metabolism: number | null
          bmi: number | null
          body_fat: number | null
          body_water: number | null
          bone_mass: number | null
          created_at: string
          device_type: string | null
          id: string
          metabolic_age: number | null
          muscle_mass: number | null
          user_id: string
          weight: number
        }
        Insert: {
          basal_metabolism?: number | null
          bmi?: number | null
          body_fat?: number | null
          body_water?: number | null
          bone_mass?: number | null
          created_at?: string
          device_type?: string | null
          id?: string
          metabolic_age?: number | null
          muscle_mass?: number | null
          user_id: string
          weight: number
        }
        Update: {
          basal_metabolism?: number | null
          bmi?: number | null
          body_fat?: number | null
          body_water?: number | null
          bone_mass?: number | null
          created_at?: string
          device_type?: string | null
          id?: string
          metabolic_age?: number | null
          muscle_mass?: number | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      weight_measurements: {
        Row: {
          agua_corporal_percent: number | null
          body_fat_percent: number | null
          bone_mass_kg: number | null
          circunferencia_abdominal_cm: number | null
          circunferencia_braco_cm: number | null
          circunferencia_perna_cm: number | null
          created_at: string | null
          device_type: string | null
          gordura_corporal_percent: number | null
          gordura_visceral: number | null
          id: string
          idade_metabolica: number | null
          imc: number | null
          massa_muscular_kg: number | null
          measurement_date: string | null
          metabolic_age: number | null
          metabolismo_basal_kcal: number | null
          muscle_mass_kg: number | null
          notes: string | null
          osso_kg: number | null
          overall_health_score: number | null
          peso_kg: number
          risco_metabolico: string | null
          user_id: string | null
          visceral_fat_level: number | null
          vitality_score: number | null
          water_percent: number | null
        }
        Insert: {
          agua_corporal_percent?: number | null
          body_fat_percent?: number | null
          bone_mass_kg?: number | null
          circunferencia_abdominal_cm?: number | null
          circunferencia_braco_cm?: number | null
          circunferencia_perna_cm?: number | null
          created_at?: string | null
          device_type?: string | null
          gordura_corporal_percent?: number | null
          gordura_visceral?: number | null
          id?: string
          idade_metabolica?: number | null
          imc?: number | null
          massa_muscular_kg?: number | null
          measurement_date?: string | null
          metabolic_age?: number | null
          metabolismo_basal_kcal?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          osso_kg?: number | null
          overall_health_score?: number | null
          peso_kg: number
          risco_metabolico?: string | null
          user_id?: string | null
          visceral_fat_level?: number | null
          vitality_score?: number | null
          water_percent?: number | null
        }
        Update: {
          agua_corporal_percent?: number | null
          body_fat_percent?: number | null
          bone_mass_kg?: number | null
          circunferencia_abdominal_cm?: number | null
          circunferencia_braco_cm?: number | null
          circunferencia_perna_cm?: number | null
          created_at?: string | null
          device_type?: string | null
          gordura_corporal_percent?: number | null
          gordura_visceral?: number | null
          id?: string
          idade_metabolica?: number | null
          imc?: number | null
          massa_muscular_kg?: number | null
          measurement_date?: string | null
          metabolic_age?: number | null
          metabolismo_basal_kcal?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          osso_kg?: number | null
          overall_health_score?: number | null
          peso_kg?: number
          risco_metabolico?: string | null
          user_id?: string | null
          visceral_fat_level?: number | null
          vitality_score?: number | null
          water_percent?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_user_behavior: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      approve_user_goal: {
        Args: { goal_id: string; admin_notes?: string }
        Returns: Json
      }
      approve_user_session: {
        Args: { user_session_id_param: string; approval_action: string }
        Returns: Json
      }
      assign_session_to_all_users: {
        Args: { session_id_param: string; admin_user_id?: string }
        Returns: Json
      }
      assign_session_to_users: {
        Args: {
          session_id_param: string
          user_ids_param: string[]
          admin_user_id?: string
        }
        Returns: Json
      }
      calculate_daily_tracking_score: {
        Args: { p_user_id: string; p_date: string }
        Returns: number
      }
      calculate_heart_rate_zones: {
        Args: { age: number; resting_hr?: number }
        Returns: Json
      }
      calculate_waist_risk: {
        Args: { waist_cm: number; gender: string }
        Returns: string
      }
      change_user_password: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_old_ai_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_user_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_default_notification_settings: {
        Args: { user_id: string } | { user_id_param: string }
        Returns: undefined
      }
      create_user_profile: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      format_sofia_calories_response: {
        Args: { user_name: string; calories: number; foods: string[] }
        Returns: string
      }
      format_sofia_food_response: {
        Args: {
          detected_foods: string[]
          user_name: string
          estimated_calories?: number
        }
        Returns: string
      }
      generate_smart_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_weighing_report: {
        Args: { measurement_id: string }
        Returns: Json
      }
      get_optimal_notification_time: {
        Args: { user_id_param: string }
        Returns: string
      }
      join_challenge: {
        Args: { user_uuid: string; challenge_uuid: string }
        Returns: Json
      }
      notify_achievement: {
        Args: {
          user_id_param: string
          achievement_name_param: string
          points_param?: number
        }
        Returns: undefined
      }
      recalculate_challenge_ranking: {
        Args: { challenge_id_param: string }
        Returns: undefined
      }
      revert_rls_configuration: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sync_device_data: {
        Args: {
          p_user_id: string
          p_integration_name: string
          p_device_type: string
          p_data: Json
        }
        Returns: number
      }
      update_challenge_progress: {
        Args: { participation_id: string; new_progress: number; notes?: string }
        Returns: Json
      }
      update_challenge_progress_safe: {
        Args: {
          participation_id: string
          new_progress: number
          notes_text?: string
        }
        Returns: Json
      }
      update_goal_progress: {
        Args: { goal_id: string; new_value: number; evidence_url?: string }
        Returns: Json
      }
      update_user_profile_admin: {
        Args: {
          target_user_id: string
          new_full_name?: string
          new_email?: string
          new_role?: string
          new_admin_level?: string
        }
        Returns: Json
      }
      user_has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      user_has_content_access: {
        Args: {
          user_uuid: string
          content_type_param: string
          content_id_param: string
        }
        Returns: boolean
      }
      verify_and_restore_ai_config: {
        Args: { func_name: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
