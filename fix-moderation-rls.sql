-- Script para corrigir políticas RLS para moderação de comentários
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

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can moderate comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;

-- 3. Criar políticas corretas para moderação

-- Política para SELECT: todos podem ver comentários aprovados, admins podem ver todos
CREATE POLICY "Anyone can view approved comments, admins can view all" ON public.comments
    FOR SELECT 
    USING (
        status = 'approved' OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para INSERT: qualquer pessoa pode inserir
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

-- 4. Verificar políticas criadas
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

-- 5. Testar busca como admin
SELECT id, author_name, author_email, content, status, created_at 
FROM public.comments 
ORDER BY created_at DESC 
LIMIT 5;
