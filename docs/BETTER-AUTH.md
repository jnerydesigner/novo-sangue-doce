# Implantacao do Better Auth no Sangue Doce

Este documento descreve como integrar Better Auth usando `@thallesp/nestjs-better-auth` mantendo a arquitetura atual:

```txt
Frontend Next.js -> BFF/API routes do Next.js -> Backend NestJS -> Prisma/PostgreSQL
```

Referencias usadas:

- `@thallesp/nestjs-better-auth`: https://github.com/thallesp/nestjs-better-auth
- Better Auth NestJS integration: https://better-auth.com/docs/integrations/nestjs
- Better Auth Prisma adapter: https://better-auth.com/docs/adapters/prisma
- Better Auth session management: https://better-auth.com/docs/concepts/session-management
- Better Auth email/password: https://better-auth.com/docs/authentication/email-password

## Estado atual

Hoje o backend ainda mantém a auth propria como compatibilidade:

- `back-sangue-doce/src/auth/auth.controller.ts`
- `back-sangue-doce/src/auth/auth.service.ts`
- `back-sangue-doce/src/@infra/guard/auth.guard.ts`
- `back-sangue-doce/src/@infra/guard/roles.guard.ts`
- `back-sangue-doce/src/auth/decorators/public.decorator.ts`
- `back-sangue-doce/src/auth/decorators/roles.decorator.ts`

O fluxo atual gera JWT no NestJS e o frontend guarda esse JWT em cookie HttpOnly no BFF:

- `front-sangue-doce/src/app/api/auth/login/route.ts`
- `front-sangue-doce/src/lib/auth-cookie.ts`

As chamadas autenticadas do frontend para o backend usam:

```txt
Authorization: Bearer <jwt>
```

O Better Auth ja foi instalado no backend e registrado no NestJS em paralelo ao fluxo JWT legado. A migracao deve preservar os endpoints internos do frontend sempre que possivel, para nao precisar reescrever dashboard, admin, uploads e actions de uma vez.

## Decisao de implantacao

Recomendacao: migrar em duas camadas.

1. Instalar Better Auth no backend e expor as rotas nativas sob `/api/auth`.
2. Manter as rotas BFF atuais do Next, como `/api/auth/login`, `/api/auth/profile` e `/api/auth/logout`, adaptando-as para conversar com Better Auth.

Assim, a tela de login continua simples:

```txt
/login -> POST /api/auth/login -> backend Better Auth
```

E a area logada continua usando os helpers existentes do frontend, enquanto a implementacao por baixo muda de JWT para sessao.

## Alerta de versoes

Em 2026-09-06, os pacotes atuais publicados sao:

```txt
better-auth: 1.7.3
@thallesp/nestjs-better-auth: 2.8.0
```

A versao `@thallesp/nestjs-better-auth@2.8.0` declara peers:

```txt
better-auth >=1.5.0 <2.0.0
@nestjs/common ^11.1.6 || ^12.0.0
@nestjs/core ^11.1.6 || ^12.0.0
typescript ^5.9.2 || ^6.0.0
express ^5.1.0
```

O backend atual esta em:

```txt
@nestjs/* 11.0.1
typescript 5.7.3
```

Antes da integracao, escolha um caminho:

```txt
Opção recomendada:
  atualizar NestJS para >=11.1.6 e TypeScript para >=5.9.2

Opção conservadora:
  usar @thallesp/nestjs-better-auth@1.0.3 temporariamente,
  que aceita TypeScript ^5 e Better Auth ^1.2.8,
  mas ainda pede NestJS >=11.0.10
```

Para evitar migrar em cima de peers desalinhados, a recomendacao para este projeto e atualizar NestJS e TypeScript primeiro.

## Pacotes

No backend:

```bash
cd back-sangue-doce
yarn add better-auth @thallesp/nestjs-better-auth
yarn add -D auth
```

Se for usar a versao atual do `@thallesp/nestjs-better-auth`, alinhe antes:

```bash
cd back-sangue-doce
yarn add @nestjs/common@^11.1.6 @nestjs/core@^11.1.6 @nestjs/platform-express@^11.1.6
yarn add -D typescript@^5.9.2
```

## Variaveis de ambiente

Adicionar ao ambiente do backend:

```env
BETTER_AUTH_SECRET="trocar-por-um-segredo-forte"
BETTER_AUTH_URL="http://localhost:3011"
FRONTEND_URL="http://localhost:3010"
```

Em producao:

```env
BETTER_AUTH_URL="https://api.sanguedoce.com.br"
FRONTEND_URL="https://sanguedoce.com.br"
```

