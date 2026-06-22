# Guia de Dominio do Backend

Este documento registra o padrao usado nos modulos de dominio do backend. A referencia mais recente e o modulo `authors`, criado seguindo a mesma ideia do modulo `users`: regra de negocio no dominio/aplicacao, contrato abstrato de repositorio e Prisma isolado na infraestrutura.

## Objetivo

Cada modulo deve ter uma fronteira clara:

- `src/<modulo>/entities`: modelo de dominio e conversoes.
- `src/<modulo>/dto`: validacao de entrada.
- `src/<modulo>/repositories`: contrato abstrato que a aplicacao usa.
- `src/<modulo>/<modulo>.service.ts`: casos de uso e regras de aplicacao.
- `src/<modulo>/<modulo>.controller.ts`: HTTP.
- `src/<modulo>/<modulo>.module.ts`: wiring Nest do modulo.
- `src/@infra/database/<modulo>`: implementacao concreta usando Prisma.
- `src/@infra/database/database.module.ts`: binding da abstracao para a implementacao.

Com isso, o service depende de uma abstracao (`AuthorRepository`), nao do Prisma diretamente.

## Exemplo: Authors

Estrutura criada:

```txt
src/authors/
  authors.controller.ts
  authors.module.ts
  authors.service.ts
  dto/
    create-author.dto.ts
  entities/
    author.entity.ts
  repositories/
    author.repository.ts

src/@infra/database/authors/
  prisma-authors.repository.ts
```

## Entity

Arquivo: `src/authors/entities/author.entity.ts`

A entity concentra normalizacao e formato publico.

Ela define:

- `CreateAuthorEntityProps`: entrada necessaria para criar a entidade.
- `AuthorPersistence`: formato que sera persistido.
- `PersistedAuthorEntityProps`: formato vindo do banco.
- `PublicAuthor`: formato exposto pela API.
- `AuthorEntity.create`: cria entidade nova, normalizando dados.
- `AuthorEntity.fromPersistence`: recria entidade a partir do banco.
- `toPersistence`: entrega o payload para o repositorio persistir.
- `toPublic`: remove detalhes internos e padroniza resposta HTTP.

Regra pratica: controller e service nao montam objeto publico manualmente. Eles chamam `entity.toPublic()`.

## DTO

Arquivo: `src/authors/dto/create-author.dto.ts`

Os DTOs usam Zod, como em `users`.

Responsabilidades:

- validar campos obrigatorios;
- normalizar `slug` e `email`;
- garantir UUID valido para `userId`;
- manter mensagens de erro claras.

Exemplo de schema:

```ts
export const createAuthorSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  role: z.string().trim().min(2),
  userId: z.uuid(),
});
```

O service chama `safeParse` e transforma falhas em `BadRequestException`.

## Repository Abstrato

Arquivo: `src/authors/repositories/author.repository.ts`

O repositorio abstrato define o contrato do dominio:

```ts
export abstract class AuthorRepository {
  abstract create(author: AuthorEntity): Promise<AuthorEntity>;
  abstract findAll(): Promise<AuthorEntity[]>;
  abstract findById(id: string): Promise<AuthorEntity | null>;
  abstract findBySlug(slug: string): Promise<AuthorEntity | null>;
  abstract findByEmail(email: string): Promise<AuthorEntity | null>;
}
```

Tambem ficam aqui erros de dominio/infra traduzidos para a aplicacao:

- `AuthorAlreadyExistsError`
- `AuthorUserNotFoundError`

Regra pratica: o service conhece esses erros, mas nao conhece codigos do Prisma como `P2002` ou `P2003`.

## Prisma Repository

Arquivo: `src/@infra/database/authors/prisma-authors.repository.ts`

Esta classe implementa o contrato abstrato:

```ts
@Injectable()
export class PrismaAuthorsRepository implements AuthorRepository {}
```

Responsabilidades:

- chamar `this.prisma.postAuthor`;
- converter registro Prisma para entity com `AuthorEntity.fromPersistence`;
- capturar erros Prisma;
- traduzir `P2002` para `AuthorAlreadyExistsError`;
- traduzir `P2003` para `AuthorUserNotFoundError`.

Regra pratica: nao jogar erro cru do Prisma para o service quando ele representar uma regra conhecida.

## Service

Arquivo: `src/authors/authors.service.ts`

O service e onde ficam os casos de uso.

