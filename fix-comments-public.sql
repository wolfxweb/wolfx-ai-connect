-- Script para permitir comentários de usuários não logados
-- Execute no Supabase SQL Editor

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can moderate comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Enable read access for approved comments" ON public.comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.comments;

-- 2. Criar políticas que permitem comentários de qualquer pessoa

-- Política para SELECT: todos podem ver comentários aprovados
CREATE POLICY "Anyone can view approved comments" ON public.comments
    FOR SELECT 
    USING (status = 'approved');

-- Política para INSERT: qualquer pessoa pode inserir comentários
CREATE POLICY "Anyone can insert comments" ON public.comments
    FOR INSERT 
    WITH CHECK (true);

-- Política para UPDATE: apenas admins podem moderar
CREATE POLICY "Admins can moderate comments" ON public.comments
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para DELETE: apenas admins podem deletar
CREATE POLICY "Admins can delete comments" ON public.comments
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 3. Verificar políticas criadas
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

-- 4. Testar inserção sem autenticação (simulação)
INSERT INTO public.comments (
    post_id,
    author_name,
    author_email,
    content,
    status
) VALUES (
    '5f2ce936-043c-4720-a527-93e15aa129a5',
    'Visitante Anônimo',
    'visitante@exemplo.com',
    'Comentário de visitante não logado',
    'pending'
) RETURNING id, status, created_at;

-- 5. Verificar comentários
SELECT id, author_name, author_email, content, status, created_at 
FROM public.comments 
ORDER BY created_at DESC 
LIMIT 5;
