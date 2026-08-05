require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const seedPath = path.resolve(__dirname, "seed-data/foodsSeed.json");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definida.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function seedFoods() {
  const foods = JSON.parse(fs.readFileSync(seedPath, "utf8"));

  for (const seedFood of foods) {
    const { foodsCategories, ...foodData } = seedFood;
    const categoryName = foodsCategories.create[0].name;

    const existingFood = await prisma.foods.findFirst({
      where: {
        name: foodData.name,
        description: foodData.description,
      },
      select: { id: true },
    });

    const food = existingFood
      ? await prisma.foods.update({ where: { id: existingFood.id }, data: foodData })
      : await prisma.foods.create({ data: foodData });

    const existingCategory = await prisma.foodsCategory.findFirst({
      where: { foodsId: food.id, name: categoryName },
      select: { id: true },
    });

    if (!existingCategory) {
      await prisma.foodsCategory.create({
        data: { name: categoryName, foodsId: food.id },
      });
    }
  }

  console.log(`Foods seed concluído: ${foods.length} registros processados.`);
}

seedFoods()
  .catch((error) => {
    console.error("Falha ao executar o seed de foods:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
