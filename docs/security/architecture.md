# Arquitetura auditada

## Escopo

- Backend: `back-sangue-doce`, NestJS, Prisma, BullMQ/Redis, JWT e armazenamento S3/MinIO.
- Frontend: `front-sangue-doce`, Next.js, com rotas server-side que encaminham o cookie `sangue_doce_token` ao backend.

## Limites de confiança

- Entradas externas chegam por endpoints HTTP, uploads multipart, parâmetros de rota/query e corpos JSON.
- O backend aplica `AuthGuard` globalmente, exceto rotas marcadas com `@Public()`.
- Operações administrativas usam `RolesGuard` com `Role.ADMIN`.
- O frontend mantém o JWT em cookie `httpOnly` e faz chamadas server-side ao backend.

## Superfícies prioritárias

- Autenticação e autorização: `back-sangue-doce/src/@infra/guard`, `src/auth`.
- Processamento assíncrono: `src/foods/foods.controller.ts`, `src/foods/foods.service.ts`, `src/foods/foods-images.queue.ts`.
- Uploads: `src/uploads`, `src/foods/food-images.controller.ts`.
- Rotas administrativas do Next.js: `front-sangue-doce/src/app/api/admin`.

## Limitações

A auditoria foi estática, com validação dos fluxos diretamente no código. Não foram executados serviços, banco, Redis ou provedores externos; portanto, impactos dependentes de credenciais ou infraestrutura foram classificados com essa condição explícita.
