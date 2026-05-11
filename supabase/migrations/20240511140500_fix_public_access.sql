-- Ajustar política de perfis para permitir visualização pública de nomes e usernames
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Garantir que repertórios públicos sejam visíveis para todos
DROP POLICY IF EXISTS "Users can view their own repertoires or public ones" ON public.repertoires;
CREATE POLICY "Public repertoires are viewable by everyone" ON public.repertoires
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);
