# 📊 Dashboard WhatsApp - Sistema de Gerenciamento de Leads

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)

**Dashboard moderno e completo para gerenciamento de leads do WhatsApp com interface intuitiva e recursos avançados**

[Features](#-features) • [Instalação](#-instalação) • [Configuração](#-configuração) • [Uso](#-como-usar)

</div>

---

## 📋 Sobre o Projeto

O **Dashboard WhatsApp** é uma aplicação web moderna desenvolvida para acompanhar e gerenciar leads gerados através de automações do WhatsApp. Com interface elegante e responsiva, o sistema oferece uma visão completa do desempenho dos leads, permitindo monitoramento em tempo real, análise de métricas e controle total sobre as conversas.

### 🎯 Principais Objetivos

- ✅ Visualizar métricas importantes de leads
- ✅ Gerenciar conversas e status de clientes
- ✅ Acompanhar taxas de conversão
- ✅ Controlar follow-ups e interesses
- ✅ Interface moderna e intuitiva

---

## ✨ Features

### 📈 Dashboard de Métricas
- **Total de Leads**: Visualização do número total de contatos
- **Leads Interessados**: Quantidade de leads que responderam positivamente
- **Taxa de Conversão**: Percentual calculado automaticamente
- **Novos Leads (7 dias)**: Leads cadastrados na última semana
- **Conversas Travadas**: Controle de conversas pausadas

### 📋 Tabela de Clientes
- Listagem completa de todos os clientes
- Filtro por Follow Up
- Paginação eficiente (20 itens por página)
- Ações rápidas:
  - Abrir conversa no WhatsApp
  - Travar/Destravar conversas
- Badges visuais para status e interesse
- Informações detalhadas: nome, telefone, produto de interesse

### 🎨 Interface Moderna
- Design responsivo (mobile-first)
- Tema dark/light
- Animações suaves e transições
- Loading states elegantes
- Feedback visual em todas as ações
- Cores alinhadas com identidade do WhatsApp

### 🔐 Autenticação e Segurança
- Sistema de login seguro com Supabase Auth
- Proteção de rotas com middleware
- Row Level Security (RLS) configurado
- Sessão persistente

---

## 🛠️ Stack Tecnológico

### Frontend
- **[Next.js 15.5.4](https://nextjs.org/)** - Framework React com SSR/SSG
- **[React 19.1.1](https://react.dev/)** - Biblioteca UI
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS 4.1.9](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
- **[Lucide React](https://lucide.dev/)** - Ícones modernos
- **[Geist Font](https://vercel.com/font)** - Tipografia otimizada

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security

### Desenvolvimento
- **[ESLint](https://eslint.org/)** - Linting
- **[PostCSS](https://postcss.org/)** - Processamento CSS
- **Zod** - Validação de schemas

---

## 📦 Pré-requisitos

Antes de começar, você precisará ter instalado:

- **[Node.js](https://nodejs.org/)** (versão 18 ou superior)
- **[npm](https://www.npmjs.com/)** ou **[yarn](https://yarnpkg.com/)** ou **[pnpm](https://pnpm.io/)**
- Conta no **[Supabase](https://supabase.com/)** (gratuita)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/leads-dashboard-main.git
cd leads-dashboard-main
```

### 2. Instale as dependências

```bash
npm install --legacy-peer-deps
```

> **Nota**: Use `--legacy-peer-deps` caso encontre conflitos de dependências com React 19.

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Nome do Dashboard
NEXT_PUBLIC_DASHBOARD_NAME="Nome do seu painel"

# Nome da tabela no Supabase
NEXT_PUBLIC_TABLE_NAME=clientes

# Credenciais do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 4. Execute o projeto em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## ⚙️ Configuração

### Configuração do Supabase

#### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha as informações do projeto e aguarde a criação

#### 2. Obter Credenciais

1. No dashboard do projeto, vá em **Settings** → **API**
2. Copie a **Project URL** e cole em `NEXT_PUBLIC_SUPABASE_URL`
3. Copie a **anon public** key e cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3. Criar a Tabela `clientes`

No SQL Editor do Supabase, execute o seguinte script:

```sql
-- Criar tabela de clientes
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  nome TEXT,
  telefone TEXT,
  trava BOOLEAN DEFAULT false,
  follow_up INTEGER DEFAULT 0,
  interessado BOOLEAN DEFAULT false,
  last_followup TIMESTAMP WITH TIME ZONE,
  produto_interesse TEXT,
  followup_status TEXT DEFAULT 'pendente'
);

-- Habilitar Row Level Security
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Política de leitura para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados"
  ON clientes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política de atualização para usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados"
  ON clientes FOR UPDATE
  USING (auth.role() = 'authenticated');
```

#### 4. Configurar Autenticação

1. No Supabase, vá em **Authentication** → **Providers**
2. Configure o provider de Email (já vem habilitado)
3. Crie um usuário em **Authentication** → **Users** → **Add user**

---

## 📁 Estrutura do Projeto

```
leads-dashboard-main/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Página do dashboard
│   │   └── page.tsx
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout raiz
│   └── page.tsx             # Página de login
├── components/              # Componentes React
│   ├── dashboard-header.tsx # Cabeçalho do dashboard
│   ├── dashboard-metrics.tsx # Cards de métricas
│   ├── leads-table.tsx      # Tabela de leads
│   ├── login-form.tsx       # Formulário de login
│   └── ui/                  # Componentes UI (shadcn/ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
├── lib/                     # Utilitários e configurações
│   ├── supabase.ts         # Cliente Supabase (browser)
│   ├── supabase-server.ts  # Cliente Supabase (server)
│   └── utils.ts            # Funções utilitárias
├── hooks/                   # React Hooks customizados
│   └── use-toast.ts
├── public/                  # Arquivos estáticos
├── middleware.ts            # Middleware de autenticação
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎮 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (porta 3000)

# Produção
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção

# Qualidade
npm run lint         # Executa ESLint
```

---

## 💡 Como Usar

### Login

1. Acesse a página inicial (`/`)
2. Informe seu email e senha cadastrados no Supabase
3. Clique em "Entrar"

### Dashboard

Após o login, você será redirecionado para o dashboard que exibe:

- **Cards de Métricas**: Visão geral dos principais indicadores
- **Tabela de Clientes**: Lista completa com todas as informações

### Ações Disponíveis

#### Na Tabela de Clientes:

- **📱 Abrir WhatsApp**: Clique no ícone de mensagem para abrir a conversa
- **🔒 Travar/Destravar**: Controle se a automação deve continuar ou pausar
- **🔍 Filtrar**: Use o botão "Follow Up" para filtrar apenas leads com follow-up > 1

---

## 🔧 Resolução de Problemas

### Erro: "Your project's URL and Key are required"

**Solução**: Verifique se o arquivo `.env.local` existe e está preenchido corretamente.

### Erro: "Erro ao buscar clientes"

Possíveis causas:

1. **Tabela não existe**: Execute o script SQL no Supabase
2. **Nome da tabela incorreto**: Verifique se `NEXT_PUBLIC_TABLE_NAME` corresponde ao nome da tabela
3. **RLS bloqueando**: Verifique se as políticas RLS estão configuradas corretamente
4. **Não autenticado**: Certifique-se de estar logado

### Erro de dependências no `npm install`

```bash
npm install --legacy-peer-deps
```

### Porta 3000 já em uso

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

- 📧 Email: [seu-email@exemplo.com](mailto:seu-email@exemplo.com)
- 💬 Issues: [GitHub Issues](https://github.com/seu-usuario/leads-dashboard-main/issues)

---

## 🙏 Agradecimentos

- [Comunidade Automate](https://www.instagram.com/sujeitoprogramador/) - Inspiração inicial
- [Next.js](https://nextjs.org/) - Framework incrível
- [Supabase](https://supabase.com/) - Backend simplificado
- [shadcn/ui](https://ui.shadcn.com/) - Componentes acessíveis

---

<div align="center">

**Desenvolvido com ❤️ usando Next.js e Supabase**

[⬆ Voltar ao topo](#-dashboard-whatsapp---sistema-de-gerenciamento-de-leads)

</div>
