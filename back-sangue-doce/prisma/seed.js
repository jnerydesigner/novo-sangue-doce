require('dotenv/config');

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { scryptSync } = require('node:crypto');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = 'dev-login-seed';
  const derivedKey = scryptSync(password, salt, 64);

  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

const MEASUREMENT_TIME_ZONE = 'America/Sao_Paulo';

const measurementSchedule = [
  {
    daysAgo: 14,
    hour: 6,
    minute: 35,
    glucoseValueMgDl: 103,
    readingContext: 'BEFORE_MEAL',
    noteType: 'BEFORE_BREAKFAST',
  },
  {
    daysAgo: 13,
    hour: 13,
    minute: 15,
    glucoseValueMgDl: 128,
    readingContext: 'AFTER_MEAL',
    noteType: 'AFTER_LUNCH',
  },
  {
    daysAgo: 12,
    hour: 22,
    minute: 20,
    glucoseValueMgDl: 112,
    readingContext: 'BEDTIME',
    noteType: 'BEFORE_SLEEP',
  },
  {
    daysAgo: 11,
    hour: 7,
    minute: 45,
    glucoseValueMgDl: 118,
    readingContext: 'AFTER_MEAL',
    noteType: 'AFTER_BREAKFAST',
  },
  {
    daysAgo: 10,
    hour: 11,
    minute: 30,
    glucoseValueMgDl: 97,
    readingContext: 'BEFORE_MEAL',
    noteType: 'BEFORE_LUNCH',
  },
  {
    daysAgo: 9,
    hour: 19,
    minute: 50,
    glucoseValueMgDl: 141,
    readingContext: 'AFTER_MEAL',
    noteType: 'AFTER_DINNER',
  },
  {
    daysAgo: 8,
    hour: 15,
    minute: 35,
    glucoseValueMgDl: 109,
    readingContext: 'RANDOM',
    noteType: 'AFTERNOON_RANDOM_CHECK',
  },
  {
    daysAgo: 7,
    hour: 6,
    minute: 25,
    glucoseValueMgDl: 92,
    readingContext: 'BEFORE_MEAL',
    noteType: 'BEFORE_BREAKFAST',
  },
  {
    daysAgo: 6,
    hour: 12,
    minute: 40,
    glucoseValueMgDl: 136,
    readingContext: 'AFTER_MEAL',
    noteType: 'AFTER_LUNCH',
  },
  {
    daysAgo: 5,
    hour: 18,
    minute: 15,
    glucoseValueMgDl: 101,
    readingContext: 'BEFORE_MEAL',
    noteType: 'BEFORE_DINNER',
  },
  {
    daysAgo: 4,
    hour: 22,
    minute: 45,
    glucoseValueMgDl: 119,
    readingContext: 'BEDTIME',
    noteType: 'BEFORE_SLEEP',
  },
  {
    daysAgo: 3,
    hour: 8,
    minute: 10,
    glucoseValueMgDl: 124,
    readingContext: 'AFTER_MEAL',
    noteType: 'AFTER_BREAKFAST',
  },
  {
    daysAgo: 2,
    hour: 14,
    minute: 20,
    glucoseValueMgDl: 132,
    readingContext: 'RANDOM',
    noteType: 'AFTERNOON_RANDOM_CHECK',
  },
  {
    daysAgo: 1,
    hour: 6,
    minute: 40,
    glucoseValueMgDl: 99,
    readingContext: 'BEFORE_MEAL',
    noteType: 'BEFORE_BREAKFAST',
  },
  {
    daysAgo: 1,
    hour: 20,
    minute: 5,
    glucoseValueMgDl: 145,
    readingContext: 'AFTER_MEAL',
    noteType: 'AFTER_DINNER',
  },
];

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
      passwordHash: hashPassword('12345678'),
    },
    create: {
      name: 'Jander Nery',
      email: 'jander.webmaster@gmail.com',
      passwordHash: hashPassword('12345678'),
      diabetesType: 'UNKNOWN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'ana.ribeiro@sanguedoce.com' },
    update: {
      passwordHash: hashPassword('12345678'),
    },
    create: {
      name: 'Ana Ribeiro',
      email: 'ana.ribeiro@sanguedoce.com',
      passwordHash: hashPassword('12345678'),
      birthDate: new Date('1992-05-12T00:00:00.000Z'),
      diabetesType: 'TYPE_1',
    },
  });

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