O `BETTER_AUTH_SECRET` deve ser diferente do `JWT_SECRET` atual. Use um valor longo e aleatorio.

## Banco de dados

Better Auth usa modelos proprios para auth, normalmente:

- `User`
- `Session`
- `Account`
- `Verification`

O projeto ja tem um `model User` com dados de dominio:

```prisma
model User {
  id           String       @id @default(uuid()) @db.Uuid
  name         String
  email        String       @unique
  passwordHash String       @map("password_hash")
  avatarUrl    String?      @map("avatar_url")
  birthDate    DateTime?    @map("birth_date")
  diabetesType DiabetesType @default(UNKNOWN) @map("diabetes_type")
  role         Role         @default(USER)
}
```

Recomendacao: reaproveitar o `User` atual como tabela de usuario e adicionar os campos exigidos pelo Better Auth, em vez de criar uma segunda tabela de usuarios.

Campos provaveis a adicionar ao `User`:

```prisma
emailVerified Boolean   @default(false) @map("email_verified")
image         String?
```

Depois, adicionar os modelos de sessao/contas/verificacao gerados pelo Better Auth CLI.

Fluxo:

```bash
cd back-sangue-doce
npx auth generate
yarn prisma:migrate --name add-better-auth
yarn prisma:generate
```

Antes de aplicar a migracao, revise o diff do `prisma/schema.prisma` para garantir que o CLI nao criou um segundo `model User` incompatível com o atual. Se criar, mescle manualmente os campos no `User` existente.

Migracoes aplicadas nesta integracao:

```txt
back-sangue-doce/prisma/migrations/20260906145154_add_better_auth/migration.sql
back-sangue-doce/prisma/migrations/20260906152000_backfill_better_auth_accounts/migration.sql
```

A segunda migracao cria contas Better Auth para usuarios existentes:

```txt
providerId = credential
accountId  = users.id
password   = users.password_hash
```

Com isso, o endpoint nativo `POST /api/auth/sign-in/email` consegue autenticar usuarios ja cadastrados usando o mesmo hash `scrypt:salt:hash`.

## Criar a instancia Better Auth no backend

Arquivos criados:

```txt
back-sangue-doce/src/auth/better-auth/better-auth.instance.ts
back-sangue-doce/src/auth/better-auth/password-hash.ts
back-sangue-doce/auth.ts
```

O arquivo `auth.ts` na raiz existe para o CLI encontrar a configuracao quando alguem rodar `npx auth generate` sem `--config`.

```ts
const { auth } = require("./src/auth/better-auth/better-auth.instance");

module.exports = { auth };
```

Exemplo base:

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export const auth = betterAuth({
  appName: "Sangue Doce",
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:3010"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 100,
    password: {
      hash: async (password) => {
        return hashPasswordWithCurrentScryptImplementation(password);
      },
      verify: async ({ hash, password }) => {
        return compareWithCurrentScryptImplementation(password, hash);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      birthDate: { type: "date", required: false },
      diabetesType: { type: "string", required: false },
      role: { type: "string", required: false },
    },
  },
  hooks: {},
  databaseHooks: {},
});
```

Observacoes:

- Mova o hash/verify de senha atual de `AuthService` para um helper reutilizavel, por exemplo `src/auth/better-auth/password-hash.ts`.
- O projeto usa hashes no formato `scrypt:salt:hash`; manter `password.verify` permite login dos usuarios existentes.
- Better Auth normalmente armazena credenciais de senha em `Account`. Se a migracao mantiver temporariamente `User.passwordHash`, use hooks ou um script de migracao para popular as contas Better Auth.
- `disableSignUp: true` preserva a regra atual se o cadastro continuar sendo controlado por convite/admin.

## Ajustar `main.ts`

O pacote `@thallesp/nestjs-better-auth` exige desabilitar o body parser nativo do Nest para que Better Auth trate o corpo das rotas de auth.

Alterar:

```ts
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
```

Para:

```ts
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
  bodyParser: false,
});
```

Depois, o `AuthModule.forRoot` reativa os parsers para as rotas que nao sao Better Auth.

## Registrar o AuthModule do nestjs-better-auth

No `back-sangue-doce/src/app.module.ts`, importar o modulo da lib:

```ts
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./auth/better-auth/better-auth.instance";
```

Adicionar antes dos modulos de dominio:

```ts
BetterAuthModule.forRoot({
  auth,
  disableGlobalAuthGuard: true,
  bodyParser: {
    json: { limit: "10mb" },
    urlencoded: { limit: "10mb", extended: true },
    rawBody: true,
  },
}),
```

`disableGlobalAuthGuard: true` foi usado nesta fase para manter o `AuthGuard` JWT legado funcionando enquanto o frontend/BFF ainda envia `Authorization: Bearer`.

## Guard global e rotas publicas

Hoje o projeto registra:

```ts
{
  provide: APP_GUARD,
  useClass: AuthGuard,
}
```

O `@thallesp/nestjs-better-auth` registra um guard global proprio. Todas as rotas ficam protegidas por padrao e as rotas publicas precisam usar `@AllowAnonymous()`.

Para manter a estrutura atual, troque o decorator customizado `@Public()` para delegar tambem ao Better Auth:

```ts
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

