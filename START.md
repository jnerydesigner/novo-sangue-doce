# START

Guia para reproduzir a aplicacao Sangue Doce em outro notebook, partindo do repositorio.

## 1. Requisitos

- Git
- Node.js 22 ou superior
- Yarn 1.x
- Docker e Docker Compose

Confira as versoes:

```bash
node -v
yarn -v
docker --version
docker compose version
```

## 2. Baixar o repositorio

```bash
git clone <URL_DO_REPOSITORIO>
cd sangue-doce-new
```

## 3. Configurar variaveis de ambiente

Crie o `.env` da raiz para o PostgreSQL do Docker:

```bash
cp .env.example .env
```

Edite `.env` com valores locais, por exemplo:

```env
POSTGRES_USER=sangue_doce
POSTGRES_PASSWORD=sangue_doce
POSTGRES_DB=sangue_doce
POSTGRES_PORT=5433
POSTGRES_DATA_DIR=./.docker/postgres
```

Crie o `.env` do backend:

```bash
cp back-sangue-doce/.env.axample back-sangue-doce/.env
```

Edite `back-sangue-doce/.env`:

```env
SERVER_PORT=3011
DATABASE_URL="postgresql://sangue_doce:sangue_doce@localhost:5433/sangue_doce?schema=public"
JWT_SECRET="troque-essa-chave-em-producao"
```

Crie o `.env` do frontend:

```bash
cp front-sangue-doce/.env.example front-sangue-doce/.env
```

Confirme `front-sangue-doce/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3011
```

## 4. Instalar dependencias

Backend:

```bash
cd back-sangue-doce
yarn install
cd ..
```

Frontend:

```bash
cd front-sangue-doce
yarn install
cd ..
```

## 5. Subir o PostgreSQL

Na raiz do projeto:

```bash
docker compose up -d postgres
```

Verifique se o container esta rodando:

```bash
docker compose ps
```

## 6. Criar tabelas e gerar Prisma Client

Na raiz do projeto:

```bash
cd back-sangue-doce
yarn prisma:generate
yarn prisma:deploy
cd ..
```

Para ambiente de desenvolvimento, se preferir usar o fluxo interativo do Prisma:

```bash
cd back-sangue-doce
yarn prisma:migrate
cd ..
```

## 7. Popular o banco com seed completo

```bash
cd back-sangue-doce
yarn prisma:seed
cd ..
```

O seed cria usuarios, autores, categorias, tags, posts e dados iniciais usados pela aplicacao.

Usuario admin seedado:

```txt
E-mail: jander.webmaster@gmail.com
Senha: 12345678
Role: ADMIN
```

Usuario comum seedado:

```txt
E-mail: ana.ribeiro@sanguedoce.com
Senha: 12345678
Role: USER
```

## 8. Rodar a aplicacao

Terminal 1, backend:

```bash
cd back-sangue-doce
yarn start:dev
```

Backend:

```txt
http://localhost:3011
http://localhost:3011/health
```

Terminal 2, frontend:

```bash
cd front-sangue-doce
yarn dev
```

Frontend:

```txt
http://localhost:3010
```

## 9. Atalho com Makefile

Na raiz do projeto, tambem existe:

```bash
make install
make dev
```

O `make dev` sobe o PostgreSQL, aplica migrations, gera Prisma Client, roda seed, inicia backend e frontend.

## 10. Comandos de verificacao

Backend:

```bash
cd back-sangue-doce
yarn lint
yarn build
```

Frontend:

```bash
cd front-sangue-doce
yarn lint
yarn build
```

Projeto inteiro pela raiz:

```bash
make lint
make build
```

## 11. Parar a infraestrutura

Parar apenas os containers:

```bash
docker compose down
```

Parar e remover o volume local do banco, apagando os dados:

```bash
docker compose down -v
rm -rf .docker/postgres
```

Depois disso, para reconstruir o banco do zero:

```bash
docker compose up -d postgres
cd back-sangue-doce
yarn prisma:deploy
yarn prisma:seed
```
