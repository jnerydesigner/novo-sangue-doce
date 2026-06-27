require("dotenv/config");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { mkdir, writeFile } = require("node:fs/promises");
const path = require("node:path");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const outputPath = path.join(__dirname, "seed-data", "current-database-snapshot.json");

function serialize(value) {
  return JSON.stringify(
    value,
    (_key, currentValue) =>
      currentValue instanceof Date ? currentValue.toISOString() : currentValue,
    2,
  );
}

async function main() {
  const snapshot = {
    exportedAt: new Date().toISOString(),
    users: await prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    measurements: await prisma.measurement.findMany({
      orderBy: [{ userId: "asc" }, { measuredAt: "asc" }],
    }),
    postAuthors: await prisma.postAuthor.findMany({
      orderBy: { createdAt: "asc" },
    }),
    postCategories: await prisma.postCategory.findMany({
      orderBy: { createdAt: "asc" },
    }),
    postTags: await prisma.postTag.findMany({ orderBy: { createdAt: "asc" } }),
    posts: await prisma.post.findMany({ orderBy: { createdAt: "asc" } }),
    postTagRelations: await prisma.postTagRelation.findMany({
      orderBy: [{ postId: "asc" }, { tagId: "asc" }],
    }),
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${serialize(snapshot)}\n`, "utf8");

  console.log(`Snapshot exported to ${outputPath}`);
  console.table({
    users: snapshot.users.length,
    measurements: snapshot.measurements.length,
    postAuthors: snapshot.postAuthors.length,
    postCategories: snapshot.postCategories.length,
    postTags: snapshot.postTags.length,
    posts: snapshot.posts.length,
    postTagRelations: snapshot.postTagRelations.length,
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
