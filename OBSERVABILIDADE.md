# Observabilidade do Sangue Doce

Este documento é o nosso roteiro para construir a observabilidade do Sangue Doce aos poucos, com calma e com intenção. A ideia não é jogar um monte de ferramenta no projeto de uma vez; é criar uma base boa para responder quatro perguntas simples:

| Pergunta | Resposta técnica |
| --- | --- |
| O sistema está vivo? | Health checks |
| O sistema está ficando lento ou instável? | Métricas |
| O que aconteceu antes do erro? | Logs |
| Onde a requisição ou job ficou lento? | Traces |

Minha recomendação para o Sangue Doce:

```txt
NestJS
  |-- Logs JSON com Pino
  |-- Correlation ID
  |-- Health checks
  |-- Métricas HTTP
  |-- Métricas BullMQ
  `-- Traces com OpenTelemetry, depois
        |
        v
Grafana Alloy / Prometheus
        |
  +-----+------+
  v            v
Loki      Prometheus
  \            /
   \          /
    v        v
      Grafana

Fase 2:
NestJS + OpenTelemetry -> Tempo -> Grafana
```

## Decisão

Vamos com Grafana Stack:

| Necessidade | Ferramenta |
| --- | --- |
| Dashboards | Grafana |
| Logs | Loki |
| Métricas | Prometheus |
| Coleta de logs | Grafana Alloy |
| Traces | Tempo |
| Instrumentação | OpenTelemetry |
| Logs no NestJS | Pino |
| Health checks | NestJS Terminus |
| Alertas | Grafana Alerting |

Por que não Elastic agora:

- Elasticsearch costuma consumir mais memória e disco.
- Para uma VPS/projeto pessoal, Grafana + Loki + Prometheus é mais leve.
- Loki combina bem com logs JSON em stdout.
- Prometheus é excelente para métricas.
- Tempo pode entrar depois, sem apressar a arquitetura.
- OpenTelemetry evita prender o projeto em um fornecedor específico.

## Princípio da Jornada

A ordem importa. Primeiro fazemos o backend falar melhor. Depois colocamos ferramentas para ouvir.

Não vamos começar por Grafana bonito. Vamos começar por eventos confiáveis.

## Status Inicial do Projeto

O backend atual já tem alguns pontos que ajudam:

- NestJS em `back-sangue-doce`.
- Prisma/PostgreSQL.
- Redis e BullMQ.
- MinIO.
- `HealthModule` simples com `GET /health`.
- `@shared/logger`, ainda baseado no `Logger` padrão do NestJS.
- Docker Compose com serviços de infraestrutura.

Isso significa que a primeira fase deve mexer principalmente no backend.

## Roadmap Curto

| Fase | Entrega | Resultado |
| --- | --- | --- |
| 1 | Pino + logs JSON | Logs estruturados e seguros |
| 2 | Request ID | Requisições rastreáveis |
| 3 | Health checks reais | `/health/live` e `/health/ready` |
| 4 | Métricas Prometheus | `/metrics` com API, Node e negócio |
| 5 | BullMQ observável | Jobs com logs e métricas |
| 6 | Grafana + Prometheus | Primeiro dashboard da API |
| 7 | Loki + Alloy | Logs pesquisáveis no Grafana |
| 8 | Alertas essenciais | Avisos antes do problema virar incêndio |
| 9 | OpenTelemetry + Tempo | Traces distribuídos |

## Fase 1 - Logs JSON com Pino

Objetivo: substituir o logger simples por logs JSON, com campos padronizados e redação de dados sensíveis.

Instalar:

```bash
cd back-sangue-doce
yarn add nestjs-pino pino-http
```

Arquivos prováveis:

- `src/@shared/logger/logger.module.ts`
- `src/@shared/logger/app-logger.provider.ts`
- `src/app.module.ts`
- `src/main.ts`

Estrutura sugerida:

```txt
src/@shared/logger/
  app-logger.provider.ts
  logger.module.ts
  logger.types.ts
  index.ts
```

Configuração base:

```ts
import { Module } from "@nestjs/common";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? "info",
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "req.body.password",
            "req.body.token",
            "res.headers.set-cookie",
          ],
          censor: "[REDACTED]",
        },
        customProps: () => ({
          service: "sangue-doce-api",
          environment: process.env.NODE_ENV ?? "development",
        }),
        serializers: {
          req(request) {
            return {
              id: request.id,
              method: request.method,
              url: request.url,
            };
          },
          res(response) {
            return {
              statusCode: response.statusCode,
            };
          },
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
```

No `main.ts`, iniciar com buffer de logs:

```ts
import { Logger } from "nestjs-pino";

const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});