export const Public = () => {
  return applyDecorators(SetMetadata(IS_PUBLIC_KEY, true), AllowAnonymous());
};
```

Depois, remova o `APP_GUARD` antigo ou substitua gradualmente.

Rotas que devem continuar publicas:

- `GET /health`
- `GET /metrics`, se exposto publicamente apenas em rede interna
- newsletter publica
- posts/receitas publicas
- imagens publicas
- `POST /auth/login`, enquanto existir compatibilidade
- `GET /auth/google`
- `GET /auth/google/callback`

## Compatibilidade com `AuthenticatedRequest`

Varios controllers esperam:

```ts
req.user.sub
req.user.email
req.user.role
req.user.roles
```

Better Auth fornece sessao via:

```ts
@Session() session: UserSession
```

Para evitar trocar todos os controllers de uma vez, crie um adapter:

```txt
back-sangue-doce/src/auth/better-auth-session.mapper.ts
```

Responsabilidade:

```ts
export function mapBetterAuthSessionToJwtPayload(session: UserSession): JwtPayload {
  return {
    sub: session.user.id,
    name: session.user.name,
    email: session.user.email,
    avatarUrl: session.user.image ?? undefined,
    birthDate: session.user.birthDate,
    diabetesType: session.user.diabetesType ?? "UNKNOWN",
    role: session.user.role === "ADMIN" ? "ADMIN" : "USER",
    roles: [session.user.role === "ADMIN" ? "ADMIN" : "USER"],
    passwordSetupRequired: false,
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  };
}
```

Depois, atualize controller por controller para usar `@Session()` e o mapper, mantendo o formato `JwtPayload` que o frontend ja conhece.

## Login com e-mail e senha

Manter o endpoint BFF:

```txt
front-sangue-doce/src/app/api/auth/login/route.ts
```

Mas alterar a implementacao para chamar o endpoint nativo do Better Auth no backend:

```txt
POST {BACKEND_URL}/api/auth/sign-in/email
```

Payload:

```json
{
  "email": "usuario@email.com",
  "password": "senha",
  "rememberMe": true
}
```

O BFF deve:

1. Encaminhar o login para Better Auth.
2. Ler o `Set-Cookie` retornado pelo backend.
3. Gravar o cookie de sessao no dominio do frontend, ainda como HttpOnly.
4. Chamar `/api/auth/get-session` ou endpoint equivalente para descobrir o usuario.
5. Retornar `{ ok: true, redirectTo }`.

O checkbox `Continuar conectado` continua sendo enviado pelo frontend. No Better Auth, `rememberMe: false` deve resultar em cookie de sessao de navegador; `rememberMe: true` deve manter sessao persistente conforme `session.expiresIn`.

Estado atual da migracao: `front-sangue-doce/src/app/api/auth/login/route.ts` ja chama `POST /api/auth/sign-in/email` no backend e repassa os cookies Better Auth para o navegador. Nesta fase, ele ainda chama o login legado em seguida para manter o cookie `sangue_doce_token`, porque dashboard/admin/uploads ainda dependem de `Authorization: Bearer`.

## Profile

Manter:

```txt
front-sangue-doce/src/app/api/auth/profile/route.ts
```

Mas trocar o backend consultado.

Hoje:

```txt
GET /auth/profile
Authorization: Bearer <jwt>
```

Depois:

```txt
GET /api/auth/get-session
Cookie: <cookie Better Auth>
```

O retorno para o frontend deve continuar no contrato atual:

```ts
type AuthProfile = {
  sub: string;
  name: string;
  email: string;
  avatarUrl?: string;
  birthDate?: string;
  diabetesType: string;
  role: "ADMIN" | "USER";
  roles: ("ADMIN" | "USER")[];
  passwordSetupRequired: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Essa compatibilidade evita alterar:

- `requireDashboardUser`
- `requireAdmin`
- dashboard
- admin
- menu de usuario

Estado atual da migracao: `front-sangue-doce/src/app/api/auth/profile/route.ts` ja tenta `GET /api/auth/get-session?disableRefresh=true` primeiro e converte a resposta para `AuthProfile`. Se nao houver sessao Better Auth, ele cai para o endpoint legado `/auth/profile` com JWT. Server components usam `front-sangue-doce/src/lib/current-auth.ts` para reaproveitar essa leitura de sessao.

## Logout

Manter:

```txt
front-sangue-doce/src/app/api/auth/logout/route.ts
```

Mas chamar o logout do Better Auth antes de apagar o cookie local:

```txt
POST {BACKEND_URL}/api/auth/sign-out
Cookie: <cookie Better Auth>
```

Depois apagar o cookie no BFF.

Estado atual da migracao: `front-sangue-doce/src/app/api/auth/logout/route.ts` ja chama `POST /api/auth/sign-out`, repassa os cookies expirados do Better Auth e apaga o cookie JWT legado.

## Autorizacao admin

Hoje o projeto usa `Role.ADMIN` e `Role.USER`.

Better Auth tem plugin/admin e decorators como `@Roles()` no `@thallesp/nestjs-better-auth`. Para minimizar mudanca:

1. Manter o campo `role` no `User` atual.
2. Garantir que Better Auth exponha `role` em `session.user`.
3. Atualizar o `RolesGuard` antigo ou migrar para `@Roles(["ADMIN"])`.

Evite misturar roles minusculas e maiusculas. O projeto atual usa:

```txt
ADMIN
USER
```

Entao padronize Better Auth para continuar usando esses valores.

## Google OAuth

O projeto atual usa Passport:

- `src/auth/strategies/google.strategy.ts`
- `GET /auth/google`
- `GET /auth/google/callback`

Com Better Auth, o ideal e migrar Google para provider nativo do Better Auth e manter apenas redirects de compatibilidade.

Config desejada:

```ts
export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
```

Depois, o frontend pode apontar para o endpoint Better Auth de sign-in social. Se quiser manter a URL atual:

```txt
GET /auth/google
```

Crie um redirect interno para a rota Better Auth correspondente.

## Plano de migracao de senhas

Ha duas estrategias.

### Estrategia A: login legado com migracao sob demanda

1. Usuario tenta login.
2. Se Better Auth ainda nao tem conta de senha para esse usuario, validar contra `users.password_hash` legado.
3. Se valido, criar `Account` Better Auth para `credential`.
4. Criar sessao Better Auth.
5. Da proxima vez, o login ja usa Better Auth puro.

Vantagem: nao precisa resetar senhas.

### Estrategia B: migracao em lote

1. Criar registros Better Auth `Account` para todos os usuarios que tem `password_hash` valido.
2. Usar `password.verify` customizado para aceitar o hash `scrypt`.
3. Manter `User.passwordHash` ate todos os fluxos estarem migrados.
4. Remover `passwordHash` depois de uma janela segura.

Vantagem: menos logica condicional no login.

Estrategia escolhida para este projeto: Estrategia B, porque o formato de hash atual e conhecido e ja e suportado por `emailAndPassword.password.verify`.

## Ordem de implantacao

1. Concluido: atualizar NestJS/TypeScript para satisfazer peers.
2. Concluido: instalar `better-auth`, `@thallesp/nestjs-better-auth` e CLI.
3. Concluido: criar `src/auth/better-auth/password-hash.ts` reaproveitando `scrypt`.
4. Concluido: criar `src/auth/better-auth/better-auth.instance.ts`.
5. Concluido: criar `auth.ts` para o CLI.
6. Concluido: rodar Better Auth CLI e revisar `prisma/schema.prisma`.
7. Concluido: criar/aplicar migracao Prisma `add_better_auth`.
8. Concluido: criar/aplicar migracao Prisma `backfill_better_auth_accounts`.
9. Concluido: registrar `BetterAuthModule.forRoot(...)` em `AppModule`.
10. Concluido: alterar `main.ts` para `bodyParser: false`.
11. Concluido parcialmente: migrar `/api/auth/login` do frontend para criar sessao Better Auth.
12. Concluido parcialmente: migrar `/api/auth/logout` para chamar `sign-out`.
13. Concluido parcialmente: migrar `/api/auth/profile` do frontend para usar `get-session`.
14. Proximo: criar uma estrategia para trocar chamadas BFF/backend de `Authorization: Bearer` para Cookie Better Auth.
15. Depois: migrar endpoints do backend de `Authorization: Bearer` para sessao Better Auth.
16. Depois: migrar Google OAuth.
17. Depois: remover `JwtModule`, `PassportModule`, `GoogleStrategy`, `AuthGuard` legado e `passwordHash` legado quando nao forem mais usados.

## Checklist de arquivos esperados

Backend:

```txt
back-sangue-doce/auth.ts
back-sangue-doce/src/auth/better-auth/better-auth.instance.ts
back-sangue-doce/src/auth/better-auth/password-hash.ts
back-sangue-doce/src/app.module.ts
back-sangue-doce/src/main.ts
back-sangue-doce/prisma/schema.prisma
back-sangue-doce/prisma/migrations/20260906145154_add_better_auth/migration.sql
back-sangue-doce/prisma/migrations/20260906152000_backfill_better_auth_accounts/migration.sql
```

Frontend:

```txt
front-sangue-doce/src/app/api/auth/login/route.ts
front-sangue-doce/src/app/api/auth/profile/route.ts
front-sangue-doce/src/app/api/auth/logout/route.ts
front-sangue-doce/src/lib/auth-cookie.ts
front-sangue-doce/src/lib/better-auth-server.ts
front-sangue-doce/src/lib/current-auth.ts
front-sangue-doce/src/lib/api.ts
```

App Android:

```txt
app-sangue-doce/app/src/main/java/br/com/sanguedoce/app/LoginActivity.kt
app-sangue-doce/app/src/main/java/br/com/sanguedoce/app/AuthSession.kt
app-sangue-doce/app/src/main/java/br/com/sanguedoce/app/model/LoginRequest.kt
```

O app Kotlin ainda usa o fluxo legado direto no backend:

```txt
POST /auth/login
GET /auth/profile
Authorization: Bearer <jwt>
```

Nesta fase, isso continua funcionando porque o backend manteve o JWT legado. A tela de login do app ja envia `rememberMe`. Quando `Continuar conectado` esta desmarcado, o token fica apenas em memoria enquanto o processo do app esta vivo; quando esta marcado, o token continua salvo em `SharedPreferences`.

Para migrar o app nativo totalmente para Better Auth, o proximo passo e trocar Retrofit/OkHttp para gerenciar cookies e chamar:

```txt
POST /api/auth/sign-in/email
GET /api/auth/get-session
POST /api/auth/sign-out
```

Enquanto as APIs protegidas do backend ainda exigirem `Authorization: Bearer`, o app deve permanecer no modo hibrido.

## Testes obrigatorios

Backend:

```bash
cd back-sangue-doce
yarn test auth
yarn test:e2e
```

Frontend:

```bash
cd front-sangue-doce
yarn biome
yarn build
```

Cenarios manuais:

- Login com e-mail/senha sem `Continuar conectado`.
- Login com e-mail/senha com `Continuar conectado`.
- Sessao expirada redireciona para `/login`.
- Usuario comum acessa `/dashboard`.
- Usuario comum nao acessa `/admin`.
- Admin acessa `/admin`.
- Logout encerra a sessao no banco e remove cookie.
- Atualizacao de perfil continua retornando usuario atualizado.
- Uploads continuam autenticados.
- Google OAuth funciona ou fica temporariamente desabilitado.

## Riscos e cuidados

- O pacote NestJS integra um guard global; se `@Public()` nao for adaptado, rotas publicas podem passar a retornar 401.
- Better Auth usa cookie de sessao; o BFF precisa encaminhar `Cookie` para o backend e propagar `Set-Cookie` corretamente.
- O projeto usa `Authorization: Bearer` em muitos pontos. A migracao deve centralizar essa mudanca em `front-sangue-doce/src/lib/api.ts` e nas API routes, nao em cada componente.
- O modelo `User` atual tem campos de dominio. Nao crie uma segunda tabela de usuarios sem um plano de sincronizacao.
- A versao atual de `@thallesp/nestjs-better-auth` tem peers mais novos que o backend atual. Alinhe versoes antes de abrir PR da integracao.
- Revise CORS/trusted origins. Hoje o backend usa `origin: "*"`, mas auth por cookie deve usar origens explicitas.

## Resultado esperado

Ao final da migracao:

- O frontend continua com `/login` e rotas BFF.
- O usuario continua entrando com e-mail e senha.
- `Continuar conectado` passa a controlar a persistencia da sessao Better Auth.
- O backend deixa de emitir JWT proprio para sessoes web.
- O banco passa a ter sessoes revogaveis e observaveis.
- Admin/dashboard continuam usando o mesmo contrato de perfil ate a limpeza final.
