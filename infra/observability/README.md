# Observabilidade local

Esta stack sobe Grafana, Loki, Grafana Alloy e Prometheus sem acoplar esses serviços ao compose principal.

## Direção

- O backend expõe métricas em `GET /metrics`.
- O Prometheus busca essas métricas.
- O backend escreve logs JSON em stdout.
- O Grafana Alloy lê os logs dos containers via Docker socket.
- Em desenvolvimento local, o Alloy também pode ler `./logs/observability/backend.log`.
- O Alloy envia os logs para o Loki.
- O Grafana consulta Prometheus e Loki.

## Como subir

```bash
docker compose -f docker-compose.observability.yaml up -d
```

Depois abra:

- Grafana: `http://localhost:3001`
- Prometheus: `http://localhost:9090`
- Loki: `http://localhost:3100`
- Alloy: `http://localhost:12345`

Credenciais padrão do Grafana:

- Usuário: `admin`
- Senha: `admin`

## Dashboards por pasta local

O Grafana carrega dashboards JSON da pasta:

```txt
infra/observability/grafana/dashboards
```

Essa pasta é montada no container como:

```txt
/var/lib/grafana/dashboards
```

O provider fica em:

```txt
infra/observability/grafana/provisioning/dashboards/dashboards.yaml
```

Para transformar um dashboard criado pela UI em arquivo versionado:

1. Abra o dashboard no Grafana.
2. Use `Share` ou `Export`.
3. Exporte como JSON.
4. Salve o arquivo em:

```txt
infra/observability/grafana/dashboards/sangue-doce-api-local.json
```

5. Reinicie o Grafana ou espere o provider reler a pasta.

```bash
docker compose -f docker-compose.observability.yaml restart grafana
```

No Portainer, basta levar essa mesma pasta junto com o compose.

## Primeiro teste

Com o backend rodando na porta `3011`, verifique se as métricas existem:

```bash
curl http://localhost:3011/metrics
```

Depois verifique no Prometheus:

```txt
up{job="sangue-doce-api"}
```

Para logs no Grafana, use a fonte Loki e comece com:

```logql
{stack="sangue-doce"}
```

Quando os logs JSON do Pino estiverem carregando `service` e `environment`, use:

```logql
{stack="sangue-doce", service="sangue-doce-api"}
```

## Backend local fora do Docker

Se o backend estiver rodando com `yarn start:dev` no terminal, o Alloy não consegue ler esse stdout diretamente. Nesse caso, rode o backend escrevendo também em um arquivo:

```bash
mkdir -p ../logs/observability
yarn start:dev 2>&1 | tee ../logs/observability/backend.log
```

Se você estiver na raiz do projeto:

```bash
mkdir -p logs/observability
cd back-sangue-doce
yarn start:dev 2>&1 | tee ../logs/observability/backend.log
```

Depois gere uma requisição:

```bash
curl -i http://localhost:3011/health
```

E pesquise no Loki:

```logql
{stack="sangue-doce", source="local-file", service="sangue-doce-api"}
```

Para filtrar health:

```logql
{stack="sangue-doce", source="local-file", service="sangue-doce-api"} | json | url="/health"
```

## Observações importantes

- O Prometheus está configurado para buscar o backend em `host.docker.internal:3011`.
- Em Linux, o compose usa `host-gateway` para esse nome funcionar.
- O Alloy precisa do Docker socket em modo somente leitura para descobrir containers e coletar logs.
- O arquivo `./logs/observability/backend.log` é apenas para desenvolvimento local.
- Para VPS/Portainer, podemos depois adaptar a rede e trocar `host.docker.internal:3011` por `backend:3011`.
