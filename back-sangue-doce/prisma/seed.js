require('dotenv/config');

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { scryptSync } = require('node:crypto');
const {
  MEASUREMENT_TIME_ZONE,
  measurementSchedule,
} = require('./seed-data/measurement-schedule');
const { buildSimplePostContent } = require('./seed-data/post-content');
const { postCategories } = require('./seed-data/post-categories');
const { postTags } = require('./seed-data/post-tags');
const { seedPosts } = require('./seed-data/posts');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = 'dev-login-seed';
  const derivedKey = scryptSync(password, salt, 64);

  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
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
  const firstOffset = getTimeZoneOffsetInMilliseconds(
    new Date(localTimestamp),
    timeZone,
  );
  const secondOffset = getTimeZoneOffsetInMilliseconds(
    new Date(localTimestamp - firstOffset),
    timeZone,
  );

  return new Date(localTimestamp - secondOffset);
}

function getDatePartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return {
    day: Number(values.day),
    month: Number(values.month),
    year: Number(values.year),
  };
}

function getDateTimePartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
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
    measuredAt: createMeasurementDate(
      measurement.daysAgo,
      measurement.hour,
      measurement.minute,
    ),
    glucoseValueMgDl: measurement.glucoseValueMgDl,
    readingContext: measurement.readingContext,
    source: 'IMPORT',
    noteType: measurement.noteType,
  }));
}

async function main() {
  const jander = await prisma.user.upsert({
    where: { email: 'jander.webmaster@gmail.com' },
    update: {
      birthDate: new Date('1978-01-23T00:00:00.000Z'),
      diabetesType: 'TYPE_1',
      name: 'Jander Nery',
      passwordHash: hashPassword('12345678'),
      role: 'ADMIN',
    },
    create: {
      name: 'Jander Nery',
      email: 'jander.webmaster@gmail.com',
      passwordHash: hashPassword('12345678'),
      birthDate: new Date('1978-01-23T00:00:00.000Z'),
      diabetesType: 'TYPE_1',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'ana.ribeiro@sanguedoce.com' },
    update: {
      passwordHash: hashPassword('12345678'),
      role: 'USER',
    },
    create: {
      name: 'Ana Ribeiro',
      email: 'ana.ribeiro@sanguedoce.com',
      passwordHash: hashPassword('12345678'),
      birthDate: new Date('1992-05-12T00:00:00.000Z'),
      diabetesType: 'TYPE_1',
      role: 'USER',
    },
  });

  const helenaUser = await prisma.user.upsert({
    where: { email: 'helena.marques@sanguedoce.com' },
    update: {
      name: 'Helena Marques',
      passwordHash: hashPassword('12345678'),
      role: 'USER',
    },
    create: {
      name: 'Helena Marques',
      email: 'helena.marques@sanguedoce.com',
      passwordHash: hashPassword('12345678'),
      diabetesType: 'UNKNOWN',
      role: 'USER',
    },
  });

  const janderAuthor = await prisma.postAuthor.upsert({
    where: { slug: 'jander-nery' },
    update: {
      name: 'Jander Nery',
      role: 'Editor e Desenvolvedor com Diabetes Tipo 1',
      bio: 'Designer e desenvolvedor por tras do Sangue Doce. Vive com diabetes tipo 1 e escreve a partir do encontro entre experiencia pessoal, tecnologia e cuidado diario, buscando transformar dados, rotina e linguagem em ferramentas mais simples para quem convive com a condicao.',
      email: 'jander.nery@sanguedoce.com',
      userId: jander.id,
    },
    create: {
      name: 'Jander Nery',
      slug: 'jander-nery',
      role: 'Editor e Desenvolvedor com Diabetes Tipo 1',
      bio: 'Designer e desenvolvedor por tras do Sangue Doce. Vive com diabetes tipo 1 e escreve a partir do encontro entre experiencia pessoal, tecnologia e cuidado diario, buscando transformar dados, rotina e linguagem em ferramentas mais simples para quem convive com a condicao.',
      email: 'jander.nery@sanguedoce.com',
      userId: jander.id,
    },
  });

  const helenaAuthor = await prisma.postAuthor.upsert({
    where: { slug: 'helena-marques' },
    update: {
      name: 'Helena Marques',
      role: 'Editora de Saude Metabolica',
      bio: 'Jornalista com mais de dez anos cobrindo saude e ciencia. Escreve sobre diabetes com foco no dia a dia de quem vive com a condicao, traduzindo evidencia em decisoes praticas, sem alarmismo.',
      email: 'helena.marques@sanguedoce.com',
      userId: helenaUser.id,
    },
    create: {
      name: 'Helena Marques',
      slug: 'helena-marques',
      role: 'Editora de Saude Metabolica',
      bio: 'Jornalista com mais de dez anos cobrindo saude e ciencia. Escreve sobre diabetes com foco no dia a dia de quem vive com a condicao, traduzindo evidencia em decisoes praticas, sem alarmismo.',
      email: 'helena.marques@sanguedoce.com',
      userId: helenaUser.id,
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
    [helenaAuthor.slug]: helenaAuthor,
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
        status: 'PUBLISHED',
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
        status: 'PUBLISHED',
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
      source: 'IMPORT',
      userId: {
        in: [jander.id, user.id],
      },
    },
  });

  await prisma.measurement.createMany({
    data: [
      ...buildSeedMeasurements(jander.id),
      ...buildSeedMeasurements(user.id),
    ],
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
