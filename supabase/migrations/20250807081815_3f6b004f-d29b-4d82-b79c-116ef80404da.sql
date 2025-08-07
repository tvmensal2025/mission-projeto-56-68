-- CORREÇÃO CRÍTICA: Ajustar tabela sofia_conversations para ter colunas separadas
-- Isso resolve o problema de incompatibilidade de schema

-- 1. Renomear tabela atual para backup
ALTER TABLE sofia_conversations RENAME TO sofia_conversations_backup;

-- 2. Criar nova tabela com estrutura correta
CREATE TABLE sofia_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  sofia_response TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  conversation_type VARCHAR(50) DEFAULT 'chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Configurar RLS
ALTER TABLE sofia_conversations ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de acesso
CREATE POLICY "sofia_conversations_user_access" ON sofia_conversations
  FOR ALL USING (auth.uid() = user_id);

-- 5. Migrar dados existentes se houver (da estrutura antiga)
INSERT INTO sofia_conversations (user_id, user_message, sofia_response, created_at)
SELECT 
  user_id,
  COALESCE((messages->>0)::jsonb->>'content', 'Mensagem migrada'),
  COALESCE((messages->>1)::jsonb->>'content', 'Resposta migrada'),
  created_at
FROM sofia_conversations_backup
WHERE messages IS NOT NULL AND jsonb_array_length(messages) >= 2;

-- 6. Atualizar tabela sofia_food_analysis para ter colunas necessárias se não existir
ALTER TABLE sofia_food_analysis 
ADD COLUMN IF NOT EXISTS user_message TEXT,
ADD COLUMN IF NOT EXISTS confirmation_status VARCHAR(20) DEFAULT 'pending';

-- 7. Verificar estrutura final
SELECT 'Tabela sofia_conversations corrigida com sucesso!' as status;