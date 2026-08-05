require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { scryptSync } = require("node:crypto");
const { MEASUREMENT_TIME_ZONE, measurementSchedule } = require("./seed-data/measurement-schedule");
const { buildSimplePostContent } = require("./seed-data/post-content");
const { postCategories } = require("./seed-data/post-categories");
const { postTags } = require("./seed-data/post-tags");
const { seedPosts } = require("./seed-data/posts");

const tacoFoodsPath = path.resolve(__dirname, "../../nutrition-facts-label/data/foods-consolidated.json");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = "dev-login-seed";
  const derivedKey = scryptSync(password, salt, 64);

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

function createMeasurementDate(daysAgo, hour, minute) {
  const today = getDatePartsInTimeZone(new Date(), MEASUREMENT_TIME_ZONE);
  const targetDate = new Date(
    Date.UTC(today.year, today.month - 1, today.day - daysAgo, 12, 0, 0, 0),
  );

  return createDateInTimeZone(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth() + 1,
    targetDate.getUTCDate(),
    hour,
    minute,
    MEASUREMENT_TIME_ZONE,
  );
}

function createDateInTimeZone(year, month, day, hour, minute, timeZone) {
  const localTimestamp = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const firstOffset = getTimeZoneOffsetInMilliseconds(new Date(localTimestamp), timeZone);
  const secondOffset = getTimeZoneOffsetInMilliseconds(
    new Date(localTimestamp - firstOffset),
    timeZone,
  );

  return new Date(localTimestamp - secondOffset);
}

function getDatePartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return {
    day: Number(values.day),
    month: Number(values.month),
    year: Number(values.year),
  };
}

function getDateTimePartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return {
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    month: Number(values.month),
    second: Number(values.second),
    year: Number(values.year),
  };
}

function getTimeZoneOffsetInMilliseconds(date, timeZone) {
  const parts = getDateTimePartsInTimeZone(date, timeZone);
  const localTimestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    date.getUTCMilliseconds(),
  );

  return localTimestamp - (date.getTime() - date.getUTCMilliseconds());
}

function buildSeedMeasurements(userId) {
  return measurementSchedule.map((measurement) => ({
    userId,
    measuredAt: createMeasurementDate(measurement.daysAgo, measurement.hour, measurement.minute),
    glucoseValueMgDl: measurement.glucoseValueMgDl,
    readingContext: measurement.readingContext,
    source: "IMPORT",
    noteType: measurement.noteType,
  }));
}