app.useLogger(app.get(Logger));
```

Campos que queremos ver nos logs:

| Campo | Uso |
| --- | --- |
| `service` | Nome do serviço, exemplo `sangue-doce-api` |
| `environment` | `development`, `staging`, `production` |
| `requestId` | Identificador da requisição |
| `method` | Método HTTP |
| `route` | Rota normalizada |
| `statusCode` | Status HTTP |
| `responseTime` | Tempo da resposta |
| `event` | Nome do evento interno |
| `jobId` | ID do job BullMQ |
| `queue` | Nome da fila |
| `error.name` | Tipo do erro |
| `error.message` | Mensagem segura do erro |

Não registrar:

- Senha.
- Access token.
- Refresh token.
- Cookie.
- Dados clínicos.
- Glicemia.
- Diagnóstico.
- Medicação.
- Corpo completo de formulários.
- E-mail ou telefone quando não forem indispensáveis.

Critério de pronto:

- `yarn start:dev` sobe sem erro.
- Logs aparecem em JSON.
- Requisições HTTP geram log com método, rota, status e tempo.
- Tokens e cookies aparecem como `[REDACTED]`.

Quando me chamar:

- Depois do primeiro log JSON aparecer.
- Se algum provider antigo de logger brigar com o Pino.
- Antes de substituir todos os `new Logger(...)` espalhados pelo código.

## Fase 2 - Correlation ID

Objetivo: cada requisição precisa carregar um identificador. Isso permite seguir o fluxo inteiro:

```txt
Usuário cria uma publicação
  -> API recebe a requisição
  -> PostgreSQL salva os dados
  -> BullMQ agenda o job
  -> Worker gera imagem/texto
  -> MinIO recebe arquivo
  -> PostgreSQL atualiza status
```

Criar middleware:

```ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const incomingRequestId = request.header("x-request-id");
    const requestId =
      incomingRequestId && incomingRequestId.length <= 100
        ? incomingRequestId
        : randomUUID();

    request.headers["x-request-id"] = requestId;
    response.setHeader("x-request-id", requestId);

    next();
  }
}
```

Arquivos prováveis:

- `src/@shared/http/request-id.middleware.ts`
- `src/app.module.ts`

Aplicar no `AppModule`:

```ts
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
```

Critério de pronto:

- Toda resposta HTTP tem header `x-request-id`.
- Se o cliente enviar `x-request-id`, a API reaproveita.
- Se não enviar, a API gera um UUID.
- O ID aparece nos logs.

Teste manual:

```bash
curl -i http://localhost:3000/health
curl -i -H "x-request-id: teste-123" http://localhost:3000/health
```

## Fase 3 - Health Checks Reais

Objetivo: separar processo vivo de aplicação pronta.

Endpoints:

| Endpoint | Significado |
| --- | --- |
| `GET /health/live` | O processo NestJS está vivo |
| `GET /health/ready` | A API consegue atender tráfego real |
| `GET /health` | Pode continuar existindo como compatibilidade |

Instalar:

```bash
cd back-sangue-doce
yarn add @nestjs/terminus
```

O `live` deve ser simples:

- Processo respondeu.
- Heap de memória dentro do limite.

O `ready` deve verificar pelo menos:

- PostgreSQL.
- Redis.
- MinIO.

Arquivos prováveis:

- `src/health/health.controller.ts`
- `src/health/health.service.ts`
- `src/health/health.module.ts`

Resposta esperada:

```json
{
  "status": "ok",
  "info": {
    "memory_heap": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "memory_heap": {
      "status": "up"
    }
  }
}
```

Critério de pronto:

- `/health/live` responde mesmo se Redis cair.
- `/health/ready` falha se PostgreSQL ou Redis estiverem indisponíveis.
- Docker Compose pode usar `/health/ready` para checar a API.

Quando me chamar:

- Quando formos decidir a melhor forma de testar MinIO.
- Quando o Terminus precisar conversar com Prisma/Redis de um jeito mais limpo.

## Fase 4 - Métricas Prometheus

Objetivo: expor `GET /metrics` para o Prometheus raspar dados da API.

Instalar:

```bash
cd back-sangue-doce
yarn add prom-client
```

Métricas técnicas iniciais:

- `sangue_doce_http_requests_total`
- `sangue_doce_http_request_duration_seconds`
- `sangue_doce_http_errors_total`
- `sangue_doce_nodejs_heap_size_used_bytes`
- `sangue_doce_process_cpu_seconds_total`
- `sangue_doce_process_resident_memory_bytes`

Métricas de negócio iniciais:

- `sangue_doce_posts_published_total`
- `sangue_doce_posts_draft_total`
- `sangue_doce_images_generated_total`
- `sangue_doce_images_failed_total`
- `sangue_doce_newsletter_subscribers_total`
- `sangue_doce_social_posts_completed_total`
- `sangue_doce_social_posts_failed_total`

Exemplo de registry:

```ts
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "prom-client";

