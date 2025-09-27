# Configuração de Email Signups no Supabase

## ❌ Problema: "Email signups are disabled"

Este erro ocorre quando o registro por email está desabilitado no painel do Supabase.

## ✅ Solução 1: Habilitar Email Signups no Supabase

### Passo 1: Acessar Configurações de Autenticação
1. Acesse o painel do Supabase: https://supabase.wolfx.com.br
2. Vá para **Authentication** no menu lateral
3. Clique em **Settings** ou **Configurações**

### Passo 2: Habilitar Email Signups
1. Na seção **"Auth Providers"** ou **"Provedores de Autenticação"**
2. Encontre **"Email"** ou **"Email Provider"**
3. Ative a opção **"Enable email signups"** ou **"Habilitar registro por email"**
4. Clique em **Save** ou **Salvar**

### Passo 3: Configurar Email Templates (Opcional)
1. Na seção **"Email Templates"** ou **"Modelos de Email"**
2. Configure os templates de:
   - Confirmação de email
   - Reset de senha
   - Mudança de email

### Passo 4: Configurar SMTP (Opcional)
Para emails customizados:
1. Na seção **"SMTP Settings"**
2. Configure seu provedor SMTP
3. Ou use o SMTP padrão do Supabase (limitado)

## ✅ Solução 2: Verificar Configurações de Domínio

### Passo 1: Verificar Site URL
1. Em **Authentication > Settings**
2. Verifique se **"Site URL"** está configurado como:
   - `http://localhost:8080` (para desenvolvimento)
   - `https://seudominio.com` (para produção)

### Passo 2: Verificar Redirect URLs
1. Em **"Redirect URLs"**
2. Adicione as URLs permitidas:
   - `http://localhost:8080`
   - `http://localhost:8080/auth/callback`
   - `https://seudominio.com/auth/callback`

## ✅ Solução 3: Testar Configuração

### Passo 1: Verificar Status
1. No painel do Supabase, vá para **Authentication > Users**
2. Tente criar um usuário manualmente
3. Verifique se recebe o email de confirmação

### Passo 2: Testar no Frontend
1. Acesse http://localhost:8080/register
2. Tente criar uma conta
3. Verifique se não há mais o erro "Email signups are disabled"

## 🔧 Configurações Avançadas

### Habilitar Confirmação de Email
```sql
-- No SQL Editor do Supabase
UPDATE auth.config 
SET email_confirm = true 
WHERE id = 'default';
```

### Configurar Políticas de Senha
1. Em **Authentication > Settings**
2. Configure **"Password Requirements"**:
   - Tamanho mínimo: 8 caracteres
   - Requer maiúscula: true
   - Requer minúscula: true
   - Requer número: true

## 🚨 Troubleshooting

### Erro: "Invalid login credentials"
- Verifique se o email está confirmado
- Confirme se a senha está correta
- Verifique se o usuário existe na tabela `auth.users`

### Erro: "Email not confirmed"
- Verifique se o email de confirmação foi enviado
- Confirme se o usuário clicou no link de confirmação
- Verifique a pasta de spam

### Erro: "User already registered"
- O usuário já existe
- Use a opção "Esqueci minha senha" se necessário

## 📧 Templates de Email Customizados

### Template de Confirmação
```html
<h2>Confirme seu email</h2>
<p>Olá {{ .Email }}!</p>
<p>Clique no link abaixo para confirmar sua conta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>Se você não criou esta conta, ignore este email.</p>
```

### Template de Reset de Senha
```html
<h2>Redefinir senha</h2>
<p>Olá {{ .Email }}!</p>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Se você não solicitou isso, ignore este email.</p>
```

## 🔄 Alternativa: Desabilitar Confirmação de Email

Se você quiser permitir login sem confirmação de email:

```sql
-- Desabilitar confirmação de email
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 'default';
```

## 📞 Suporte

Se o problema persistir:
1. Verifique os logs do Supabase
2. Consulte a documentação oficial
3. Entre em contato com o suporte do Supabase

---

**Nota**: Após fazer essas configurações, reinicie a aplicação para que as mudanças tenham efeito.