function decimalValue(value) {
  if (value === null || value === undefined || value === "NA" || value === "Tr") return null;
  const normalized = String(value).replace(/[^0-9,.-]/g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function readTacoFoods() {
  const grouped = JSON.parse(fs.readFileSync(tacoFoodsPath, "utf8"));
  return Object.entries(grouped).flatMap(([categorySlug, foods]) =>
    foods.map((food) => ({ categorySlug, food })),
  );
}

async function seedTacoFoods() {
  for (const [categorySlug, foods] of Object.entries(JSON.parse(fs.readFileSync(tacoFoodsPath, "utf8")))) {
    const category = await prisma.tacoCategory.upsert({
      where: { slug: categorySlug },
      update: { name: categorySlug.replaceAll("_", " ") },
      create: { slug: categorySlug, name: categorySlug.replaceAll("_", " ") },
    });

    for (const food of foods) {
      const nutrition = Object.fromEntries([
        ["moisturePercent", food.moisture_percent], ["energyKcal", food.energy_kcal], ["energyKj", food.energy_kj],
        ["proteinG", food.protein_g], ["fatG", food.fat_g], ["cholesterolMg", food.cholesterol_mg],
        ["carbohydratesG", food.carbohydrates_g], ["fiberG", food.fiber_g], ["ashG", food.ash_g],
        ["calciumMg", food.calcium_mg], ["magnesiumMg", food.magnesium_mg], ["manganeseMg", food.manganese_mg],
        ["phosphorusMg", food.phosphorus_mg], ["ironMg", food.iron_mg], ["sodiumMg", food.sodium_mg],
        ["potassiumMg", food.potassium_mg], ["copperMg", food.copper_mg], ["zincMg", food.zinc_mg],
        ["retinolMcg", food.retinol_mcg], ["vitaminAReMcg", food.vitamin_a_re_mcg], ["vitaminARaeMcg", food.vitamin_a_rae_mcg],
        ["thiamineMg", food.thiamine_mg], ["riboflavinMg", food.riboflavin_mg], ["pyridoxineMg", food.pyridoxine_mg],
        ["niacinMg", food.niacin_mg], ["vitaminCMg", food.vitamin_c_mg],
      ].reduce((result, [key, value]) => ({ ...result, [key]: decimalValue(value) }), {}));

      await prisma.tacoFood.upsert({
        where: { foodNumber: food.food_number },
        update: {
          foodId: food.food_id ?? food.food_number,
          page: food.page ?? null,
          description: food.description,
          categoryId: category.id,
          ...nutrition,
        },
        create: {
          foodId: food.food_id ?? food.food_number,
          foodNumber: food.food_number,
          page: food.page ?? null,
          description: food.description,
          categoryId: category.id,
          ...nutrition,
        },
      });
    }
  }
}

async function main() {
  // await seedTacoFoods();
  const jander = await prisma.user.upsert({
    where: { email: "jander.webmaster@gmail.com" },
    update: {
      birthDate: new Date("1978-01-23T00:00:00.000Z"),
      diabetesType: "TYPE_1",
      name: "Jander Nery",
      passwordHash: hashPassword("Jcn526379@#"),
      role: "ADMIN",
    },
    create: {
      name: "Jander Nery",
      email: "jander.webmaster@gmail.com",
      passwordHash: hashPassword("Jcn526379@#"),
      birthDate: new Date("1978-01-23T00:00:00.000Z"),
      diabetesType: "TYPE_1",
      role: "ADMIN",
    },
  });



  const janderAuthor = await prisma.postAuthor.upsert({
    where: { slug: "jander-nery" },
    update: {
      name: "Jander Nery",
      role: "Editor e Desenvolvedor com Diabetes Tipo 1",
      bio: "Designer e desenvolvedor por tras do Sangue Doce. Vive com diabetes tipo 1 e escreve a partir do encontro entre experiencia pessoal, tecnologia e cuidado diario, buscando transformar dados, rotina e linguagem em ferramentas mais simples para quem convive com a condicao.",
      email: "jander.nery@sanguedoce.com",
      userId: jander.id,
    },
    create: {
      name: "Jander Nery",
      slug: "jander-nery",
      role: "Editor e Desenvolvedor com Diabetes Tipo 1",
      bio: "Designer e desenvolvedor por tras do Sangue Doce. Vive com diabetes tipo 1 e escreve a partir do encontro entre experiencia pessoal, tecnologia e cuidado diario, buscando transformar dados, rotina e linguagem em ferramentas mais simples para quem convive com a condicao.",
      email: "jander.nery@sanguedoce.com",
      userId: jander.id,
    },
  });


  const categories = await Promise.all(
    postCategories.map((category) =>
      prisma.postCategory.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          color: category.color,
        },
        create: category,
      }),
    ),
  );

  const tags = await Promise.all(
    postTags.map((tag) =>
      prisma.postTag.upsert({
        where: { slug: tag.slug },
        update: {
          name: tag.name,
        },
        create: tag,
      }),
    ),
  );

  const authorBySlug = {
    [janderAuthor.slug]: janderAuthor,
  };
  const categoryBySlug = Object.fromEntries(
    categories.map((category) => [category.slug, category]),
  );
  const tagBySlug = Object.fromEntries(tags.map((tag) => [tag.slug, tag]));

  for (const post of seedPosts) {
    const author = authorBySlug[post.authorSlug];
    const category = categoryBySlug[post.categorySlug];

    if (!author || !category) {
      throw new Error(`Missing author or category for post ${post.slug}`);
    }

    const createdPost = await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        standfirst: post.standfirst ?? post.excerpt,
        content: post.content ?? buildSimplePostContent(post.title, post.excerpt),
        status: "PUBLISHED",
        featured: post.featured ?? false,
        readingMinutes: post.readingMinutes,
        coverImageUrl: post.coverImageUrl,
        coverImageAlt: post.coverImageAlt,
        coverCaption: post.coverCaption ?? null,
        verticalImageUrl: post.verticalImageUrl,
        metaTitle: `${post.title} | Sangue Doce`,
        metaDescription: post.excerpt,
        publishedAt: new Date(post.publishedAt),
        authorId: author.id,
        categoryId: category.id,
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        standfirst: post.standfirst ?? post.excerpt,
        content: post.content ?? buildSimplePostContent(post.title, post.excerpt),
        status: "PUBLISHED",
        featured: post.featured ?? false,
        readingMinutes: post.readingMinutes,
        coverImageUrl: post.coverImageUrl,
        coverImageAlt: post.coverImageAlt,
        coverCaption: post.coverCaption ?? null,
        verticalImageUrl: post.verticalImageUrl,
        metaTitle: `${post.title} | Sangue Doce`,
        metaDescription: post.excerpt,
        publishedAt: new Date(post.publishedAt),
        authorId: author.id,
        categoryId: category.id,
      },
    });

    await prisma.postTagRelation.deleteMany({
      where: { postId: createdPost.id },
    });

    await prisma.postTagRelation.createMany({
      data: post.tagSlugs.map((tagSlug) => {
        const tag = tagBySlug[tagSlug];

        if (!tag) {
          throw new Error(`Missing tag ${tagSlug} for post ${post.slug}`);
        }

        return {
          postId: createdPost.id,
          tagId: tag.id,
        };
      }),
      skipDuplicates: true,
    });
  }

  await prisma.measurement.deleteMany({
    where: {
      source: "IMPORT",
      userId: {
        in: [jander.id],
      },
    },
  });

  await prisma.measurement.createMany({
    data: [...buildSeedMeasurements(jander.id)],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
