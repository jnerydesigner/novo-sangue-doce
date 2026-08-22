# Relatório de auditoria de segurança

## Resumo executivo

Foi confirmado um problema: um endpoint não autenticado que enfileirava o processamento de imagens de todos os alimentos, permitindo abuso de recursos por qualquer usuário da internet. O endpoint foi corrigido para exigir perfil administrativo.

## Achados

| Severidade | Achado | Impacto |
|---|---|---|
| HIGH → corrigido | Endpoint público dispara processamento global de imagens | Enfileiramento repetido de jobs, consumo de Redis/workers e custos de processamento |

## HIGH — Endpoint público de processamento global

Arquivo: `back-sangue-doce/src/foods/foods.controller.ts:39-42`.

`POST /foods/images/process-all` não possui `@UseGuards(AuthGuard)` nem `@Roles(Role.ADMIN)`. O método chama `queueImagesForAllFoods()`, que lista todos os alimentos e cria um job por registro (`foods.service.ts:47-50`). Um atacante não autenticado pode repetir a requisição e multiplicar o trabalho dos workers, degradando a fila e causando indisponibilidade ou custo operacional.

Correção: proteger a rota com autenticação e autorização administrativa; adicionalmente, aplicar deduplicação, cooldown e limite de jobs para impedir abuso por chamadas repetidas.

## Notas de hardening

- `app.enableCors({ origin: "*" })` deve ser restringido aos domínios necessários, especialmente se a API for consumida por browsers.
- Adicionar rate limiting aos endpoints de login, código por e-mail, uploads e operações que enfileiram jobs.
- Adicionar validação de tipo/magic bytes para uploads, além do limite de tamanho.
- Remover logs de diagnóstico e garantir que tokens e segredos nunca sejam incluídos em logs.

## Padrões positivos

- O backend usa `AuthGuard` global e separa autorização por papéis.
- Rotas administrativas em grande parte usam `RolesGuard` com `Role.ADMIN`.
- O cookie de autenticação do frontend é `httpOnly` e usa `SameSite=Lax`.
- O endpoint de análise de imagem possui limite explícito de tamanho.
