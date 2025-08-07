-- Remover todas as API keys inseguras do banco de dados
DELETE FROM ai_configurations WHERE api_key IS NOT NULL AND api_key != '';

-- Limpar coluna api_key de todas as configurações
UPDATE ai_configurations SET api_key = NULL;