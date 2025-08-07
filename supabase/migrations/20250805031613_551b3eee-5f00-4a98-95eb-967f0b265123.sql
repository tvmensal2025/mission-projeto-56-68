-- Criar bucket para chat-images se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso para chat-images
CREATE POLICY "Usuários podem fazer upload de suas próprias imagens" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Imagens de chat são publicamente visíveis" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-images');

CREATE POLICY "Usuários podem atualizar suas próprias imagens" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar suas próprias imagens" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);