export const registry = new Registry();

collectDefaultMetrics({
  register: registry,
  prefix: "sangue_doce_",
});

export const httpRequestsTotal = new Counter({
  name: "sangue_doce_http_requests_total",
  help: "Quantidade total de requisições HTTP",
  labelNames: ["method", "route", "status_code"],
  registers: [registry],
});

export const httpRequestDuration = new Histogram({
  name: "sangue_doce_http_request_duration_seconds",
  help: "Duração das requisições HTTP em segundos",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry],
});
```

Nunca colocar como label:

- `userId`
- `email`
- `requestId`
- URL completa com parâmetros
- Título do post
- Mensagem de erro completa

Motivo: labels com alta cardinalidade fazem o Prometheus crescer rápido e podem derrubar a observabilidade.

Critério de pronto:

- `GET /metrics` responde em formato Prometheus.
- A rota `/metrics` é pública ou protegida por rede interna.
- As métricas HTTP usam rota normalizada, não URL crua.
- Requisições 4xx e 5xx aparecem nos contadores.

Teste manual:

```bash
curl http://localhost:3000/metrics | head
```

## Fase 5 - BullMQ Observável

Objetivo: enxergar o ciclo completo dos jobs.

Filas importantes no projeto:

- Newsletter.
- Count carb.
- Post banner.
- Social publications.

Eventos que devem virar logs:

```ts
worker.on("active", (job) => {
  logger.info({
    event: "job_started",
    queue: job.queueName,
    jobId: job.id,
    jobName: job.name,
  });
});

worker.on("completed", (job) => {
  logger.info({
    event: "job_completed",
    queue: job.queueName,
    jobId: job.id,
    jobName: job.name,
  });
});

worker.on("failed", (job, error) => {
  logger.error({
    event: "job_failed",
    queue: job?.queueName,
    jobId: job?.id,
    jobName: job?.name,
    error: {
      name: error.name,
      message: error.message,
    },
  });
});
```

Métricas BullMQ:

- `sangue_doce_bullmq_jobs_completed_total`
- `sangue_doce_bullmq_jobs_failed_total`
- `sangue_doce_bullmq_jobs_active`
- `sangue_doce_bullmq_jobs_waiting`
- `sangue_doce_bullmq_job_duration_seconds`

Critério de pronto:

- Todo job importante registra início, sucesso e falha.
- Falhas mostram `jobId`, `queue`, `jobName` e erro seguro.
- Existe pelo menos uma métrica por fila.
- Jobs parados ou falhando ficam visíveis.

## Fase 6 - Prometheus e Grafana

Objetivo: subir a primeira stack de visualização.

Stack inicial:

```yaml
services:
  prometheus:
  grafana:
```

Depois adicionamos:

```yaml
services:
  loki:
  alloy:
  tempo:
  node-exporter:
  cadvisor:
  postgres-exporter:
  redis-exporter:
```

Primeiro dashboard da API:

- Status da API.
- Requisições por minuto.
- Taxa de erro.
- Tempo médio de resposta.
- P95 de resposta.
- CPU do processo.
- Memória do processo.
- Disponibilidade do PostgreSQL.
- Disponibilidade do Redis.

Critério de pronto:

- Prometheus consegue raspar `back-sangue-doce`.
- Grafana usa Prometheus como data source.
- Dashboard mostra dados reais após chamadas na API.

## Fase 7 - Loki e Grafana Alloy

Objetivo: coletar logs JSON do container e pesquisar no Grafana.

Fluxo:

```txt
Container NestJS escreve JSON em stdout
             |
             v
       Grafana Alloy
             |
             v
            Loki
             |
             v
          Grafana
```

Consultas iniciais no Grafana:

```logql
{service="sangue-doce-api", environment="production"}
```

Somente erros:

```logql
{service="sangue-doce-api", environment="production"}
| json
| level >= 50
```

Jobs que falharam:

```logql
{service="sangue-doce-worker"}
| json
| event="job_failed"
```

Critério de pronto:

- Logs da API aparecem no Grafana.
- Dá para filtrar por `service`, `environment`, `event` e `requestId`.
- Um erro 500 gerado de propósito aparece no Loki.

## Fase 8 - Alertas Essenciais

Objetivo: alertar apenas o que pede ação.

Alertas iniciais:

- API fora do ar por mais de 2 minutos.
- Taxa de erro 5xx acima de 5%.
- P95 acima de 2 segundos por 5 minutos.
- Disco acima de 85%.
- Memória acima de 90%.
- PostgreSQL indisponível.
- Redis indisponível.
- Mais de 5 jobs falhos em 10 minutos.
- Fila com jobs aguardando sem processamento.
- Container reiniciando repetidamente.

Canais possíveis:

- E-mail.
- Telegram.
- Discord.
- Slack.

Critério de pronto:

- Um alerta de teste chega no canal escolhido.
- Alertas têm nome claro, severidade e ação sugerida.
- Não existe alerta barulhento para comportamento normal.

## Fase 9 - OpenTelemetry e Tempo

Objetivo: enxergar traces quando logs e métricas já estiverem maduros.

Não vamos fazer isso primeiro.

Exemplo de trace que queremos ver na API:

```txt
POST /posts
  |-- AuthGuard                         3 ms
  |-- PostsService.create               8 ms
  |-- PostgreSQL INSERT                12 ms
  |-- BullMQ add                        5 ms
  `-- HTTP response                     2 ms
```

