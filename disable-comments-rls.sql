-- Script para desabilitar RLS na tabela comments (solução mais simples)
-- Execute no Supabase SQL Editor

-- 1. Remover todas as políticas
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can moderate comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Enable read access for approved comments" ON public.comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.comments;

-- 2. Desabilitar RLS completamente
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'comments' 
    AND schemaname = 'public';

-- 4. Testar inserção
INSERT INTO public.comments (
    post_id,
    author_name,
    author_email,
    content,
    status
) VALUES (
    '5f2ce936-043c-4720-a527-93e15aa129a5',
    'Teste Sem RLS',
    'teste@semrls.com',
    'Comentário de teste sem RLS',
    'pending'
) RETURNING id, status, created_at;

-- 5. Verificar comentários existentes
SELECT id, author_name, content, status, created_at 
FROM public.comments 
ORDER BY created_at DESC 
LIMIT 5;
