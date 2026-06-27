require("dotenv/config");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { createHash } = require("node:crypto");

const MEASUREMENT_TIME_ZONE = "America/Manaus";
const REPORT_USER_EMAIL = process.env.REPORT_SEED_USER_EMAIL ?? "jander.webmaster@gmail.com";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const reportMeasurementSlots = [
  {
    hour: 6,
    minute: 45,
    noteType: "BEFORE_BREAKFAST",
    readingContext: "BEFORE_MEAL",
  },
  {
    hour: 9,
    minute: 10,
    noteType: "AFTER_BREAKFAST",
    readingContext: "AFTER_MEAL",
  },
  {
    hour: 11,
    minute: 35,
    noteType: "BEFORE_LUNCH",
    readingContext: "BEFORE_MEAL",
  },
  {
    hour: 13,
    minute: 20,
    noteType: "AFTER_LUNCH",
    readingContext: "AFTER_MEAL",
  },
  {
    hour: 18,
    minute: 25,
    noteType: "BEFORE_DINNER",
    readingContext: "BEFORE_MEAL",
  },
  {
    hour: 21,
    minute: 40,
    noteType: "AFTER_DINNER",
    readingContext: "BEDTIME",
  },
];

function createDateInTimeZone(year, month, day, hour, minute, timeZone) {
  const localTimestamp = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const firstOffset = getTimeZoneOffsetInMilliseconds(new Date(localTimestamp), timeZone);
  const secondOffset = getTimeZoneOffsetInMilliseconds(
    new Date(localTimestamp - firstOffset),
    timeZone,
  );

  return new Date(localTimestamp - secondOffset);
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

function createDeterministicUuid(value) {
  const hash = createHash("sha256").update(value).digest("hex");
  const uuid = [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `5${hash.slice(13, 16)}`,
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.slice(18, 20),
    hash.slice(20, 32),
  ].join("-");

  return uuid;
}

function getSeedGlucoseValue(day, month, slotIndex) {
  const rawValue = (day * 37 + month * 19 + slotIndex * 23) % 101;

  return 100 + rawValue;
}

function buildReportMeasurements(userId) {
  const measurements = [];
  const startDate = new Date(Date.UTC(2026, 5, 1, 12, 0, 0, 0));
  const endDate = new Date(Date.UTC(2026, 6, 1, 12, 0, 0, 0));

  for (
    const currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  ) {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();

    reportMeasurementSlots.forEach((slot, slotIndex) => {
      const measuredAt = createDateInTimeZone(
        year,
        month,
        day,
        slot.hour,
        slot.minute,
        MEASUREMENT_TIME_ZONE,
      );

      measurements.push({
        id: createDeterministicUuid(
          `report-seed:${userId}:${measuredAt.toISOString()}:${slot.noteType}`,
        ),
        userId,
        measuredAt,
        glucoseValueMgDl: getSeedGlucoseValue(day, month, slotIndex),
        readingContext: slot.readingContext,
        source: "IMPORT",
        noteType: slot.noteType,
      });
    });
  }

  return measurements;
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: REPORT_USER_EMAIL },
  });

  if (!user) {
    throw new Error(`User ${REPORT_USER_EMAIL} not found.`);
  }

  await prisma.user.update({
    data: {
      birthDate: new Date("1978-01-23T00:00:00.000Z"),
      diabetesType: "TYPE_1",
    },
    where: { id: user.id },
  });

  const measurements = buildReportMeasurements(user.id);

  for (const measurement of measurements) {
    await prisma.measurement.upsert({
      create: measurement,
      update: {
        glucoseValueMgDl: measurement.glucoseValueMgDl,
        measuredAt: measurement.measuredAt,
        noteType: measurement.noteType,
        readingContext: measurement.readingContext,
        source: measurement.source,
      },
      where: { id: measurement.id },
    });
  }

  console.log(`Seeded ${measurements.length} report measurements for ${REPORT_USER_EMAIL}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
