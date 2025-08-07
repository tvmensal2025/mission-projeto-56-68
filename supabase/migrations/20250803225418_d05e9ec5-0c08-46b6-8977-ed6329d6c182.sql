-- 4. CORRIGIR E RECRIAR POLÍTICAS RLS ESSENCIAIS
-- Remover políticas antigas que podem estar quebradas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Everyone can view active sessions" ON public.sessions;

-- Recriar políticas RLS corretas para PROFILES
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Recriar políticas RLS corretas para USER_SESSIONS
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user sessions" ON public.user_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Recriar políticas RLS corretas para SESSIONS
CREATE POLICY "Everyone can view active sessions" ON public.sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sessions" ON public.sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 5. CORRIGIR POLÍTICAS PARA COURSES E MÓDULOS
DROP POLICY IF EXISTS "Everyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view course modules" ON public.course_modules;
DROP POLICY IF EXISTS "Everyone can view lessons" ON public.lessons;

CREATE POLICY "Everyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view course modules" ON public.course_modules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage course modules" ON public.course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view lessons" ON public.lessons
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- 6. VERIFICAÇÃO FINAL - Status do sistema restaurado
SELECT 
  'SISTEMA RESTAURADO!' as status,
  (SELECT COUNT(*) FROM public.profiles) as profiles_criados,
  (SELECT COUNT(*) FROM public.user_sessions) as sessoes_atribuidas,
  (SELECT COUNT(*) FROM public.sessions WHERE is_active = true) as sessoes_ativas,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admins_criados;