-- Configuração de Autenticação para WolfX AI Connect
-- Execute este SQL no Supabase para habilitar email signups

-- 1. Habilitar registro por email
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_signup = true,
  enable_email_confirm = false,  -- Desabilita confirmação de email para desenvolvimento
  enable_phone_signup = false
WHERE id = 'default';

-- 2. Configurar URLs de redirecionamento
UPDATE auth.config 
SET 
  site_url = 'http://localhost:8080',
  additional_redirect_urls = '["http://localhost:8080/auth/callback"]'
WHERE id = 'default';

-- 3. Configurar políticas de senha
UPDATE auth.config 
SET 
  password_min_length = 8,
  password_require_uppercase = true,
  password_require_lowercase = true,
  password_require_numbers = true,
  password_require_symbols = false
WHERE id = 'default';

-- 4. Configurar templates de email (opcional)
-- Você pode personalizar estes templates no painel do Supabase

-- 5. Verificar configurações atuais
SELECT 
  enable_signup,
  enable_email_signup,
  enable_email_confirm,
  site_url,
  password_min_length
FROM auth.config 
WHERE id = 'default';

-- 6. Se necessário, criar um usuário admin manualmente
-- Descomente e ajuste o email abaixo:
/*
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  confirmed_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@wolfx.com.br',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin WolfX"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE
);

-- Criar perfil para o usuário admin
INSERT INTO profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'name',
  'admin'
FROM auth.users u 
WHERE u.email = 'admin@wolfx.com.br';
*/

-- 7. Verificar se as configurações foram aplicadas
SELECT 
  'Configuração de Autenticação' as config_type,
  enable_signup as signup_enabled,
  enable_email_signup as email_signup_enabled,
  enable_email_confirm as email_confirm_enabled,
  site_url,
  password_min_length
FROM auth.config 
WHERE id = 'default';

