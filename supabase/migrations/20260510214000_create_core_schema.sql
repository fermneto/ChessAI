-- 1. Criar tipos enumerados (Enums)
DO $$ BEGIN
    CREATE TYPE public.chess_color AS ENUM ('white', 'black');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.session_type AS ENUM ('drill', 'exploration', 'analysis');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Criar tabelas principais
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    username TEXT UNIQUE,
    chess_rating INTEGER,
    preferred_color public.chess_color,
    skill_level public.skill_level DEFAULT 'beginner',
    subscription_tier public.subscription_tier DEFAULT 'free'
);

CREATE TABLE IF NOT EXISTS public.repertoires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color public.chess_color NOT NULL,
    opening_name TEXT,
    eco_code TEXT,
    total_study_time INTEGER DEFAULT 0 NOT NULL,
    total_moves_studied INTEGER DEFAULT 0 NOT NULL,
    moves JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_public BOOLEAN DEFAULT false NOT NULL,
    tags TEXT[] DEFAULT '{}'::text[] NOT NULL
);

CREATE TABLE IF NOT EXISTS public.training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    repertoire_id UUID REFERENCES public.repertoires(id) ON DELETE SET NULL,
    duration_seconds INTEGER NOT NULL,
    moves_played INTEGER NOT NULL,
    correct_moves INTEGER NOT NULL,
    session_type public.session_type NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE DEFAULT CURRENT_DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Segurança (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repertoires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

-- 4. Criar Políticas de RLS
-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Repertoires
CREATE POLICY "Users can view their own repertoires or public ones" ON public.repertoires FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert their own repertoires" ON public.repertoires FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own repertoires" ON public.repertoires FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own repertoires" ON public.repertoires FOR DELETE USING (auth.uid() = user_id);

-- Training Sessions
CREATE POLICY "Users can view their own training sessions" ON public.training_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own training sessions" ON public.training_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Tips
CREATE POLICY "Anyone can view daily tips" ON public.daily_tips FOR SELECT USING (true);

-- 5. Funções e Gatilhos de Automação
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
