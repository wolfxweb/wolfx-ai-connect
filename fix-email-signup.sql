-- =====================================================
-- Script para habilitar registro por email no Supabase
-- =====================================================
-- 
-- Este script deve ser executado no SQL Editor do Supabase
-- para habilitar o registro de usuários por email.
--
-- Como usar:
-- 1. Acesse o Supabase Dashboard: https://supabase.wolfx.com.br
-- 2. Vá em SQL Editor
-- 3. Cole este script
-- 4. Execute o script
--
-- =====================================================

-- 1. Habilitar registro por email no Auth
-- Isso pode ser feito via Dashboard, mas aqui está a configuração SQL
-- Nota: A configuração de Auth normalmente é feita via Dashboard ou API
-- Este script configura as políticas e triggers necessários

-- 2. Verificar se a tabela profiles existe e criar se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar Row Level Security (RLS) na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS para a tabela profiles
-- Política: Usuários podem ler seus próprios perfis
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política: Usuários podem atualizar seus próprios perfis
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Política: Qualquer pessoa pode criar um perfil (durante o registro)
DROP POLICY IF EXISTS "Anyone can create profile" ON public.profiles;
CREATE POLICY "Anyone can create profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- Política: Admins podem ler todos os perfis
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política: Admins podem atualizar todos os perfis
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Criar função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        'user',
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar trigger para criar perfil quando um usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 9. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);

-- 10. Comentários para documentação
COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN public.profiles.name IS 'Nome do usuário';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário';
COMMENT ON COLUMN public.profiles.role IS 'Papel do usuário: user, admin, moderator';
COMMENT ON COLUMN public.profiles.status IS 'Status do usuário: active, inactive, suspended, pending';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data de última atualização do perfil';

-- =====================================================
-- IMPORTANTE: Configurações no Dashboard
-- =====================================================
--
-- Além de executar este script SQL, você precisa configurar
-- as seguintes opções no Dashboard do Supabase:
--
-- 1. Acesse: Authentication > Settings
-- 2. Em "Email Auth", certifique-se de que:
--    - "Enable Email Signup" está ATIVADO
--    - "Enable Email Confirmations" está configurado conforme necessário
--    - "Enable Email Change" está configurado conforme necessário
--
-- 3. Em "Auth Providers", certifique-se de que:
--    - "Email" está ATIVADO
--
-- 4. Em "URL Configuration", configure:
--    - Site URL: https://wolfx.com.br (ou seu domínio)
--    - Redirect URLs: Adicione as URLs permitidas
--
-- =====================================================

-- Verificar se tudo está configurado corretamente
DO $$
BEGIN
    RAISE NOTICE 'Script executado com sucesso!';
    RAISE NOTICE 'Verifique se as configurações de Auth no Dashboard estão corretas.';
    RAISE NOTICE 'Especificamente, verifique se "Enable Email Signup" está ATIVADO.';
END $$;

