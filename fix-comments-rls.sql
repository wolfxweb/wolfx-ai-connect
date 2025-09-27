-- Script para corrigir políticas RLS da tabela comments
-- Execute no Supabase SQL Editor

-- 1. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can moderate comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Enable read access for approved comments" ON public.comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.comments;

-- 2. Desabilitar RLS temporariamente para teste
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- 3. Testar inserção sem RLS
INSERT INTO public.comments (
    post_id,
    author_name,
    author_email,
    content,
    status
) VALUES (
    '5f2ce936-043c-4720-a527-93e15aa129a5',
    'Teste RLS',
    'teste@rls.com',
    'Teste sem RLS',
    'pending'
) RETURNING id, status;

-- 4. Verificar se foi inserido
SELECT id, author_name, content, status, created_at 
FROM public.comments 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Reabilitar RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas muito permissivas para teste
CREATE POLICY "Allow all operations for authenticated users" ON public.comments
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 7. Verificar políticas criadas
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'comments' 
    AND schemaname = 'public'
ORDER BY policyname;
