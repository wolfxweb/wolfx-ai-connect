# WolfX AI Connect - Sistema Completo com Supabase

Sistema completo de autenticação, painel administrativo e blog integrado com Supabase.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação Completa
- Login e registro de usuários
- Proteção de rotas
- Gerenciamento de sessão
- Sistema de roles (admin/user)
- Interface moderna e responsiva

### ✅ Painel Administrativo
- Dashboard com estatísticas
- CRUD completo de categorias
- CRUD completo de posts do blog
- Gerenciamento de usuários
- Interface intuitiva com tabs

### ✅ Sistema de Blog
- Listagem pública de posts
- Página individual de posts
- Sistema de busca e filtros
- Posts relacionados
- Compartilhamento de posts
- Categorização

### ✅ Infraestrutura
- Containerização com Docker
- Integração com Supabase
- Row Level Security (RLS)
- Políticas de acesso
- Hot-reload para desenvolvimento

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Containerização**: Docker + Docker Compose
- **Roteamento**: React Router DOM
- **Gerenciamento de Estado**: React Context

## 📋 Pré-requisitos

- Docker e Docker Compose
- Conta no Supabase
- Node.js 18+ (para desenvolvimento local)

## 🚀 Instalação e Configuração

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://supabase.wolfx.com.br
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.Mr2Z9_cUmM-LjhY5SvArT_78TPPiUh_hGITfq94KGbs

# Development
NODE_ENV=development
```

### 2. Configurar Banco de Dados

1. Acesse o painel do Supabase: https://supabase.wolfx.com.br
2. Vá para "SQL Editor"
3. Execute o conteúdo do arquivo `supabase-setup.sql`

### 3. Tornar um Usuário Admin

Após criar sua conta:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

### 4. Iniciar a Aplicação

```bash
# Desenvolvimento
docker-compose --profile dev up --build

# Produção
docker-compose --profile prod up --build

# Testar build local
npm run build
docker-compose --profile local up --build
```

## 🌐 URLs de Acesso

- **Aplicação**: http://localhost:8080
- **Login**: http://localhost:8080/login
- **Registro**: http://localhost:8080/register
- **Painel Admin**: http://localhost:8080/admin
- **Blog**: http://localhost:8080/blog

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

1. **profiles** - Perfis dos usuários
2. **categories** - Categorias do blog
3. **blog_posts** - Posts do blog

### Relacionamentos

- `profiles` ← `auth.users` (1:1)
- `categories` ← `profiles` (N:1)
- `blog_posts` ← `categories` (N:1)
- `blog_posts` ← `profiles` (N:1)

## 🔐 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Políticas de acesso** configuradas
- **Validação de permissões** no frontend e backend
- **Tokens JWT** do Supabase para autenticação

## 📱 Responsividade

- Design totalmente responsivo
- Navegação mobile otimizada
- Interface adaptativa para todos os dispositivos

## 🎨 Interface

- Design moderno com Tailwind CSS
- Componentes reutilizáveis com Shadcn/ui
- Tema consistente em toda aplicação
- Animações e transições suaves

## 🔧 Comandos Úteis

```bash
# Parar containers
docker-compose down

# Limpar containers
docker-compose down -v
docker system prune -f

# Ver logs
docker-compose logs -f

# Entrar no container
docker-compose exec wolfx-ai-connect-dev sh

# Rebuild completo
docker-compose build --no-cache
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── admin/           # Componentes do painel admin
│   └── ui/             # Componentes UI reutilizáveis
├── contexts/
│   └── AuthContext.tsx # Contexto de autenticação
├── hooks/              # Custom hooks
├── lib/
│   └── supabase.ts     # Configuração do Supabase
├── pages/              # Páginas da aplicação
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Admin.tsx
│   ├── Blog.tsx
│   └── BlogPost.tsx
└── App.tsx             # Componente principal
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com Supabase**
   - Verifique as variáveis de ambiente
   - Confirme se o projeto existe no Supabase

2. **Usuário não consegue acessar admin**
   - Execute: `UPDATE profiles SET role = 'admin' WHERE email = 'seu-email';`

3. **Posts não aparecem**
   - Verifique se o status está como 'published'
   - Confirme as políticas RLS

4. **Container não inicia**
   - Limpe containers antigos: `docker container prune -f`
   - Rebuild: `docker-compose build --no-cache`

## 📈 Próximos Passos

- [ ] Sistema de comentários nos posts
- [ ] Upload de imagens
- [ ] Sistema de notificações
- [ ] Analytics de posts
- [ ] SEO otimizado
- [ ] PWA (Progressive Web App)

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do React](https://react.dev)
- [Documentação do Docker](https://docs.docker.com)

---

**Desenvolvido com ❤️ para WolfX AI Connect**