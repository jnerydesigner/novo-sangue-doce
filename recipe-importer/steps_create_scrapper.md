# Recipe Importer — implementação integrada

## Objetivo

Receber a URL pública de uma receita, extrair dados estruturados, normalizar para o domínio `Recipe` do Sangue Doce e preencher um rascunho no CMS para revisão humana.

O importer não persiste receitas, não publica conteúdo e não envia imagens ao S3. Essas responsabilidades continuam no `back-sangue-doce`.

## Fluxo

```text
CMS /admin/receitas/nova
  → POST /api/admin/recipes/import
  → POST back-sangue-doce /recipes/import (ADMIN)
  → POST recipe-importer /recipes/import
  → valida URL e robots.txt
  → baixa HTML com limites
  → extrai JSON-LD Recipe
  → normaliza ingredientes, etapas, tempos e nutrição
  → devolve preview e warnings
  → editor revisa e salva como DRAFT/PUBLISHED
```

## Executar localmente

### Docker Compose

```bash
docker compose up --build recipe-importer
```

O serviço responde em `http://localhost:8030`. O importer usa a porta `8030` tanto na máquina quanto dentro da rede Docker.

### Python

```bash
cd recipe-importer
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8030
```

Para o backend executado fora do Docker:

```env
RECIPE_IMPORTER_URL=http://localhost:8030
```

No Compose/Portainer, o valor padrão é:

```env
RECIPE_IMPORTER_URL=http://recipe-importer:8030
```

## Endpoints

### Healthcheck

```http
GET /health
```

### Importar

```http
POST /recipes/import
Content-Type: application/json

{
  "url": "https://site-publico.com/receita"
}
```

Resposta resumida:

```json
{
  "recipe": {
    "sourceUrl": "https://site-publico.com/receita",
    "title": "Nome da receita",
    "excerpt": "Descrição",
    "prepMinutes": 10,
    "cookMinutes": 20,
    "servings": 4,
    "ingredients": [],
    "instructions": [],
    "nutrition": null
  },
  "confidence": "HIGH",
  "warnings": [],
  "fingerprint": "sha256",
  "extractor": "json-ld"
}
```

## Estratégia de extração

1. procurar `<script type="application/ld+json">`;
2. percorrer objetos, listas e `@graph`;
3. localizar objetos `@type: Recipe`;
4. escolher o candidato com mais ingredientes;
5. interpretar `HowToStep` e `HowToSection`;
6. resolver URLs relativas de canonical e imagem;
7. converter durações ISO 8601 para minutos;
8. converter nutrição para valores numéricos;
9. preservar `originalText` de cada ingrediente para revisão.

Scrapers específicos podem ser registrados em `app/scrapers/site_specific.py` quando um domínio relevante não oferecer JSON-LD utilizável.

## Proteções implementadas

- somente HTTP e HTTPS;
- bloqueio de credenciais na URL;
- resolução DNS antes da requisição;
- bloqueio de loopback, redes privadas, link-local e IPs reservados;
- nova validação a cada redirecionamento;
- máximo de 5 redirecionamentos;
- timeout de conexão e leitura;
- resposta limitada a 3 MB;
- somente conteúdo HTML/XHTML;
- verificação e cache de `robots.txt`;
- user-agent identificável;
- imagem externa nunca é copiada automaticamente.

## Limites atuais

- páginas que renderizam a receita apenas por JavaScript não são processadas;
- ingredientes ambíguos podem precisar de correção manual;
- sites sem JSON-LD `Recipe` retornam erro 422;
- o fingerprint é devolvido, mas a persistência/detecção histórica pertence ao backend;
- não há Playwright no MVP.

## Responsabilidades

### recipe-importer

- segurança da URL;
- robots.txt;
- download da página;
- extração e normalização;
- warnings e confiança.

### back-sangue-doce

- autenticação e papel ADMIN;
- proxy para o serviço interno;
- persistência e duplicidade histórica;
- criação/edição da receita;
- upload autorizado de imagens ao S3;
- auditoria e publicação.

### frontend

- receber a URL;
- mostrar progresso e erros;
- preencher o formulário;
- exigir revisão antes de salvar;
- não copiar automaticamente imagens de terceiros.
