-- Script para corrigir políticas RLS da tabela comments
-- Execute no Supabase SQL Editor

-- 1. Verificar políticas atuais
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

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can moderate comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;

-- 3. Criar políticas mais simples e permissivas para teste

-- Política para SELECT (todos podem ler comentários aprovados)
CREATE POLICY "Enable read access for approved comments" ON public.comments
    FOR SELECT 
    USING (status = 'approved');

-- Política para INSERT (usuários autenticados podem inserir)
CREATE POLICY "Enable insert for authenticated users only" ON public.comments
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE (usuários autenticados podem atualizar - para admins)
CREATE POLICY "Enable update for authenticated users only" ON public.comments
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para DELETE (usuários autenticados podem deletar - para admins)
CREATE POLICY "Enable delete for authenticated users only" ON public.comments
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 4. Verificar se as novas políticas foram criadas
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

-- 5. Testar inserção de comentário
-- Substitua os valores pelos dados reais
INSERT INTO public.comments (
    post_id,
    author_name,
    author_email,
    content,
    status
) VALUES (
    '5f2ce936-043c-4720-a527-93e15aa129a5', -- ID do post de teste
    'Teste Usuário',
    'teste@exemplo.com',
    'Este é um comentário de teste',
    'pending'
) RETURNING id, status;

-- 6. Verificar se o comentário foi inserido
SELECT id, author_name, content, status, created_at 
FROM public.comments 
ORDER BY created_at DESC 
LIMIT 5;
