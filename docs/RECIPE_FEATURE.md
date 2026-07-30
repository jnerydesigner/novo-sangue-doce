# Feature de receitas saudáveis

## Objetivo

Adicionar receitas saudáveis ao Sangue Doce como domínio independente de matérias. A feature reutiliza infraestrutura e componentes técnicos, mas não usa `Post`, `PostsService`, `PostRepository` nem tabelas de taxonomia de posts.

## Decisão de domínio

```text
PostsModule                         RecipesModule
├── Post                            ├── Recipe
├── PostAuthor                      ├── RecipeAuthor
├── PostCategory                    ├── RecipeCategory
├── PostTag                         ├── RecipeTag
└── uploads/posts/...               └── uploads/recipes/...

                 Compartilham apenas
        autenticação, S3, editor visual e utilitários
```

Semelhança de interface não significa igualdade de domínio. Uma receita possui ciclo editorial próprio e não depende de filtros ou regras de matérias.

## Modelo de dados

### Recipe

Campos editoriais próprios:

- `slug`, `title`, `excerpt` e `content`;
- `status`: `DRAFT`, `PUBLISHED` ou `ARCHIVED`;
- `featured` e `readingMinutes`;
- `coverImageUrl` e `coverImageAlt`;
- `metaTitle`, `metaDescription` e `publishedAt`;
- relações próprias com autor, categoria e tags.

Campos culinários:

- `prepMinutes` e `cookMinutes`;
- `servings` e `servingSize`;
- `difficulty`;
- `ingredients` e `instructions` estruturados;
- calorias, carboidratos, fibras, proteínas, gorduras e sódio por porção.

### Taxonomia própria

- `RecipeAuthor` relaciona o perfil editorial de receitas ao usuário;
- `RecipeCategory` organiza a listagem de receitas;
- `RecipeTag` e `RecipeTagRelation` permitem classificação independente.

Alterar uma categoria ou tag de matéria não altera receitas.

## Migration de separação

A migration `20260712213000_separate_recipe_domain` preserva os dados criados na primeira versão:

1. cria autoria e taxonomia próprias;
2. copia os dados do post auxiliar para `recipes`;
3. copia autor, categoria e tags usados pela receita;
4. cria as relações e índices do novo domínio;
5. remove o post auxiliar;
6. remove `post_id` de `recipes`.

Depois da migration, receitas não possuem registro correspondente em `posts`.

## Backend

Estrutura principal:

```text
src/recipes/
├── dto/create-recipe.dto.ts
├── recipes.controller.ts
├── recipes.module.ts
└── recipes.service.ts
```

Endpoints:

- `POST /recipes`;
- `PATCH /recipes/:id`;
- `DELETE /recipes/:id`;
- `GET /recipes`;
- `GET /recipes/admin`;
- `GET /recipes/:id`;
- `GET /recipes/slug/:slug`;
- `GET /recipes/authors`;
- `GET /recipes/categories`;
- `GET /recipes/tags`.

Consultas públicas retornam somente receitas `PUBLISHED`. Criação, edição, exclusão e listagem administrativa exigem papel `ADMIN`.

## Upload e S3

Posts e receitas possuem fluxos separados:

```text
POST /uploads/post/cover       → public/posts/{slug}/...
POST /uploads/post/images      → public/posts/images/{slug}/...

POST /uploads/recipe/cover     → public/recipes/{slug}/...
POST /uploads/recipe/images    → public/recipes/images/{slug}/...
```

Os fluxos reutilizam:

- validação de JPEG, PNG e WebP;
- limite de 5 MB;
- conversão para WebP;
- `AwsS3Service`;
- remoção da capa anterior;
- configuração de bucket e região.

O `blob:` criado pelo navegador serve somente para preview. O banco persiste a URL pública devolvida pelo S3.

## CMS administrativo

Rotas próprias:

- `/admin/receitas`;
- `/admin/receitas/nova`;
- `/admin/receitas/nova?id={id}`.

O formulário administra:

- base editorial da receita;
- autor, categoria e tags do domínio de receitas;
- upload e preview de capa;
- tempos, rendimento e dificuldade;
- ingredientes e modo de preparo;
- informação nutricional por porção;
- conteúdo complementar com o editor visual compartilhado;
- metadados de SEO;
- rascunho e publicação.

Componentes visuais podem ser compartilhados com matérias. Contratos, services e persistência não são compartilhados.

## Site público

- `/receitas`: listagem paginada;
- `/receitas/[slug]`: página detalhada própria.

A página detalhada apresenta:

1. título, categoria, autor e data;
2. imagem de capa;
3. tempo, rendimento, dificuldade e tamanho da porção;
4. ingredientes;
5. modo de preparo;
6. informação nutricional por porção;
7. conteúdo complementar;
8. aviso educativo de saúde.

Matérias continuam exclusivamente em `/materias` e não precisam conhecer o domínio de receitas.

## SEO

Cada receita publicada possui:

- URL canônica `/receitas/{slug}`;
- Open Graph e Twitter Card;
- entrada própria no sitemap;
- JSON-LD `Recipe`;
- ingredientes como `recipeIngredient`;
- etapas como `HowToStep`;
- tempos em duração ISO 8601;
- nutrição por porção quando revisada e disponível.

## Regras de validação

- slug válido e único dentro de receitas;
- título e resumo obrigatórios;
- autor e categoria próprios válidos;
- pelo menos um ingrediente e uma etapa;
- tempo total maior que zero;
- pelo menos uma porção;
- quantidades e nutrientes não negativos;
- capa obrigatória no contrato editorial;
- valores nutricionais identificados como valores por porção.

## Critérios de aceite

- Receita pode ser criada, editada, publicada e excluída sem acessar `posts`.
- Receita publicada abre em `/receitas/{slug}`.
- Matérias não incluem receitas e não precisam de filtros especiais.
- Autoria, categorias e tags de receitas possuem tabelas próprias.
- Upload de receita usa endpoints e chaves S3 próprios.
- Conversão e comunicação com S3 são reutilizadas.
- Dados existentes são preservados pela migration.
- JSON-LD e sitemap incluem somente receitas publicadas.
- Informações de saúde não fazem promessas terapêuticas.

## Fora do escopo inicial

- cálculo automático de nutrientes;
- recomendação de insulina ou medicação;
- planejamento semanal;
- avaliações e comentários;
- conversão automática de unidades;
- geração de receitas por IA.

## Princípio de implementação

**Compartilhar capacidade técnica, não identidade de domínio.**

Posts e receitas podem usar o mesmo S3, componentes de formulário e renderizador de blocos. Entidades, tabelas, regras de negócio, endpoints e caminhos de armazenamento permanecem separados.
