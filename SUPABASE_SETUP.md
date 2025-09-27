# Configuração do Supabase - WolfX AI Connect

## 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://supabase.wolfx.com.br
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.Mr2Z9_cUmM-LjhY5SvArT_78TPPiUh_hGITfq94KGbs

# Development
NODE_ENV=development
```

## 2. Configurar Banco de Dados

### Passo 1: Acessar o Supabase
1. Acesse o painel do Supabase: https://supabase.wolfx.com.br
2. Faça login com suas credenciais
3. Navegue até o projeto "site"

### Passo 2: Executar o SQL de Setup
1. No painel do Supabase, vá para "SQL Editor"
2. Clique em "New Query"
3. Copie e cole o conteúdo do arquivo `supabase-setup.sql`
4. Execute o script (botão "Run")

### Passo 3: Verificar as Tabelas
Após executar o SQL, você deve ter as seguintes tabelas criadas:
- `profiles` - Perfis dos usuários
- `categories` - Categorias do blog
- `blog_posts` - Posts do blog

## 3. Configurar o Primeiro Usuário Admin

Após criar sua conta no sistema:

1. Acesse a tabela `profiles` no Supabase
2. Encontre seu usuário pelo email
3. Altere o campo `role` de `user` para `admin`

Ou execute este SQL (substitua pelo seu email):
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

## 4. Estrutura das Tabelas

### profiles
- `id` (UUID, PK) - Referência ao auth.users
- `email` (TEXT) - Email do usuário
- `name` (TEXT) - Nome do usuário
- `role` (TEXT) - 'admin' ou 'user'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### categories
- `id` (UUID, PK)
- `name` (TEXT) - Nome da categoria
- `slug` (TEXT) - Slug para URL
- `description` (TEXT) - Descrição opcional
- `created_by` (UUID, FK) - Usuário que criou
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### blog_posts
- `id` (UUID, PK)
- `title` (TEXT) - Título do post
- `slug` (TEXT) - Slug para URL
- `content` (TEXT) - Conteúdo do post
- `excerpt` (TEXT) - Resumo opcional
- `featured_image` (TEXT) - URL da imagem destaque
- `status` (TEXT) - 'draft', 'published', 'archived'
- `category_id` (UUID, FK) - Categoria do post
- `author_id` (UUID, FK) - Autor do post
- `tags` (TEXT[]) - Array de tags
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `published_at` (TIMESTAMP) - Data de publicação

## 5. Funcionalidades Implementadas

### Autenticação
- ✅ Login/Registro com Supabase Auth
- ✅ Proteção de rotas
- ✅ Gerenciamento de sessão
- ✅ Roles (admin/user)

### Painel Administrativo
- ✅ Dashboard com estatísticas
- ✅ CRUD de categorias
- ✅ CRUD de posts do blog
- ✅ Gerenciamento de usuários

### Blog Público
- ✅ Listagem de posts publicados
- ✅ Página individual de post
- ✅ Sistema de busca e filtros
- ✅ Posts relacionados
- ✅ Compartilhamento

### Segurança
- ✅ Row Level Security (RLS)
- ✅ Políticas de acesso
- ✅ Validação de permissões

## 6. Comandos Úteis

### Iniciar aplicação em desenvolvimento:
```bash
docker-compose --profile dev up --build
```

### Acessar aplicação:
- Frontend: http://localhost:8080
- Login: http://localhost:8080/login
- Registro: http://localhost:8080/register
- Admin: http://localhost:8080/admin (apenas para admins)
- Blog: http://localhost:8080/blog

## 7. Troubleshooting

### Problemas comuns:

1. **Erro de conexão com Supabase**
   - Verifique se as variáveis de ambiente estão corretas
   - Confirme se o projeto existe no Supabase

2. **Usuário não consegue acessar admin**
   - Verifique se o role está definido como 'admin' na tabela profiles
   - Confirme se o usuário está logado

3. **Posts não aparecem**
   - Verifique se o status está como 'published'
   - Confirme se as políticas RLS estão configuradas

4. **Erro ao criar categorias/posts**
   - Verifique se o usuário está autenticado
   - Confirme se as foreign keys estão corretas

