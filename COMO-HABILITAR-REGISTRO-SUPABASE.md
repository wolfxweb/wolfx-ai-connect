# 🔧 Como Habilitar Registro por Email no Supabase

## 📋 Problema

Quando você tenta se registrar, aparece a mensagem:
> "Registro temporariamente indisponível. Execute o script fix-email-signup.sql no Supabase ou tente novamente em alguns minutos."

Isso acontece porque o registro por email está desabilitado no Supabase.

## 🚀 Solução

### Passo 1: Executar o Script SQL

1. **Acesse o Supabase Dashboard:**
   - URL: `https://supabase.wolfx.com.br`
   - Ou acesse via: `https://app.supabase.com` e selecione seu projeto

2. **Vá para o SQL Editor:**
   - Menu lateral → **SQL Editor**
   - Ou acesse diretamente: `https://supabase.wolfx.com.br/project/_/sql`

3. **Execute o script:**
   - Abra o arquivo `fix-email-signup.sql`
   - Cole o conteúdo no SQL Editor
   - Clique em **Run** (ou pressione `Ctrl+Enter`)

4. **Verifique se foi executado com sucesso:**
   - Você deve ver mensagens de sucesso
   - Verifique se não há erros

### Passo 2: Configurar no Dashboard (IMPORTANTE)

Além de executar o script SQL, você **DEVE** configurar as opções no Dashboard:

1. **Acesse Authentication > Settings:**
   - Menu lateral → **Authentication** → **Settings**

2. **Configure "Email Auth":**
   - ✅ **Enable Email Signup** - DEVE estar **ATIVADO**
   - ✅ **Enable Email Confirmations** - Configure conforme necessário
   - ✅ **Enable Email Change** - Configure conforme necessário

3. **Configure "Auth Providers":**
   - ✅ **Email** - DEVE estar **ATIVADO**

4. **Configure "URL Configuration":**
   - **Site URL:** `https://wolfx.com.br` (ou seu domínio de produção)
   - **Redirect URLs:** Adicione as URLs permitidas:
     - `https://wolfx.com.br/**`
     - `http://localhost:8080/**` (para desenvolvimento)
     - `http://localhost:5173/**` (para desenvolvimento Vite)

### Passo 3: Verificar Configurações

1. **Verifique se a tabela `profiles` existe:**
   ```sql
   SELECT * FROM public.profiles LIMIT 1;
   ```

2. **Verifique se as políticas RLS estão corretas:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Verifique se o trigger está criado:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

## 🔍 Verificação Rápida

### Teste 1: Verificar se o registro está habilitado

1. Acesse: `https://supabase.wolfx.com.br/project/_/auth/settings`
2. Verifique se **"Enable Email Signup"** está **ATIVADO**
3. Se não estiver, ative e salve

### Teste 2: Testar o registro

1. Acesse: `https://wolfx.com.br/register`
2. Tente criar uma conta
3. Se ainda der erro, verifique os logs do Supabase

## 🐛 Troubleshooting

### Problema: "Email signups are disabled"

**Solução:**
1. Acesse o Dashboard do Supabase
2. Vá em **Authentication > Settings**
3. Ative **"Enable Email Signup"**
4. Salve as alterações

### Problema: "User already registered"

**Solução:**
- Este erro é normal se o email já estiver cadastrado
- Tente fazer login em vez de registrar

### Problema: "Trigger não está funcionando"

**Solução:**
1. Verifique se o trigger foi criado:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Se não existir, execute novamente o script SQL
3. Verifique se a função `handle_new_user()` existe:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

### Problema: "RLS está bloqueando"

**Solução:**
1. Verifique se as políticas RLS estão corretas:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
2. Verifique se a política "Anyone can create profile" existe
3. Se não existir, execute novamente o script SQL

## 📝 Script SQL Completo

O script `fix-email-signup.sql` contém:

1. ✅ Criação da tabela `profiles` (se não existir)
2. ✅ Configuração de Row Level Security (RLS)
3. ✅ Criação de políticas RLS
4. ✅ Criação de função para criar perfil automaticamente
5. ✅ Criação de trigger para criar perfil ao registrar
6. ✅ Criação de índices para performance
7. ✅ Documentação e comentários

## 🔗 Links Úteis

- **Supabase Dashboard:** `https://supabase.wolfx.com.br`
- **SQL Editor:** `https://supabase.wolfx.com.br/project/_/sql`
- **Auth Settings:** `https://supabase.wolfx.com.br/project/_/auth/settings`
- **Documentação Supabase Auth:** https://supabase.com/docs/guides/auth

## ✅ Checklist

- [ ] Script SQL executado com sucesso
- [ ] Tabela `profiles` criada
- [ ] Políticas RLS configuradas
- [ ] Trigger criado
- [ ] "Enable Email Signup" ativado no Dashboard
- [ ] "Email" provider ativado no Dashboard
- [ ] Site URL configurado
- [ ] Redirect URLs configuradas
- [ ] Teste de registro funcionando

## 🎯 Próximos Passos

Após executar o script e configurar o Dashboard:

1. **Teste o registro:**
   - Acesse `https://wolfx.com.br/register`
   - Crie uma conta de teste
   - Verifique se o perfil foi criado automaticamente

2. **Verifique o perfil:**
   ```sql
   SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 1;
   ```

3. **Torne um usuário admin (opcional):**
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'seu-email@exemplo.com';
   ```

---

**Última atualização:** 2025-01-12

