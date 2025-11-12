# Migração do Supabase para IndexedDB Local

## Resumo da Migração

Esta migração substitui o Supabase por um banco de dados local usando IndexedDB (via Dexie.js). Todos os dados são armazenados localmente no navegador.

## O que foi feito

### 1. Substituição de Dependências
- **Removido**: `@supabase/supabase-js`, `@supabase/auth-ui-react`, `@supabase/auth-ui-shared`
- **Adicionado**: `dexie`, `dexie-react-hooks`

### 2. Estrutura Criada

#### `src/lib/database.ts`
- Banco de dados IndexedDB usando Dexie.js
- Tabelas criadas:
  - `profiles`: Usuários (admin, user, moderator)
  - `categories`: Categorias do blog
  - `blog_posts`: Posts do blog
  - `comments`: Comentários dos posts
- Inicialização automática com dados padrão:
  - Admin padrão: `admin@wolfx.com.br` / `admin123`
  - Categorias: Tecnologia, Inteligência Artificial, Automação
  - 2 posts de exemplo publicados

#### `src/lib/auth.ts`
- Sistema de autenticação local
- Hash de senha usando SHA-256 (Web Crypto API)
- Sessões armazenadas no localStorage
- Validação de senha (mínimo 8 caracteres)
- Verificação de email único

#### `src/lib/supabase.ts`
- Wrapper compatível com a API do Supabase
- Mantém compatibilidade com código existente
- Usa IndexedDB internamente
- Suporta operações: `select`, `insert`, `update`, `delete`, `eq`, `neq`, `in`, `ilike`, `or`, `order`, `limit`, `range`, `single`

#### `src/contexts/AuthContext.tsx`
- Atualizado para usar autenticação local
- Mantém a mesma interface para componentes
- Suporta `signUp`, `signIn`, `signOut`
- Gerencia perfil de usuário e permissões

## Dados Iniciais

### Admin Padrão
- **Email**: `admin@wolfx.com.br`
- **Senha**: `admin123`
- **Role**: `admin`
- **Status**: `active`

⚠️ **IMPORTANTE**: Altere a senha padrão após o primeiro login!

### Categorias Padrão
1. **Tecnologia**: Artigos sobre tecnologia
2. **Inteligência Artificial**: Artigos sobre IA
3. **Automação**: Artigos sobre automação de processos

### Posts de Exemplo
1. **Bem-vindo ao Blog da Wolfx**: Post de boas-vindas
2. **Como a IA está Transformando os Negócios**: Post sobre IA

## Como Usar

### Login
1. Acesse a página de login
2. Use o email e senha do admin padrão ou crie uma nova conta
3. Após o login, você será redirecionado para a página inicial

### Criar Nova Conta
1. Acesse a página de registro
2. Preencha email, senha (mínimo 8 caracteres) e nome (opcional)
3. Após o registro, você será logado automaticamente

### Gerenciar Blog
1. Faça login como admin
2. Acesse o painel admin (`/admin`)
3. Gerencie posts, categorias, comentários e usuários

## Limitações

### Dados Locais
- Todos os dados são armazenados localmente no navegador
- Dados não são sincronizados entre dispositivos
- Dados são perdidos se o navegador for limpo
- Não há backup automático

### Autenticação
- Hash de senha usando SHA-256 (não é o mais seguro, mas funciona localmente)
- Sessões armazenadas no localStorage
- Não há recuperação de senha
- Não há verificação de email

### Performance
- IndexedDB é mais rápido que Supabase para dados locais
- Não há latência de rede
- Limitado pelo armazenamento do navegador (~50MB-1GB dependendo do navegador)

## Compatibilidade

### Componentes Compatíveis
Todos os componentes que usam `supabase` devem continuar funcionando:
- `Blog.tsx`
- `BlogPost.tsx`
- `PostEditor.tsx`
- `BlogManagement.tsx`
- `CategoryManagement.tsx`
- `CommentModeration.tsx`
- `UserManagement.tsx`
- `Comments.tsx`

### API Compatível
O wrapper `supabase.ts` mantém a mesma interface:
- `supabase.from(table).select(fields)`
- `supabase.from(table).insert(values)`
- `supabase.from(table).update(values).eq(field, value)`
- `supabase.from(table).delete().eq(field, value)`
- `supabase.auth.signUp()`
- `supabase.auth.signInWithPassword()`
- `supabase.auth.signOut()`
- `supabase.auth.getSession()`
- `supabase.auth.onAuthStateChange()`

## Próximos Passos

1. **Testar Funcionalidades**
   - Login/Registro
   - Criação/Edição de Posts
   - Criação/Edição de Categorias
   - Criação/Moderação de Comentários
   - Gerenciamento de Usuários

2. **Melhorias Futuras**
   - Exportar/Importar dados
   - Backup automático
   - Sincronização entre dispositivos (opcional)
   - Recuperação de senha
   - Verificação de email
   - Hash de senha mais seguro (bcrypt)

3. **Remover Dependências**
   - Remover arquivos relacionados ao Supabase
   - Limpar código não utilizado
   - Atualizar documentação

## Troubleshooting

### Problema: Dados não aparecem
- Verifique se o banco de dados foi inicializado
- Abra o console do navegador e verifique erros
- Limpe o cache do navegador e recarregue a página

### Problema: Login não funciona
- Verifique se o email e senha estão corretos
- Verifique se o banco de dados foi inicializado
- Verifique se há erros no console

### Problema: Posts não aparecem
- Verifique se os posts estão com status `published`
- Verifique se as categorias existem
- Verifique se o autor existe

### Problema: Comentários não aparecem
- Verifique se os comentários estão com status `approved`
- Verifique se o post existe
- Verifique se o autor existe

## Suporte

Para problemas ou dúvidas, verifique:
1. Console do navegador (F12)
2. Logs do banco de dados
3. Documentação do Dexie.js
4. Código fonte em `src/lib/database.ts`, `src/lib/auth.ts`, `src/lib/supabase.ts`