Ele:

- recebe DTO;
- valida com Zod;
- cria entity;
- chama o repository abstrato;
- traduz erros conhecidos para excecoes HTTP;
- retorna `toPublic()`.

Exemplo do fluxo de criacao:

```txt
Controller -> AuthorsService.create
  -> parseCreateAuthor
  -> AuthorEntity.create
  -> AuthorRepository.create
  -> AuthorEntity.toPublic
```

Erros tratados:

- payload invalido: `BadRequestException`
- id invalido: `BadRequestException`
- autor inexistente: `BadRequestException`
- slug/email duplicado: `ConflictException`
- userId sem usuario correspondente: `BadRequestException`

## Controller

Arquivo: `src/authors/authors.controller.ts`

O controller deve ser fino. Ele apenas recebe HTTP e chama service.

Rotas criadas:

```txt
POST /authors
GET /authors
GET /authors/search?email=...
GET /authors/slug/:slug
GET /authors/:id
```

Regra pratica: controller nao valida regra de negocio e nao acessa Prisma.

## Module

Arquivo: `src/authors/authors.module.ts`

Padrao:

```ts
@Module({
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
```

Como `DatabaseModule` e global, o repository abstrato fica disponivel para injecao.

## Dependency Inversion

Arquivo: `src/@infra/database/database.module.ts`

Aqui fica o binding entre contrato e implementacao:

```ts
providers: [
  PrismaAuthorsRepository,
  {
    provide: AuthorRepository,
    useExisting: PrismaAuthorsRepository,
  },
]
```

Isso permite que `AuthorsService` dependa de `AuthorRepository`, sem importar Prisma.

Fluxo:

```txt
AuthorsService
  depende de AuthorRepository

DatabaseModule
  entrega PrismaAuthorsRepository quando alguem pede AuthorRepository
```

## Checklist Para Criar Um Novo Modulo

Use este checklist para proximos dominios, por exemplo `posts`, `categories` ou `tags`.

1. Criar pasta do modulo:

```txt
src/<modulo>/
  <modulo>.controller.ts
  <modulo>.module.ts
  <modulo>.service.ts
  dto/
  entities/
  repositories/
```

2. Criar entity:

- definir `Create<Entity>EntityProps`;
- definir `<Entity>Persistence`;
- definir `Persisted<Entity>EntityProps`;
- definir tipo publico;
- implementar `create`;
- implementar `fromPersistence`;
- implementar `toPersistence`;
- implementar `toPublic`.

3. Criar DTO com Zod:

- validar campos obrigatorios;
- normalizar strings;
- validar UUIDs;
- validar slugs;
- exportar `type Create<Entity>Dto`.

4. Criar repository abstrato:

- definir metodos que o service precisa;
- criar erros conhecidos do dominio;
- nao importar Prisma aqui.

5. Criar repository Prisma:

```txt
src/@infra/database/<modulo>/prisma-<modulo>.repository.ts
```

- implementar o repository abstrato;
- converter record Prisma para entity;
- traduzir erros Prisma conhecidos.

6. Criar service:

- injetar repository abstrato;
- validar DTO;
- criar entity;
- chamar repository;
- traduzir erros conhecidos para excecoes Nest;
- retornar `toPublic`.

7. Criar controller:

- expor endpoints finos;
- nao colocar regra de negocio.

8. Registrar no `DatabaseModule`:

```ts
Prisma<Modulo>Repository,
{
  provide: <Modulo>Repository,
  useExisting: Prisma<Modulo>Repository,
}
```

9. Registrar o modulo no `AppModule`, se ainda nao estiver.

10. Validar:

```sh
yarn build
yarn lint
```

## Convencoes

- Modelos Prisma continuam em ingles: `PostAuthor`, `PostCategory`, `Post`.
- Tabelas Postgres usam snake case via `@@map` e `@map`.
- Services nao importam `PrismaService`.
- Controllers nao importam repositories.
- Repositories abstratos nao importam Prisma.
- Erros de banco conhecidos devem ser traduzidos na infra.
- Entidades normalizam dados antes de persistir.
- Respostas publicas saem de `toPublic`.

## Quando Fugir Do Padrao

So vale fugir quando o modulo for apenas tecnico, sem regra de dominio propria. Para recursos do produto, como posts, categorias, autores, usuarios, medicoes e comentarios, use o padrao completo.