Exemplo no worker:

```txt
process-social-publication
  |-- PostgreSQL SELECT                 5 ms
  |-- LLM text generation            1800 ms
  |-- LLM image generation           4200 ms
  |-- Sharp WebP                      230 ms
  |-- MinIO upload                    180 ms
  `-- PostgreSQL UPDATE                 9 ms
```

Critério de pronto:

- Tempo recebe traces.
- Grafana mostra uma requisição ponta a ponta.
- Logs carregam `traceId`.
- Erros em traces apontam para logs relacionados.

## Dashboards Finais

Eu criaria quatro dashboards.

### 1. Visão Geral

- Status da API.
- Requisições por minuto.
- Taxa de erros.
- P95 de resposta.
- CPU.
- Memória.
- PostgreSQL.
- Redis.
- MinIO.

### 2. API NestJS

- Requisições por endpoint.
- Status HTTP.
- Endpoints mais lentos.
- Erros 4xx.
- Erros 5xx.
- Exceções por tipo.
- Consultas lentas, quando tivermos essa métrica.

### 3. BullMQ

- Jobs aguardando.
- Jobs ativos.
- Jobs concluídos.
- Jobs com falha.
- Tempo médio por job.
- Retries.
- Últimas falhas.
- Filas paradas.

### 4. Infraestrutura

- CPU da VPS.
- Memória disponível.
- Espaço em disco.
- Uso dos containers.
- Reinicializações.
- PostgreSQL.
- Redis.
- MinIO.
- Nginx.

## Checklist de Execução

Vamos seguir assim:

- [ ] Instalar `nestjs-pino` e `pino-http`.
- [ ] Adaptar `@shared/logger` para usar Pino.
- [ ] Configurar `bufferLogs` no `main.ts`.
- [ ] Adicionar redação de dados sensíveis.
- [ ] Criar `RequestIdMiddleware`.
- [ ] Garantir `x-request-id` na resposta.
- [ ] Fazer logs carregarem `requestId`.
- [ ] Instalar `@nestjs/terminus`.
- [ ] Separar `/health/live` e `/health/ready`.
- [ ] Verificar PostgreSQL no readiness.
- [ ] Verificar Redis no readiness.
- [ ] Verificar MinIO no readiness.
- [ ] Instalar `prom-client`.
- [ ] Criar `MetricsModule`.
- [ ] Criar `GET /metrics`.
- [ ] Medir requisições HTTP.
- [ ] Medir erros HTTP.
- [ ] Medir jobs BullMQ.
- [ ] Subir Prometheus.
- [ ] Subir Grafana.
- [ ] Criar dashboard da API.
- [ ] Subir Loki.
- [ ] Subir Grafana Alloy.
- [ ] Ver logs no Grafana.
- [ ] Criar alertas essenciais.
- [ ] Adicionar OpenTelemetry.
- [ ] Subir Tempo.
- [ ] Correlacionar logs, métricas e traces.

## Primeiro Passo Real

Começar por aqui:

```bash
cd back-sangue-doce
yarn add nestjs-pino pino-http
```

Depois disso, a primeira implementação deve mexer em:

- `src/@shared/logger/logger.module.ts`
- `src/@shared/logger/app-logger.provider.ts`
- `src/main.ts`

Meta do primeiro PR/commit:

```txt
feat(observability): add structured json logging
```

Definição de sucesso do primeiro passo:

- A API sobe.
- O terminal mostra logs JSON.
- `GET /health` gera um log estruturado.
- Campos sensíveis são mascarados.
- O código antigo continua usando `AppLogger` sem quebrar.

## Combinado

Você vai construir. Eu vou ser teu par nessa jornada.

Quando terminar cada fase, me chama com algo tipo:

```txt
chat, terminei a fase 1, revisa comigo?
```

Aí eu reviso o diff, rodo os testes que fizerem sentido, aponto riscos e te ajudo a decidir o próximo passo. Sem pressa e sem pular base importante.
