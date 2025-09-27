-- Script para verificar permissões de atualização na tabela blog_posts
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela blog_posts existe e tem as colunas corretas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar as políticas RLS para a tabela blog_posts
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'blog_posts' 
    AND schemaname = 'public';

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'blog_posts' 
    AND schemaname = 'public';

-- 4. Testar uma atualização simples (substitua o ID por um ID real)
-- SELECT id, title, updated_at FROM public.blog_posts LIMIT 1;

-- 5. Verificar se o usuário atual tem permissões
SELECT current_user, session_user;

-- 6. Verificar se há triggers na tabela
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'blog_posts' 
    AND event_object_schema = 'public';
