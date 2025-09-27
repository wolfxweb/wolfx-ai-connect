-- Script para criar sistema de comentários com moderação
-- Execute no Supabase SQL Editor

-- 1. Criar tabela de comentários
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- 3. Habilitar RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
-- Política para SELECT: todos podem ver comentários aprovados
CREATE POLICY "Anyone can view approved comments" ON public.comments
    FOR SELECT 
    USING (status = 'approved');

-- Política para INSERT: usuários autenticados podem comentar
CREATE POLICY "Authenticated users can insert comments" ON public.comments
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

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

-- 5. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON public.comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Criar função para aprovar comentário
CREATE OR REPLACE FUNCTION approve_comment(comment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.comments 
    SET 
        status = 'approved',
        approved_at = NOW(),
        approved_by = auth.uid()
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar função para rejeitar comentário
CREATE OR REPLACE FUNCTION reject_comment(comment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.comments 
    SET status = 'rejected'
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar função para marcar como spam
CREATE OR REPLACE FUNCTION mark_comment_as_spam(comment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.comments 
    SET status = 'spam'
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Verificar se tudo foi criado corretamente
SELECT 
    'comments' as table_name,
    COUNT(*) as row_count
FROM public.comments;

-- Verificar políticas
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'comments' 
    AND schemaname = 'public'
ORDER BY policyname;
