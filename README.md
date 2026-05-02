# Gestao-Socios

Este repositório contém um protótipo inicial de uma aplicação de gestão de sócios para browser e telemóvel.

## Como iniciar

1. Instale dependências:

```bash
npm install
```

2. Crie a base de dados e gere o cliente Prisma:

```bash
npx prisma db push
```

3. Execute o seed para criar um administrador de exemplo:

```bash
npm run seed
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Abra `http://localhost:3000` no browser.

## Conta de administrador padrão

- Email: `admin@gestao-socios.local`
- Senha: `admin123`

## Próximos passos

- Adicionar formulários de criação e edição de sócios
- Implementar roles e permissões completas
- Adicionar gestão de pagamentos com filtros por ano
