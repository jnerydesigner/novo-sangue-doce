-- Generated from 50_receitas.pdf. Review all DRAFT records before publication.
-- The source PDF remains the authority for layout-sensitive ingredients and instructions.
BEGIN;

-- ================================================================
-- CONFIGURE OS DOIS UUIDs ABAIXO ANTES DE EXECUTAR O ARQUIVO
-- ================================================================
DO $$
DECLARE
  -- Exemplo: 'b1c86db2-be62-421d-85e1-725734750219'::uuid
  selected_author UUID := NULL; -- COLOQUE O authorId AQUI
  selected_category UUID := NULL; -- COLOQUE O categoryId AQUI
BEGIN
  IF selected_author IS NULL OR selected_category IS NULL THEN
    RAISE EXCEPTION 'Preencha selected_author e selected_category no inicio do extraction.sql';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM "recipe_authors" WHERE "id" = selected_author) THEN
    RAISE EXCEPTION 'O authorId informado nao existe em recipe_authors';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM "recipe_categories" WHERE "id" = selected_category) THEN
    RAISE EXCEPTION 'O categoryId informado nao existe em recipe_categories';
  END IF;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'panini-com-geleia-artesanal-e-suco-verde', 'Panini com geleia artesanal e suco verde', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 18. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 18. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Panini com geleia artesanal e suco verde', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 18. Conteúdo importado para revisão editorial.',
    1, 0, 1, '1 porção por receita', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 ovo (retire a pele do ovo)", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de cottage", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de farinha de aveia ou linhaça", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de fermento", "note": null}, {"quantity": null, "unit": null, "name": "1 pitada de sal", "note": null}, {"quantity": null, "unit": null, "name": "Orégano, açafrão, pimenta do reino a gosto.", "note": null}, {"quantity": null, "unit": null, "name": "5 folhas de couve", "note": null}, {"quantity": null, "unit": null, "name": "1 molho pequeno de hortelã", "note": null}, {"quantity": null, "unit": null, "name": "1 pedaço de gengibre de 3 cm", "note": null}, {"quantity": null, "unit": null, "name": "600ml de água de coco.", "note": null}]'::jsonb, '[{"title": null, "description": "Misture todos os ingredientes e ponha em uma forma pequena que possa ir ao micro-ondas durante 2 minutos. Depois de pronto, corte ao meio leve a uma tostadeira/sanduicheira até ficar bem moreninho e crocante."}, {"title": null, "description": "bater todos os ingredientes no liquidificador"}, {"title": null, "description": "colocar em cubos de gelo"}, {"title": null, "description": "depois de congelados, retirar e armazenar em saquinhos no congelador."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'smoothie-refrescante-de-banana-com-morango', 'Smoothie refrescante de banana com morango', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 20. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 20. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Smoothie refrescante de banana com morango', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 20. Conteúdo importado para revisão editorial.',
    10, 0, 1, '1 pessoa', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1xícara de leite semidesnatado,", "note": null}, {"quantity": null, "unit": null, "name": "1 banana prata bem madura", "note": null}, {"quantity": null, "unit": null, "name": "3 morangos grandes", "note": null}, {"quantity": null, "unit": null, "name": "1 colher (sopa) de iogurte natural", "note": null}, {"quantity": null, "unit": null, "name": "3 gotas de essência de baunilha", "note": null}, {"quantity": null, "unit": null, "name": "1 colher (chá) de mel", "note": null}]'::jsonb, '[{"title": null, "description": "Em um liquidificador, junte todos os ingredientes."}, {"title": null, "description": "Bata até a mistura ficar homogênea."}, {"title": null, "description": "Sirva bem gelado"}, {"title": null, "description": "Smoothie é uma ótima opçao refrescante e deliciosa!"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'aipim-cozido-com-ghee-acompanhado-por-suco-rosa', 'Aipim cozido com ghee acompanhado por suco rosa', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 22. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 22. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Aipim cozido com ghee acompanhado por suco rosa', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 22. Conteúdo importado para revisão editorial.',
    1, 0, 1, '1 copo', 'EASY',
    '[{"quantity": null, "unit": null, "name": "6 morangos orgânicos", "note": null}, {"quantity": null, "unit": null, "name": "3 colheres de sopa de beterraba crua picada", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de abacaxi picado", "note": null}, {"quantity": null, "unit": null, "name": "½ limão espremido", "note": null}, {"quantity": null, "unit": null, "name": "6 folhas de hortelã", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sobremesa de farinha de semente de linhaça.", "note": null}, {"quantity": null, "unit": null, "name": "½ unidade de aipim", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá rasa de manteiga (ou ghee)", "note": null}]'::jsonb, '[{"title": null, "description": "Bater tudo no liquidificador e não coar."}, {"title": null, "description": "1 colher de chá rasa de manteiga (ou ghee)"}, {"title": null, "description": "Modo de preparo:Cozinhar o aipim até ficar bem macio e adicionar a manteiga depois de pronto."}, {"title": null, "description": "Cozinhar o aipim até ficar bem macio e adicionar a manteiga depois de pronto."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'muesli-da-estacao', 'Muesli da estação', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 24. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 24. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Muesli da estação', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 24. Conteúdo importado para revisão editorial.',
    15, 0, 2, '2 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 pote de iogurte natural (170 g)", "note": null}, {"quantity": null, "unit": null, "name": "1/2 xícara (chá) de leite desnatado", "note": null}, {"quantity": null, "unit": null, "name": "1 colher (sopa) de mel mais 2 colheres (chá) para", "note": null}, {"quantity": null, "unit": null, "name": "finalizar", "note": null}, {"quantity": null, "unit": null, "name": "1 colher (sopa) de sementes de linhaça dourada", "note": null}, {"quantity": null, "unit": null, "name": "1/4 xícara (chá) de aveia1 maçã tipo Fuji", "note": null}, {"quantity": null, "unit": null, "name": "Suco de 1/2 limão", "note": null}, {"quantity": null, "unit": null, "name": "1 colher (sopa) de nozes tostadas e picadas", "note": null}, {"quantity": null, "unit": null, "name": "1 colher (sopa) de uvas-passas brancas", "note": null}, {"quantity": null, "unit": null, "name": "1xícara de leite semidesnatado,", "note": null}, {"quantity": null, "unit": null, "name": "1 banana prata bem madura", "note": null}, {"quantity": null, "unit": null, "name": "3 morangos grandes", "note": null}, {"quantity": null, "unit": null, "name": "1 colher (sopa) de iogurte natural", "note": null}, {"quantity": null, "unit": null, "name": "3 gotas de essência de baunilha", "note": null}, {"quantity": null, "unit": null, "name": "1 colher (chá) de mel", "note": null}]'::jsonb, '[{"title": null, "description": "Em uma tigela, coloque o iogurte, o leite, a aveia, a linhaça e o mel. Misture, tampe (ou cubra com filme) e deixe na geladeira por 12 horas. Na manhã seguinte, lave, seque e corte a maçã ao meio, no sentido do comprimento. Corte cada metade em dois. Retire as sementes e rale os pedaços de maçã sobre uma tigela, utilizando a casca como proteção para os dedos. Adicione e misture o suco do limão. Junte ao muesli e mexa bem. Salpique as nozes e as uvas passas. Finalize com mel e sirva a seguir."}, {"title": null, "description": "Em um liquidificador, junte todos os ingredientes."}, {"title": null, "description": "Bata até a mistura ficar homogênea."}, {"title": null, "description": "Sirva bem gelado"}, {"title": null, "description": "Smoothie é uma ótima opçao refrescante e deliciosa!"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'tapioca-caipira-suco-nutritivo', 'Tapioca caipira + Suco nutritivo', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 26. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 26. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Tapioca caipira + Suco nutritivo', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 26. Conteúdo importado para revisão editorial.',
    23, 0, 1, '1 porção', 'EASY',
    '[{"quantity": null, "unit": null, "name": "3 colheres de sopa de goma de tapioca", "note": null}, {"quantity": null, "unit": null, "name": "hidratada", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de chia", "note": null}, {"quantity": null, "unit": null, "name": "1 ovo cozido amassado", "note": null}, {"quantity": null, "unit": null, "name": "4 fatias de abacaxi", "note": null}, {"quantity": null, "unit": null, "name": "3 folhas de couve", "note": null}, {"quantity": null, "unit": null, "name": "4 folhas de hortelã", "note": null}, {"quantity": null, "unit": null, "name": "1 maçã grande com casca", "note": null}, {"quantity": null, "unit": null, "name": "400 mL de água ou água de coco", "note": null}]'::jsonb, '[{"title": null, "description": "Peneire a tapioca, misture com a chia e leve ao fogo até que a massa comece se desprender da frigideira. Adicione o ovo amassado e dobre a tapioca ao meio."}, {"title": null, "description": "Higienizar a couve, a hortelã e a maçã. Descascar o abacaxi e cortar em fatias. Colocar os ingredientes no liquidificador e ir adicionando a agua aos poucos, conforme necessidade."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'cupcake-de-coco-e-cacau-cafe-batido-com-oleo-de-coco', 'Cupcake de coco e cacau + café batido com óleo de coco', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 28. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 28. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Cupcake de coco e cacau + café batido com óleo de coco', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 28. Conteúdo importado para revisão editorial.',
    5, 0, 4, 'individual – uma', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 colher de sopa de óleo de coco e 1", "note": null}, {"quantity": null, "unit": null, "name": "xícara de café (infusão).", "note": null}, {"quantity": null, "unit": null, "name": "2 ovos", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de amêndoas trituradas", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de semente de chia", "note": null}, {"quantity": null, "unit": null, "name": "5 colheres de sopa leite de coco ou de amêndoas", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de coco ralado sem açúcar", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de cacau em pó", "note": null}, {"quantity": null, "unit": null, "name": "3 colheres de sopa de açúcar mascavo", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de fermento em pó.", "note": null}]'::jsonb, '[{"title": null, "description": "bater o café com o óleo de coco no liquidificador ou mixer"}, {"title": null, "description": "Retire a película que recobre as gemas e bata os ovos com um fuê até dobrar de volume. Agregue os outros ingredientes aos ovos batidos. Coloque em formas de silicone ou formas de alumínio forradas com papel manteiga. Asse à 180º C por 20 minutos em forno pré-aquecido."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'granola-caseira', 'Granola caseira', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 30. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 30. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Granola caseira', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 30. Conteúdo importado para revisão editorial.',
    20, 0, 1, '1 pessoa durante 1 mês', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1xícara de chá de flocos de aveia", "note": null}, {"quantity": null, "unit": null, "name": "1 xícara de chá de flocos de milho", "note": null}, {"quantity": null, "unit": null, "name": "sem açúcar", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de semente de", "note": null}, {"quantity": null, "unit": null, "name": "linhaça", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de farelo de", "note": null}, {"quantity": null, "unit": null, "name": "amaranto", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de óleo de coco", "note": null}, {"quantity": null, "unit": null, "name": "3 colheres de sopa de mel ou melado", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de café de cacau", "note": null}, {"quantity": null, "unit": null, "name": "Canela a gosto", "note": null}, {"quantity": null, "unit": null, "name": "4 colheres de sopa Castanha de caju", "note": null}, {"quantity": null, "unit": null, "name": "4 colheres de sopa de amêndoas", "note": null}, {"quantity": null, "unit": null, "name": "4 colheres de sopa de uva passa ou", "note": null}, {"quantity": null, "unit": null, "name": "damasco picado", "note": null}]'::jsonb, '[{"title": null, "description": "Em um tabuleiro untado com óleo de coco misture todos os ingredientes, exceto a fruta seca. Leve ao forno pré-aquecido a 180 graus por cerca de 15 minutos ou até que fique crocante, mexendo sempre com o auxílio de uma espátula. Finalize a granola com as frutas secas."}, {"title": null, "description": "Armazene em um pote bem vedado."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'cookie-de-grao-de-bico', 'Cookie de grão de bico', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 34. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 34. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Cookie de grão de bico', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 34. Conteúdo importado para revisão editorial.',
    60, 0, 7, '7 pessoas (22 unidades)', 'EASY',
    '[{"quantity": null, "unit": null, "name": "2 xícaras de grão de bico", "note": null}, {"quantity": null, "unit": null, "name": "3 colheres de sopa de azeite", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de semente de chia", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de farinha de arroz", "note": null}, {"quantity": null, "unit": null, "name": "Sal, alho e ervas a gosto (capriche para", "note": null}, {"quantity": null, "unit": null, "name": "ficar gostoso)", "note": null}, {"quantity": null, "unit": null, "name": "1 xi", "note": null}]'::jsonb, '[{"title": null, "description": "Deixe o grão de bico de molho por 10 horas, descarte a água e processe (sem cozinhar) até ficar em pedacinhos bem pequenos. Misture os outros ingredientes e abra a massa em uma assadeira, pressionando com a ponta dos dedos umedecidos. Leve ao forno baixo por cerca de 25 minutos ou até que estejam dourados."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'palitinhos-crocantes', 'Palitinhos crocantes', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 35. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 35. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Palitinhos crocantes', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 35. Conteúdo importado para revisão editorial.',
    1, 0, 4, NULL, 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 35"}]'::jsonb, '[{"title": null, "description": "Misture a baroa, cenoura, azeite, e até virar um purê, reserve. Misture o polvilho, sal e chia, adicione o purê, misturando sempre até obter uma mistura homogênea. Modele em forma de palitinhos. Leve ao forno pré-aquecido a180 graus por cerca de 15 minutos ou até que fiquem dourados."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'danete-cremoso-de-chocolate', 'Danete cremoso de chocolate', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 36. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 36. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Danete cremoso de chocolate', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 36. Conteúdo importado para revisão editorial.',
    20, 0, 4, '4 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "200 ml de leite de coco", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de cacau,", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de chocolate em pó", "note": null}, {"quantity": null, "unit": null, "name": "1/2 abacate congelado", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa rasa de semente de chia", "note": null}, {"quantity": null, "unit": null, "name": "Adoce a gosto (*sugestões: demerara, stevia, mel ou", "note": null}, {"quantity": null, "unit": null, "name": "melado)", "note": null}, {"quantity": null, "unit": null, "name": "Raspas de chocolate 70% para decorar", "note": null}]'::jsonb, '[{"title": null, "description": "Bata tudo no liquidificador e sirva logo em seguida."}, {"title": null, "description": "Finalize com raspas de chocolate 70%."}, {"title": null, "description": "Receita pratica e deliciosa!"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'biscoitinhos-de-banana-e-aveia', 'Biscoitinhos de banana e aveia', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 38. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 38. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Biscoitinhos de banana e aveia', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 38. Conteúdo importado para revisão editorial.',
    1, 0, 9, '9 Biscoitos médios', 'EASY',
    '[{"quantity": null, "unit": null, "name": "2 bananas prata bem maduras amassadas", "note": null}, {"quantity": null, "unit": null, "name": "1 de xícara de aveia em flocos", "note": null}, {"quantity": null, "unit": null, "name": "canela a gosto", "note": null}]'::jsonb, '[{"title": null, "description": "Misture todos os ingredientes"}, {"title": null, "description": "Faça formatos de biscoito"}, {"title": null, "description": "Polvilhe canela a gosto por cima. Disponha em um tabuleiro forrado com papel manteiga. Leve ao forno pré-aquecido por 20 min ou até ficar dourado na parte debaixo. Após pronto pode consumir também com mel ou geleia de sua preferência."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'sementinhas-de-abobora-torradas', 'Sementinhas de abóbora torradas', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 40. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 40. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Sementinhas de abóbora torradas', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 40. Conteúdo importado para revisão editorial.',
    20, 0, 4, '4 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Sementes de meia abóbora grande,", "note": null}, {"quantity": null, "unit": null, "name": "enxaguadas e secas", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de Azeite de oliva", "note": null}, {"quantity": null, "unit": null, "name": "Pimenta preta moída", "note": null}, {"quantity": null, "unit": null, "name": "Sal", "note": null}]'::jsonb, '[{"title": null, "description": "Retire as sementes da abóbora com uma colher e separe. Lave as sementes bem retirando qualquer parte da abobora que possa ter ficado. Deixe secar bem ou seque com auxilio de um papal toalha ou pano limpo."}, {"title": null, "description": "Pre aqueça o forno a 180ºC."}, {"title": null, "description": "Disponha as sementes num tabuleiro e acrescente o azeite, a pimenta preta e o sal a gosto, misture bem para que todas as sementes sejam temperadas. Arrume as sementes temperadas no tabuleiro para que não fiquem muito juntas. Deixe no forno por aproximadamente 15 min, ou ate ficarem torradas e coradas."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'barrinhas-de-cereal-vapt-vupt', 'Barrinhas de cereal vapt-vupt', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 42. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 42. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Barrinhas de cereal vapt-vupt', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 42. Conteúdo importado para revisão editorial.',
    45, 0, 4, '4 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "2 bananas prata bem maduras.", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de farinha de aveia", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de açúcar mascavo", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de castanhas cruas e amêndoas cruas trituradas", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de farinha de linhaça", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de coco ralado sem açúcar", "note": null}]'::jsonb, '[{"title": null, "description": "Amasse as duas bananas numa tigela e acrescente os demais ingredientes. Misture tudo com as mãos ate formar uma massa homogênea"}, {"title": null, "description": "Leve para assar numa assadeira forrada com papel manteiga em forno pré –aquecido a 180ºc por cerca de 30 min ."}, {"title": null, "description": "As barrinhas são ótima opção de lanche , alem de serem deliciosas!\\"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'biscoitinhos-de-mel', 'Biscoitinhos de mel', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 44. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 44. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Biscoitinhos de mel', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 44. Conteúdo importado para revisão editorial.',
    50, 0, 30, '30 unidades aproximadamente,', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 ovo", "note": null}, {"quantity": null, "unit": null, "name": "3 colheres de sopa de óleo de coco", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de mel orgânico", "note": null}, {"quantity": null, "unit": null, "name": "½ xícara de chá de açúcar mascavo ou demerara", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de fermento químico em pó", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de linhaça dourada", "note": null}, {"quantity": null, "unit": null, "name": "½ xícara de chá de polvilho doce", "note": null}, {"quantity": null, "unit": null, "name": "½ xícara de chá de amido de milho", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de farinha de araruta ou farinha de arroz", "note": null}, {"quantity": null, "unit": null, "name": "papel manteiga.", "note": null}]'::jsonb, '[{"title": null, "description": "Coloque em um recipiente o ovo, o óleo e o mel. Bata bem com auxílio de um garfo. Acrescente os demais ingredientes aos poucos, principalmente o amido de milho (para que a massa não fique grudenta), misturando com auxílio de uma espátula até homogeneizar a massa. Forre uma assadeira com papel manteiga e reserve."}, {"title": null, "description": "Preaqueça o forno convencional."}, {"title": null, "description": "BISCOITINHOS DE MEL - Com o auxílio de 2 colheres de chá, faça bolinhas bem pequenas (cerca de 1 cm de diâmetro), coloque- as sobre o papel manteiga e deixe-as bem espaçadas, pois, com o calor do forno, elas irão se desmanchar e formar pequenos biscoitos. - Leve para assar. Assim que dourar embaixo, retire do forno. Com auxílio de uma espátula, descole os biscoitos (ainda quentes) do papel manteiga, tomando cuidado para não desmanchar. Espere esfriar e guarde-os numa lata ou outro recipiente bem fechado para que não amoleçam."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'salada-de-bacalhau-com-feijao-fradinho-e-banana-da-terra', 'Salada de bacalhau com feijão fradinho e banana da terra', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 48. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 48. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Salada de bacalhau com feijão fradinho e banana da terra', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 48. Conteúdo importado para revisão editorial.',
    60, 0, 4, 'para amenizar o sabor ardido', 'EASY',
    '[{"quantity": null, "unit": null, "name": "500 g de bacalhau dessalgado,", "note": null}, {"quantity": null, "unit": null, "name": "desfiado e congelado", "note": null}, {"quantity": null, "unit": null, "name": "2 xícaras (chá) de feijão-fradinho", "note": null}, {"quantity": null, "unit": null, "name": "3 bananas-da-terra", "note": null}, {"quantity": null, "unit": null, "name": "1 cebola roxa", "note": null}, {"quantity": null, "unit": null, "name": "1/3 de xícara (chá) de pimenta", "note": null}, {"quantity": null, "unit": null, "name": "biquinho em conserva", "note": null}, {"quantity": null, "unit": null, "name": "1 colher (chá) de óleo", "note": null}, {"quantity": null, "unit": null, "name": "1/4 de xícara (chá) de azeite orgânico", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres (sopa) de vinagre de vinho", "note": null}, {"quantity": null, "unit": null, "name": "branco", "note": null}, {"quantity": null, "unit": null, "name": "1/2 xícara (chá) de folhas de coentro,", "note": null}, {"quantity": null, "unit": null, "name": "sal e pimenta-do-reino moída na hora", "note": null}, {"quantity": null, "unit": null, "name": "a gosto.", "note": null}]'::jsonb, '[{"title": null, "description": "Na panela de pressão, coloque o feijão-fradinho e cubra com água - não ultrapasse o volume máximo de 2/3 da panela. Tampe e leve ao fogo alto para cozinhar. Assim que começar a apitar, diminua o fogo e deixe cozinhar por mais 10 minutos. - Desligue o fogo e, com a ajuda de um garfo, levante a válvula para tirar a pressão. Espere toda a pressão sair e a panela parar de apitar antes de abrir a tampa. Transfira o feijão para uma peneira e passe sob a água fria para interromper o cozimento. Deixe escorrer bem a água sobre uma tigela. - Leve ao fogo alto uma panela média com água. Assim que ferver, mergulhe o bacalhau e deixe descongelar e cozinhar ao mesmo tempo por cerca de 15 minutos. Enquanto isso, prepare os outros ingredientes. - Descasque a cebola e corte em cubos pequenos. Transfira para uma tigela e cubra com água fria - isso"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'nhoque-de-baroa-com-molho-de-manteiga-e-salvia-salada-especial', 'Nhoque de baroa com molho de manteiga e sálvia + Salada especial', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 50. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 50. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Nhoque de baroa com molho de manteiga e sálvia + Salada especial', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 50. Conteúdo importado para revisão editorial.',
    120, 0, 4, NULL, 'EASY',
    '[{"quantity": null, "unit": null, "name": "1,2kg de batata baroa", "note": null}, {"quantity": null, "unit": null, "name": "2 gemas", "note": null}, {"quantity": null, "unit": null, "name": "1 e 1/4 xícara (chá) de farinha de trigo", "note": null}, {"quantity": null, "unit": null, "name": "100g de manteiga", "note": null}, {"quantity": null, "unit": null, "name": "Sálvia a gosto", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de sal", "note": null}, {"quantity": null, "unit": null, "name": "Farinha de trigo para polvilhar a", "note": null}, {"quantity": null, "unit": null, "name": "bancada.", "note": null}]'::jsonb, '[{"title": null, "description": "Lave, descasque e corte cada mandioquinha em 3 pedaços. Transfira para uma panela grande e cubra com água. Leve ao fogo alto. Assim que ferver, diminua o fogo e deixe cozinhar por mais 15 minutos, até ficarem macias - espete com um garfo para verificar o ponto. - Transfira as mandioquinhas para uma peneira e deixe escorrer bem a água. Passe as mandioquinhas, ainda quentes, por um espremedor de batatas e tempere com o sal. - Acrescente ¼ de xícara (chá) da farinha de trigo para resfriar a mandioquinha. Adicione as gemas e amasse bem. Junte o restante da farinha aos poucos, até dar ponto - Para modelar os nhoques: polvilhe a bancada com farinha de trigo."}, {"title": null, "description": "Retire uma porção de massa e, com as mãos, faça rolinhos, corte em pedaços pequenos. Transfira os nhoques para uma assadeira grande (ou refratário) polvilhada com farinha e reserve."}, {"title": null, "description": "Repita o processo com toda a massa. - Leve uma panela grande com água ao fogo alto. Assim que a água ferver, adicione 1 colher (sopa) de sal. - Com uma escumadeira, mergulhe os nhoques na água fervente. Deixe cozinhar até subirem à superfície."}, {"title": null, "description": "Retire os nhoques, escorrendo bem a água pela escumadeira e transfira para a assadeira untada com óleo. Cozinhe o restante dos nhoques e não despreze a água do cozimento - ela vai ser utilizada para fazer o molho."}, {"title": null, "description": "NHOQUE DE BAROA COM MOLHO DE MANTEIGA E SÁLVIA + SALADA ESPECIAL"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'picadinho-a-jardineira-com-farofa-de-beterraba', 'Picadinho à jardineira com farofa de beterraba', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 56. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 56. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Picadinho à jardineira com farofa de beterraba', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 56. Conteúdo importado para revisão editorial.',
    35, 0, 4, '(preparação): 4 porções', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 56"}]'::jsonb, '[{"title": null, "description": "Descasque e rale a beterraba, depois reserve. Em uma frigideira antiaderente, aqueça o azeite e adicione a cebola picada e depois o alho amassado. Refogue até dourar. Adicione a beterraba aos poucos e espalhe bem na panela para que ela possa secar um pouco. Tempere com sal e pimenta do reino. Por último, adicione aos poucos a farinha de mandioca e mexa até que esteja tudo incorporado e que ela torre levemente."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'empadao-de-grao-de-bico', 'Empadão de grão de bico', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 58. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 58. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Empadão de grão de bico', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 58. Conteúdo importado para revisão editorial.',
    1, 0, 4, '4 pedaços', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 58"}]'::jsonb, '[{"title": null, "description": "Revisar o modo de preparo na página 58 do livro."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'arroz-com-couve-flor-frango-com-pimentoes', 'Arroz com couve-flor + frango com pimentões', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 60. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 60. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Arroz com couve-flor + frango com pimentões', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 60. Conteúdo importado para revisão editorial.',
    1, 0, 4, '4 pratos', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 xícara de arroz integral (ou mix de", "note": null}, {"quantity": null, "unit": null, "name": "cereais),", "note": null}, {"quantity": null, "unit": null, "name": "½ couve-flor, 1 folha da couve-flor", "note": null}, {"quantity": null, "unit": null, "name": "grande(ou duas pequenas),", "note": null}, {"quantity": null, "unit": null, "name": "½ cebola picada,", "note": null}, {"quantity": null, "unit": null, "name": "1 dente de alho espremido ou socado,", "note": null}, {"quantity": null, "unit": null, "name": "óleo e sal a gosto.", "note": null}, {"quantity": null, "unit": null, "name": "1 peito de frango médio,", "note": null}, {"quantity": null, "unit": null, "name": "½ cebola,", "note": null}, {"quantity": null, "unit": null, "name": "1 dente de alho,", "note": null}, {"quantity": null, "unit": null, "name": "½ pimentão vermelho,", "note": null}, {"quantity": null, "unit": null, "name": "½ pimentão amarelo,", "note": null}, {"quantity": null, "unit": null, "name": "sal e ervas (usei orégano fresco)", "note": null}]'::jsonb, '[{"title": null, "description": "em uma panela cozinhar o arroz com 3 a 4 xícaras de água, e deixar descansar por 10miniutos. Lavar a couve-flor e a folha, e processar no processador ou picar em pedaços bem pequenos."}, {"title": null, "description": "Em outra panela refogar em pouco óleo a cebola, o alho e a couve-flor processada, nesta ordem. Por fim juntar o arroz à couve-flor refogada e misturar (ainda com o forno ligado) até ficar uma mistura homogênea."}, {"title": null, "description": "ARROZ COM COUVE-FLOR + FRANGO COM PIMENTÕES"}, {"title": null, "description": "Frango com pimentões"}, {"title": null, "description": "Modo de preparo:limpar o peito de frango e cortar em cubos. Picar a cebola e os pimentões em tiras. Refogar a cebola, o alho, o frango e os pimentões, nessa ordem. Temperar com ervas e sal."}, {"title": null, "description": "limpar o peito de frango e cortar em cubos. Picar a cebola e os pimentões em tiras. Refogar a cebola, o alho, o frango e os pimentões, nessa ordem. Temperar com ervas e sal."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'escondidinho-de-baroa-ao-creme-de-frango', 'Escondidinho de baroa ao creme de frango', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 62. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 62. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Escondidinho de baroa ao creme de frango', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 62. Conteúdo importado para revisão editorial.',
    40, 0, 4, '4 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 62"}]'::jsonb, '[{"title": null, "description": "Revisar o modo de preparo na página 62 do livro."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'salada-de-atum-com-quinoa-no-pote', 'Salada de atum com quinoa no pote', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 64. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 64. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Salada de atum com quinoa no pote', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 64. Conteúdo importado para revisão editorial.',
    30, 0, 1, '1 porção', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Atum sem sal em pedaços – 1 lata", "note": null}, {"quantity": null, "unit": null, "name": "Quinoa em grãos - ½ xícara", "note": null}, {"quantity": null, "unit": null, "name": "Suco de limão siciliano- 1 limão", "note": null}, {"quantity": null, "unit": null, "name": "Espinafre refogado – 2 xícaras", "note": null}, {"quantity": null, "unit": null, "name": "Dill – 1 colher de sopa", "note": null}, {"quantity": null, "unit": null, "name": "Molho de mostarda – 1 colher de chá", "note": null}]'::jsonb, '[{"title": null, "description": "cozinhe a quinoa e reserve. Em seguida refogue o espinafre e reserve. Misture o atum com o molho de mostarda, suco de limão e a quinoa."}, {"title": null, "description": "Coloque no pote a mistura por baixo e as folhas de espinafre por cima."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'bolo-de-cenoura-da-vovo', 'Bolo de cenoura da vovó', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 68. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 68. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Bolo de cenoura da vovó', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 68. Conteúdo importado para revisão editorial.',
    60, 0, 4, 'aproximadamente', 'EASY',
    '[{"quantity": null, "unit": null, "name": "3 ovos", "note": null}, {"quantity": null, "unit": null, "name": "4 cenouras pequenas ou 2 grandes", "note": null}, {"quantity": null, "unit": null, "name": "1 xícara de açúcar de coco ou (mascavo", "note": null}, {"quantity": null, "unit": null, "name": "ou demerara)", "note": null}, {"quantity": null, "unit": null, "name": "1 xícara de fubá orgânico", "note": null}, {"quantity": null, "unit": null, "name": "1/2 xícara de farinha de amêndoas", "note": null}, {"quantity": null, "unit": null, "name": "1/2 xícara de farinha de arroz", "note": null}, {"quantity": null, "unit": null, "name": "1/2 xícara de óleo de coco", "note": null}, {"quantity": null, "unit": null, "name": "1 punhado de nozes", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de canela em pó", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de cravo da Índia", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de fermento em pó.", "note": null}, {"quantity": null, "unit": null, "name": "BOLO DE CENOURA DA VOVÓ", "note": null}]'::jsonb, '[{"title": null, "description": "bata tudo no liquidificador - primeiro os ovos e o açúcar. Coloque os ingredientes aos poucos. Asse em forno pré-aquecido 180º por 35 a 40 minutos."}, {"title": null, "description": "Cobertura: 200 g de sobras de chocolate,1 copo de leite de coco, 1 colher de chá de canela em pó. Leve a panela fogo baixo até engrossar."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'pao-de-queijo-de-mandioquinha', 'Pão de queijo de mandioquinha', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 70. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 70. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Pão de queijo de mandioquinha', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 70. Conteúdo importado para revisão editorial.',
    60, 0, 30, '30 bolinhas pequenas (aproximadamente)', 'EASY',
    '[{"quantity": null, "unit": null, "name": "200g de polvilho azedo", "note": null}, {"quantity": null, "unit": null, "name": "300g de polvilho doce", "note": null}, {"quantity": null, "unit": null, "name": "150ml de azeite de oliva", "note": null}, {"quantity": null, "unit": null, "name": "500g de mandioquinha", "note": null}, {"quantity": null, "unit": null, "name": "1/2 de xícara de água", "note": null}, {"quantity": null, "unit": null, "name": "sal", "note": null}, {"quantity": null, "unit": null, "name": "opcional: chia, alecrim ou outros.", "note": null}]'::jsonb, '[{"title": null, "description": "Cozinhar a mandioquinha em água e fazer um purê. Com a água que sobrou da mandioquinha medir ½ xícara e aquecer novamente com o azeite até ferver. Misturar o polvilho doce, o azedo, sal e ervas em uma tigela grande. Despejar a água com o óleo ainda quente na tigela e misturar bem."}, {"title": null, "description": "Acrescentar o purê de mandioquinha e misturar com as mãos até ficar uma massa homogênea. Pré-aquecer o forno (10 minutos) a 180ºC. Untar com um pouco de óleo, colocar os pães em uma assadeira e pôr no forno por 20 a 25 minutos."}, {"title": null, "description": "PÃO DE QUEIJO DE MANDIOQUINHA"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'biscoitinhos-de-aveia-com-creme-de-cacau', 'Biscoitinhos de aveia com creme de cacau', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 72. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 72. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Biscoitinhos de aveia com creme de cacau', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 72. Conteúdo importado para revisão editorial.',
    50, 0, 20, '20 biscoitinhos', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 72"}]'::jsonb, '[{"title": null, "description": "Revisar o modo de preparo na página 72 do livro."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'muffin-de-ricota-com-tomatinho', 'Muffin de ricota com tomatinho', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 74. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 74. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Muffin de ricota com tomatinho', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 74. Conteúdo importado para revisão editorial.',
    40, 0, 4, NULL, 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 74"}]'::jsonb, '[{"title": null, "description": "Retire a película que recobre as gemas e bata os ovos com um fuê até dobrar de volume. Agregue a farinha aos poucos e por último acrescente o fermento. Em uma peneira coloque o tomate picadinho e acrescente o sal, vá mexendo com uma colher para o tomate ir drenando a água. Adicione o cottage e reserve. Encha as forminhas de silicone até a metade com a massa, acrescente o recheio e finalize com mais massa. Leve ao forno pré-aquecido em 200 graus por cerca de 25 minutos ou até que fiquem dourados. Sirva morno."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'cuca-crocante-integral', 'Cuca crocante integral', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 76. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 76. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Cuca crocante integral', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 76. Conteúdo importado para revisão editorial.',
    75, 0, 1, '1 tabuleiro 20x30cm', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 76"}]'::jsonb, '[{"title": null, "description": "Misture a manteiga, os ovos e o açúcar até obter um creme, depois acrescente a farinha, as bananas, o leite, o sal, as castanhas e o fermento. Disponha a massa em uma forma untada e enfarinhada. Em seguida, disponha as bananas fatiadas por cima da massa. Leve ao forno previamente aquecido a 180 graus por 40 minutos aproximadamente. Em uma panela ou frigideira antiaderente, coloque a manteiga ghee ou óleo de coco com o açúcar para caramelizar, após, adicione os demais ingredientes e mexa bem. Retire a farofa pronta e coloque por cima do bolo."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'chips-de-legumes', 'Chips de legumes', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 78. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 78. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Chips de legumes', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 78. Conteúdo importado para revisão editorial.',
    30, 0, 4, '4 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 beterraba média", "note": null}, {"quantity": null, "unit": null, "name": "1 batata doce amarela", "note": null}, {"quantity": null, "unit": null, "name": "1 batata doce roxa", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de azeite", "note": null}, {"quantity": null, "unit": null, "name": "Sal e pimenta do reino moída a gosto", "note": null}]'::jsonb, '[{"title": null, "description": "lave as batatas doces e a beterraba."}, {"title": null, "description": "Ligue o forno na temperatura média-alta. Fatie bem fino, em rodelas, todos os tubérculos numa mandolina ou fatiador de legumes. Coloque um fio de azeite em duas assadeiras e disponha cada rodela, sem amontoar umas nas outras e jogue sal e pimenta do reino Leve ao forno por cerca de 10 minutos ou até que elas sequem. Retire com ajuda de uma espátula. Sirva imediatamente"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'panqueca-doce-de-forno', 'Panqueca doce de forno', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 80. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 80. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Panqueca doce de forno', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 80. Conteúdo importado para revisão editorial.',
    20, 0, 4, 'duas pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 xícara de farinha de arroz", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de azeite", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sobremesa de gergelim", "note": null}, {"quantity": null, "unit": null, "name": "Sal a gosto", "note": null}, {"quantity": null, "unit": null, "name": "Água morna", "note": null}, {"quantity": null, "unit": null, "name": "1 banana prata", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sobremesa de mel", "note": null}]'::jsonb, '[{"title": null, "description": "Misture os ingredientes, com exceção da água, que deve ser adicionada aos poucos para dar liga à massa. O ponto certo é quando ela não estiver mais esfarelando. Sove a massa por 3 minutos. Abra a massa, porcione e coloque em uma assadeira untada com azeite. Leve ao forno pré-aquecido a 180 graus por cerca de 10 minutos. Depois de pronto adicione a banana e o mel."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'ensopado-vegetariano', 'Ensopado vegetariano', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 84. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 84. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Ensopado vegetariano', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 84. Conteúdo importado para revisão editorial.',
    10, 0, 4, 'as folhas para servir', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 couve-flor pequena", "note": null}, {"quantity": null, "unit": null, "name": "1 batata-doce rosada média", "note": null}, {"quantity": null, "unit": null, "name": "1/4 de abóbora japonesa pequena", "note": null}, {"quantity": null, "unit": null, "name": "1 lata de grão-de-bico cozido", "note": null}, {"quantity": null, "unit": null, "name": "1 cebola", "note": null}, {"quantity": null, "unit": null, "name": "2 tomates maduros", "note": null}, {"quantity": null, "unit": null, "name": "2 dentes de alho", "note": null}, {"quantity": null, "unit": null, "name": "1 copo americano de leite de coco (cerca", "note": null}, {"quantity": null, "unit": null, "name": "de 200 ml) de preferência caseiro", "note": null}, {"quantity": null, "unit": null, "name": "2 xícaras de chá de água", "note": null}, {"quantity": null, "unit": null, "name": "4 talos de coentro com a raiz", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de óleo", "note": null}, {"quantity": null, "unit": null, "name": "1/2 colher de chá de semente de coentro", "note": null}, {"quantity": null, "unit": null, "name": "1/2 colher de chá de semente de cominho", "note": null}, {"quantity": null, "unit": null, "name": "1/2 colher de chá de pimenta-de-caiena", "note": null}, {"quantity": null, "unit": null, "name": "1/2 colher de chá de cúrcuma", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de sal.", "note": null}, {"quantity": null, "unit": null, "name": "ENSOPADO VEGETARIANO", "note": null}]'::jsonb, '[{"title": null, "description": "Descasque e pique fino o alho e a cebola"}, {"title": null, "description": "descasque e corte a batata doce em cubos médios"}, {"title": null, "description": "descasque a abóbora, descarte as sementes e corte a polpa em cubos pequenos"}, {"title": null, "description": "retire a pele dos tomates, descarte as sementes e pique fino a polpa"}, {"title": null, "description": "descarte as folhas, corte a couve-flor em floretes e deixe de molho em água fria, passando por água corrente"}, {"title": null, "description": "lave e seque o coentro, pique fino os talos e a raiz e reserve as folhas para servir. - Leve uma caçarola média para aquecer em fogo baixo. Enquanto isso, quebre as sementes de coentro e cominho num pilão ou pique fino com a faca. Regue o óleo na panela, junte as sementes e mexa apenas para perfumar. - Acrescente a cebola e o coentro (talos e raiz) e refogue até murchar."}, {"title": null, "description": "Adicione o restante das especiarias, o sal e misture bem. Acrescente o alho e mexa por mais 1 minuto."}, {"title": null, "description": "Junte os tomates picados. Misture e amasse com a espátula para formar uma pastinha. - Regue com a água e o leite de coco, misture raspando bem o fundo da panela para dissolver todo o sabor. Aumente o fogo e deixe cozinhar até ferver. - Enquanto isso, retire os floretes da água. Assim que o ensopado começar a ferver, junte a batata doce, a abóbora e a couve-flor. Abaixe o fogo e deixe cozinhar por 15 minutos com a tampa entreaberta. - Numa peneira, escorra o grão-de- bico e misture aos legumes cozidos."}, {"title": null, "description": "Deixe cozinhar por mais 5 minutos - a ideia é que os legumes fiquem macios e a abóbora desmanche para engrossar o molho. - Desligue o fogo e sirva a seguir, salpicado com as folhas de coentro."}, {"title": null, "description": "Pão indiano e branco são ótimos acompanhamentos."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'linguado-com-crosta-de-castanhas', 'Linguado com crosta de castanhas', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 86. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 86. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Linguado com crosta de castanhas', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 86. Conteúdo importado para revisão editorial.',
    60, 0, 4, '4 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "4 filés de linguado", "note": null}, {"quantity": null, "unit": null, "name": "Limão, sal e pimenta do reino a gosto", "note": null}, {"quantity": null, "unit": null, "name": "3 colheres de sopa de coentro picado", "note": null}, {"quantity": null, "unit": null, "name": "1/2 xícara de chá de castanha de caju", "note": null}, {"quantity": null, "unit": null, "name": "1/2 xícara de chá de amêndoas", "note": null}, {"quantity": null, "unit": null, "name": "4 colheres de sopa de farinha de linhaça dourada", "note": null}, {"quantity": null, "unit": null, "name": "Coentro picadinho a gosto", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de mostarda", "note": null}]'::jsonb, '[{"title": null, "description": "Temperar os filés com limão, sal, pimenta e coentro. Triturar as castanhas e amêndoas no processador e deixar alguns pedacinhos. Misturar às castanhas trituradas a farinha de linhaça e um pouco do coentro picado. Passar a mostarda nos filés e em seguida passar na mistura de castanhas."}, {"title": null, "description": "Dispor os filés em uma assadeira forrada com papel asse leve com o lado brilhoso voltado para o peixe. Levar ao forno baixo por cerca de 25 minutos (ou até que a crosta esteja dourada)."}, {"title": null, "description": "LINGUADO COM CROSTA DE CASTANHAS"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'quibe-vegano-de-abobora-com-quinoa-salada-especial', 'Quibe vegano de abóbora com quinoa + Salada especial', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 88. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 88. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Quibe vegano de abóbora com quinoa + Salada especial', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 88. Conteúdo importado para revisão editorial.',
    90, 0, 8, '8 pessoas (16 pedaços pequenos)', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 colher de sopa de manteiga de azeite", "note": null}, {"quantity": null, "unit": null, "name": "100g de quinoa = ½ xícara (rende 2 xícaras de quinoa cozida)", "note": null}, {"quantity": null, "unit": null, "name": "900 g de abóbora japonesa = ½ unidade média = 2", "note": null}, {"quantity": null, "unit": null, "name": "xícaras de abóbora assada e amassada", "note": null}, {"quantity": null, "unit": null, "name": "1 alho-poró inteiro cortado em fatias finas", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de café de páprica picante", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de café de cominho em pó", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de sal", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de gengibre fresco ralado", "note": null}, {"quantity": null, "unit": null, "name": "Azeite de oliva para untar", "note": null}, {"quantity": null, "unit": null, "name": "Farinha de mandioca para polvilhar", "note": null}, {"quantity": null, "unit": null, "name": "Cebolinha picadinha a gosto", "note": null}]'::jsonb, '[{"title": null, "description": "Lave a quinoa em uma peneirae cozinhe em fogo médio com 2 xícaras de chá de água por cerca 30 minutos ou até que estaevapore completamente. Enquanto a quinoa cozinha, envolva a abóbora em papel manteiga, coloque-a em uma assadeira, leve ao forno a 180º deixando assar por cerca de 1 hora. Bata-a no liquidificador ou amasse com um garfo e reserve. Em uma panela, esquente a manteiga de azeite, coloque o gengibre e refogue."}, {"title": null, "description": "Adicione os temperos em pó e o alho-poró, refogando-o até ficar bem dourado. Junte a abóbora e acrescente o sal. Misture tudo com a quinoa e coloque em uma assadeira refratária untada azeite e polvilhada com uma fina camada de farinha de mandioca. Leve ao forno pré- aquecido a 180 graus por cerca de 30 minutos. Salpique a cebolinha fresca sobre o prato e sirva morno."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'sufle-colorido-de-frango', 'Suflê colorido de frango', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 90. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 90. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Suflê colorido de frango', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 90. Conteúdo importado para revisão editorial.',
    45, 0, 20, 'Tabuleiro 20x20cm', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 brócolis (ramos)cozido", "note": null}, {"quantity": null, "unit": null, "name": "1 cenoura média cozida", "note": null}, {"quantity": null, "unit": null, "name": "½ beterraba cozida ralada", "note": null}, {"quantity": null, "unit": null, "name": "3 colheres de sopa cheias de vagem", "note": null}, {"quantity": null, "unit": null, "name": "cozida", "note": null}, {"quantity": null, "unit": null, "name": "2 filés de peito de frango pequenos", "note": null}, {"quantity": null, "unit": null, "name": "cozido e desfiado", "note": null}, {"quantity": null, "unit": null, "name": "½ cebola picada", "note": null}, {"quantity": null, "unit": null, "name": "2 dentes de alho amassados", "note": null}, {"quantity": null, "unit": null, "name": "3 ovos", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de azeite", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de farinha de", "note": null}, {"quantity": null, "unit": null, "name": "arroz", "note": null}, {"quantity": null, "unit": null, "name": "100 mL de água", "note": null}, {"quantity": null, "unit": null, "name": "Sal a gosto", "note": null}, {"quantity": null, "unit": null, "name": "Cheiro verde a gosto", "note": null}]'::jsonb, '[{"title": null, "description": "Separe os ramos do brócolis, corte a cenoura em cubos pequenos e rale a beterraba. Em uma panela, doure a cebola e o alho no azeite e em seguida adicione o frango desfiado, os legumes, depois adicione a farinha de arroz, a água e por último o cheiro verde. Apague o fogo, e depois incorpore as gemas à massa e adicione sal, se necessário. Bata as claras em neve e posteriormente ,com cuidado, incorpore as claras à massa. Disponha a massa em um recipiente e leve ao fogo alto por aproximadamente 30 min."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'sopa-de-legumes', 'Sopa de legumes', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 92. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 92. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Sopa de legumes', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 92. Conteúdo importado para revisão editorial.',
    1, 0, 8, '8 pratos', 'EASY',
    '[{"quantity": null, "unit": null, "name": "3 colheres de sopa de óleo", "note": null}, {"quantity": null, "unit": null, "name": "½ cebola picada", "note": null}, {"quantity": null, "unit": null, "name": "1 tomate grande picado", "note": null}, {"quantity": null, "unit": null, "name": "1 pedaço de peito médio", "note": null}, {"quantity": null, "unit": null, "name": "(250g)", "note": null}, {"quantity": null, "unit": null, "name": "1L de água", "note": null}, {"quantity": null, "unit": null, "name": "2 cenouras picadas em cubos", "note": null}, {"quantity": null, "unit": null, "name": "2 chuchus picados em cubos", "note": null}, {"quantity": null, "unit": null, "name": "3 unidades de inhame picados", "note": null}, {"quantity": null, "unit": null, "name": "em cubos", "note": null}, {"quantity": null, "unit": null, "name": "1 maço de agrião", "note": null}, {"quantity": null, "unit": null, "name": "sal e ervas a gosto.", "note": null}]'::jsonb, '[{"title": null, "description": "Refogar no óleo a cebola, o tomate e o frango"}, {"title": null, "description": "acrescentando os ingredientes nesta ordem. Adicionar a cenoura e metade da água (pode ferver antes de colocar), em seguida o chuchu, o resto da água, depois o inhame e o sal. Deixar cozinhar até os legumes ficarem macios."}, {"title": null, "description": "Bater metade dos legumes no liquidificador, para engrossar."}, {"title": null, "description": "Desfiar o frango e juntar, por último, o agrião. Cozinhar até o agrião murchar. Servir quente."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'espaguete-de-abobrinha', 'Espaguete de abobrinha', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 94. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 94. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Espaguete de abobrinha', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 94. Conteúdo importado para revisão editorial.',
    30, 0, 2, '2 pessoas como prato', 'EASY',
    '[{"quantity": null, "unit": null, "name": "2 dentes de alho fatiados", "note": null}, {"quantity": null, "unit": null, "name": "4 abobrinhas médias com casca", "note": null}, {"quantity": null, "unit": null, "name": "cortadas em lâminas finas (como se", "note": null}, {"quantity": null, "unit": null, "name": "fosse espaguete)", "note": null}, {"quantity": null, "unit": null, "name": "1 cebola pequena picada", "note": null}, {"quantity": null, "unit": null, "name": "1 xícara (chá) de polpa de tomate", "note": null}, {"quantity": null, "unit": null, "name": "1 tomate sem semente picado", "note": null}, {"quantity": null, "unit": null, "name": "Manjericão a gosto", "note": null}, {"quantity": null, "unit": null, "name": "(aproximadamente ½ unidade)", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de azeite de oliva", "note": null}, {"quantity": null, "unit": null, "name": "extra virgem", "note": null}, {"quantity": null, "unit": null, "name": "Sal a gosto (aproximadamente 2", "note": null}, {"quantity": null, "unit": null, "name": "colheres de chá)", "note": null}, {"quantity": null, "unit": null, "name": "10 colheres de sopa de amêndoas", "note": null}, {"quantity": null, "unit": null, "name": "em lâminas", "note": null}]'::jsonb, '[{"title": null, "description": "Lave bem a abobrinha e, com casca mesmo, passe ela de ponta a ponta pelo ralador grosso, até chegar na parte das sementes, formando assim o espaguete. Em uma panela doure levemente o alho em um fio de azeite, acrescente a abobrinha e o sal, salteie por cerca de 3 minutos e reserve. Prepare o molho: Em uma panela, doure a cebola em um fio de azeite, despeje e deixe aquecer até que polpa de tomate comece a ferver, acrescente o tomate picado, mexa devagar, desligue o fogo, adicione as folhas de manjericão e ajuste o sal. Monte o espaguete em formato de ninho e coloque o molho de tomate no centro. Decore com amêndoas em laminas."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'omelete-funcional-colorido', 'Omelete funcional colorido', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 96. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 96. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Omelete funcional colorido', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 96. Conteúdo importado para revisão editorial.',
    20, 0, 4, '4 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "½ tomate sem semente picado", "note": null}, {"quantity": null, "unit": null, "name": "3 rodelas finas de alho-poró", "note": null}, {"quantity": null, "unit": null, "name": "¼ de cebola roxa picadinha", "note": null}, {"quantity": null, "unit": null, "name": "2 aspargos frescos", "note": null}, {"quantity": null, "unit": null, "name": "2 claras de ovo", "note": null}, {"quantity": null, "unit": null, "name": "1 gema de ovo", "note": null}, {"quantity": null, "unit": null, "name": "Sal a gosto", "note": null}, {"quantity": null, "unit": null, "name": "Pimenta-do-reino moída a gosto.", "note": null}]'::jsonb, '[{"title": null, "description": "Ferva a água. Adicione os aspargos. Aguarde dois minutos, retire e pique em pedaços. Misture os ovos em uma tigela. Junte o tomate, o alho- poró, a cebola roxa, o sal e apimenta. Mexa bem."}, {"title": null, "description": "Aqueça uma frigideira com um fio de azeite."}, {"title": null, "description": "Despeje o conteúdo e tampe. Aguarde dois minutos e vire do outro lado. Doure e sirva."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'abacate-com-limao-e-mel', 'Abacate com limão e mel', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 100. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 100. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Abacate com limão e mel', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 100. Conteúdo importado para revisão editorial.',
    5, 0, 4, '4 porções', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 unidade de abacate", "note": null}, {"quantity": null, "unit": null, "name": "Mel (a gosto)", "note": null}, {"quantity": null, "unit": null, "name": "limão espremido (a gosto)", "note": null}]'::jsonb, '[{"title": null, "description": "Cortar o abacate em rodelas e retirar a casca, acrescentar o limão e o mel."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'sagu-funcional-de-chia-com-alfarroba', 'Sagu funcional de chia com alfarroba', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 102. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 102. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Sagu funcional de chia com alfarroba', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 102. Conteúdo importado para revisão editorial.',
    35, 0, 1, '1 porção', 'EASY',
    '[{"quantity": null, "unit": null, "name": "2 colheres de sopa de semente de chia", "note": null}, {"quantity": null, "unit": null, "name": "½ xícara de chá de leite de coco", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de alfarroba", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sobremesa de açúcar mascavo", "note": null}]'::jsonb, '[{"title": null, "description": "Misture os ingredientes e deixe à temperatura ambiente por 30 minutos para formar um gel e depois leve à geladeira."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'banana-quentinha-com-canela', 'Banana quentinha com canela', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 104. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 104. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Banana quentinha com canela', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 104. Conteúdo importado para revisão editorial.',
    5, 0, 1, '1 banana', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 banana", "note": null}, {"quantity": null, "unit": null, "name": "1 colher", "note": null}, {"quantity": null, "unit": null, "name": "de chá de canela em pó", "note": null}]'::jsonb, '[{"title": null, "description": "cortar a banana em tiras e espalhar 1/2 colher de chá de canela em pó em cada tira da banana. Colocar no microondas por 1 a 2 minutos."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'nuts-caramelizadas', 'Nuts caramelizadas', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 106. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 106. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Nuts caramelizadas', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 106. Conteúdo importado para revisão editorial.',
    30, 0, 6, '6 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1/2 xícara de chá amêndoas cruas", "note": null}, {"quantity": null, "unit": null, "name": "1/2 xícara de chá de castanha de caju cruas", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de açúcar mascavo", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de manteiga ou manteiga ghee", "note": null}, {"quantity": null, "unit": null, "name": "canela a gosto", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de amaranto em grãos.", "note": null}]'::jsonb, '[{"title": null, "description": "Picar as amêndoas e a castanha de caju grosseiramente ou passar em um processador se preferir"}, {"title": null, "description": "Em uma frigideira derreter a manteiga e adicionar o açúcar mascavo"}, {"title": null, "description": "Assim que o açúcar começar a absorver a manteiga e “derreter” adicionar um pouquinho de água e mexer"}, {"title": null, "description": "Rapidamente adicionar as nuts e a canela a gosto e mexer bem"}, {"title": null, "description": "finalizar com amaranto em grão."}, {"title": null, "description": "Os nuts são deliciosos e super práticos!"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'pudim-de-manga', 'Pudim de manga', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 108. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 108. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Pudim de manga', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 108. Conteúdo importado para revisão editorial.',
    15, 0, 4, '4 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 vidro de leite de coco", "note": null}, {"quantity": null, "unit": null, "name": "1 manga Palmer em cubos", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de chia", "note": null}, {"quantity": null, "unit": null, "name": "1/2 colher de sopa de extrato de baunilha.", "note": null}]'::jsonb, '[{"title": null, "description": "Bater as 2/3 do leite de coco e a manga no liquidificador, levar a"}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'maca-assada-com-canela', 'Maçã assada com canela', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 109. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 109. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Maçã assada com canela', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 109. Conteúdo importado para revisão editorial.',
    1, 0, 1, '1 Maçã', 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 maçã média por pessoa", "note": null}, {"quantity": null, "unit": null, "name": "canela em pó e canela em casca", "note": null}]'::jsonb, '[{"title": null, "description": "Retire o miolo da maçã e coloque canela em pó e em casca a gosto. Embrulhe em papel alumínio e leve ao forno por aproximadamente 20 minutos (até perceber que ela está macia)."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'mingau-delicia-de-coco', 'Mingau delícia de coco', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 110. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 110. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Mingau delícia de coco', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 110. Conteúdo importado para revisão editorial.',
    20, 0, 4, NULL, 'EASY',
    '[{"quantity": null, "unit": null, "name": "1 colher de sopa de farinha de aveia ou quinoa em flocos", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de amaranto", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de proteína vegetal (opcional)", "note": null}, {"quantity": null, "unit": null, "name": "50mL de leite de coco orgânico ou leite de amêndoas", "note": null}, {"quantity": null, "unit": null, "name": "Pitada de canela ou cacau", "note": null}, {"quantity": null, "unit": null, "name": "3 ameixas secas picadinhas ou 1 colher de sopa de uva passa", "note": null}, {"quantity": null, "unit": null, "name": "bem picadinha ou ½ banana amassada", "note": null}]'::jsonb, '[{"title": null, "description": "Cozinhe todos os ingredientes em fogo baixo, mexendo sempre, até chegar no ponto de mingau. Caso seja necessário, pode adicionar um pouco de água."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'x-tudo-saudavel', 'X-tudo saudável', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 114. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 114. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'X-tudo saudável', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 114. Conteúdo importado para revisão editorial.',
    15, 0, 1, '1 pessoa', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 114"}]'::jsonb, '[{"title": null, "description": "Revisar o modo de preparo na página 114 do livro."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'pastel-integral', 'Pastel integral', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 116. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 116. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Pastel integral', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 116. Conteúdo importado para revisão editorial.',
    40, 0, 4, '4 pessoas ( 15 pasteis)', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 116"}]'::jsonb, '[{"title": null, "description": "Revisar o modo de preparo na página 116 do livro."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'ceviche-chips-de-legumes', 'Ceviche + chips de legumes', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 118. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 118. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Ceviche + chips de legumes', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 118. Conteúdo importado para revisão editorial.',
    1, 0, 4, 'duas porções', 'EASY',
    '[{"quantity": null, "unit": null, "name": "200g de filé de salmão", "note": null}, {"quantity": null, "unit": null, "name": "200g de filé de linguado", "note": null}, {"quantity": null, "unit": null, "name": "1 e ½ xícara (chá) de suco de laranja-", "note": null}, {"quantity": null, "unit": null, "name": "lima", "note": null}, {"quantity": null, "unit": null, "name": "1 xícara (chá) de suco de limão", "note": null}, {"quantity": null, "unit": null, "name": "1 xícara (chá) de tomate-cereja", "note": null}, {"quantity": null, "unit": null, "name": "1 cebola roxa picada", "note": null}, {"quantity": null, "unit": null, "name": "1/2 pimentão vermelho", "note": null}, {"quantity": null, "unit": null, "name": "4 colheres (sopa) de azeite", "note": null}, {"quantity": null, "unit": null, "name": "orégano a gosto", "note": null}, {"quantity": null, "unit": null, "name": "sal e pimenta-do-reino a gosto.", "note": null}]'::jsonb, '[{"title": null, "description": "Numa tábua, corte os peixes, no sentido do comprimento, em tiras de 1 cm de espessura. Coloque-as numa tigela e regue com metade do suco de laranja-lima e com o suco de limão."}, {"title": null, "description": "Cubra com filme e leve à geladeira por 1 hora e 30 minutos."}, {"title": null, "description": "Corte os tomates-cereja ao meio. Pique fino a cebola."}, {"title": null, "description": "Pré-aqueça o forno a 220ºC (temperatura alta). - Prepare o pimentão: besunte com óleo e leve ao forno preaquecido."}, {"title": null, "description": "Deixe assar por 20 minutos. Retire do forno e transfira para um saco plástico até esfriar. Retire a pele do pimentão esfregando com um pano de prato limpo. Corte ao meio, descarte as sementes e corte-o em tiras finas. - Após 1 hora e 30 minutos, retire o peixe da geladeira e acrescente a cebola, os tomates-cereja e o pimentão. Leve à geladeira por mais 30 minutos. - Em seguida, retire e escorra todo o líquido que se formou. Tempere com azeite, sal, pimenta-do-reino, orégano, coentro e o restante do suco de laranja-lima. Misture delicadamente para não quebrar as tiras de peixe e sirva imediatamente."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'tortinha-de-chocolate-e-nuts', 'Tortinha de chocolate e nuts', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 120. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 120. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Tortinha de chocolate e nuts', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 120. Conteúdo importado para revisão editorial.',
    1, 0, 4, 'Você pode preparar em', 'EASY',
    '[{"quantity": null, "unit": null, "name": "Revisar ingredientes na página original do livro", "note": "Página 120"}]'::jsonb, '[{"title": null, "description": "Revisar o modo de preparo na página 120 do livro."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'brownie-funcional', 'Brownie funcional', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 122. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 122. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Brownie funcional', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 122. Conteúdo importado para revisão editorial.',
    60, 0, 10, '10 pessoas (20 pedaços', 'EASY',
    '[{"quantity": null, "unit": null, "name": "3 ovos", "note": null}, {"quantity": null, "unit": null, "name": "½ xícara de chá de óleo de coco", "note": null}, {"quantity": null, "unit": null, "name": "80g de chocolate 70%", "note": null}, {"quantity": null, "unit": null, "name": "¾ xicara de chocolate em pó", "note": null}, {"quantity": null, "unit": null, "name": "diluído em ½ xicara de água", "note": null}, {"quantity": null, "unit": null, "name": "fervente", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de chá de cacau 100%", "note": null}, {"quantity": null, "unit": null, "name": "sem açúcar", "note": null}, {"quantity": null, "unit": null, "name": "1 xicara e ½ de açúcar", "note": null}, {"quantity": null, "unit": null, "name": "demerara", "note": null}, {"quantity": null, "unit": null, "name": "½ xícara de farinha de arroz", "note": null}, {"quantity": null, "unit": null, "name": "½ xícara de fécula de batata ou", "note": null}, {"quantity": null, "unit": null, "name": "amido de milho", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de farinha", "note": null}, {"quantity": null, "unit": null, "name": "de linhaça dourada", "note": null}, {"quantity": null, "unit": null, "name": "½ colher de café de fermento.", "note": null}]'::jsonb, '[{"title": null, "description": "Derreta o chocolate em banho maria com óleo de coco, misture o chocolate derretido com o chocolate em pó e o cacau. Reserve. Misture as farinhas em outro bowl e reserve. Na batedeira coloque os ovos e o açúcar demerara."}, {"title": null, "description": "Bata até formar um creme fofo."}, {"title": null, "description": "Com a batedeira em velocidade baixa, adicione a mistura de chocolate. Bata bem. Coloque as farinhas e o fermento e misture. Despeje em uma forma untada. Leve ao forno pré-aquecido a 200 graus por cerca de 20-30minutos."}, {"title": null, "description": "O palito tem que sair levemente molhadinho. Espere esfriar antes de cortar em quadradinhos."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'docinho-de-frutas-secas', 'Docinho de frutas secas', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 124. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 124. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Docinho de frutas secas', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 124. Conteúdo importado para revisão editorial.',
    20, 0, 24, '24 unidades', 'EASY',
    '[{"quantity": null, "unit": null, "name": "50g de tâmara sem caroço", "note": null}, {"quantity": null, "unit": null, "name": "40g de banana passa", "note": null}, {"quantity": null, "unit": null, "name": "50g de damasco", "note": null}, {"quantity": null, "unit": null, "name": "50g de ameixa seca", "note": null}, {"quantity": null, "unit": null, "name": "40g de castanha de caju triturada", "note": null}, {"quantity": null, "unit": null, "name": "30g de castanha do pará", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de água", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de óleo de coco", "note": null}, {"quantity": null, "unit": null, "name": "extra virgem", "note": null}, {"quantity": null, "unit": null, "name": "1 colher de sopa de alfarroba em pó", "note": null}, {"quantity": null, "unit": null, "name": "DOCINHO DE FRUTAS SECAS", "note": null}]'::jsonb, '[{"title": null, "description": "Coloque uma parte dos ingredientes em um processador e bata, adicione o restante aos poucos, se necessário coloque um pouco mais de água, bata até formar uma bola. Ao final, adicione a castanha de caju triturada à massa com o auxílio de uma colher. Após, modele os docinhos em forma de bolinhas e coloque na geladeira."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
  INSERT INTO "recipes" (
    "id", "slug", "title", "excerpt", "content", "status", "featured",
    "reading_minutes", "cover_image_url", "meta_title", "meta_description",
    "prep_minutes", "cook_minutes", "servings", "serving_size", "difficulty",
    "ingredients", "instructions", "author_id", "category_id", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), 'sorvete-de-banana-com-cacau', 'Sorvete de banana com cacau', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 126. Conteúdo importado para revisão editorial.', '[{"type": "callout", "title": "Fonte da extração", "content": "Livro 50 receitas que nutrem o corpo e a alma de toda a família, página 126. Revise o conteúdo antes de publicar."}]'::jsonb, 'DRAFT', false,
    5, '/no-image.png', 'Sorvete de banana com cacau', 'Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página 126. Conteúdo importado para revisão editorial.',
    20, 0, 4, '4 pessoas', 'EASY',
    '[{"quantity": null, "unit": null, "name": "4 bananas maduras (nanica ou prata)", "note": null}, {"quantity": null, "unit": null, "name": "2 colheres de sopa de cacau em pó", "note": null}, {"quantity": null, "unit": null, "name": "3 colheres de sopa de semente de chia (em gel)", "note": null}, {"quantity": null, "unit": null, "name": "5 colheres de sopa rasa de açúcar mascavo.", "note": null}]'::jsonb, '[{"title": null, "description": "Preparar o gel da chia: adicionar água na semente da chia na proporção de 3 partes de água para cada parte de chia (v/v)."}, {"title": null, "description": "Deixar a semente hidratar por 30 minutos. Bater no liquidificador todos os ingredientes e por último adicionar o gel da chia (junto com as sementes)."}, {"title": null, "description": "Bater até ficar homogêneo. Levar ao congelador por 30 minutos. Servir."}]'::jsonb, selected_author, selected_category, NOW(), NOW()
  ) ON CONFLICT ("slug") DO NOTHING;
END $$;

COMMIT;

-- Source used during generation: /home/jander-nery/Documentos/SangueDoce/50_receitas.pdf
