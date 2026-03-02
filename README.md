# TrainUp — Plataforma de Treinamentos Gamificados

Plataforma gamificada para treinamentos corporativos obrigatórios.

## Tecnologias

- **Next.js 16** — App Router, TypeScript, Tailwind CSS v4
- **Prisma** — ORM para MySQL
- **jose** — JWT (access tokens)
- **bcryptjs** — hash de senhas

## Estrutura de Pastas

```
src/
  app/
    (auth)/          → páginas públicas (login, register)
    (app)/           → páginas protegidas (dashboard)
    api/auth/        → rotas de autenticação
  components/        → componentes reutilizáveis
  lib/               → utilitários (auth, prisma)
  middleware.ts      → proteção de rotas
```

## Como Rodar

```bash
# instalar dependências
npm install

# copiar variáveis de ambiente
cp .env.example .env

# criar banco de dados (precisa do MySQL rodando)
npx prisma migrate dev --name init

# rodar em desenvolvimento
npm run dev
```

## Autenticação

- **Access Token**: JWT com validade de 15 minutos (cookie httpOnly)
- **Refresh Token**: token aleatório com validade de 7 dias (salvo no banco)
