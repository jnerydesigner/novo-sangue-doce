import { PrismaService } from "@infra/database/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MealTypeEnum } from "./enums/meal-type.enum";

type CreateConsumptionInput = {
  mealType: string;
  consumedAt?: string;
  notes?: string;
  items: Array<{ foodId: number; quantity: number; unit: string; weightG?: number }>;
};

@Injectable()
export class FoodConsumptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateConsumptionInput) {
    const items = await this.buildItems(input);
    const total = this.sumItems(items);

    return this.prisma.foodConsumption.create({
      data: {
        userId,
        mealType: input.mealType as never,
        consumedAt: input.consumedAt ? new Date(input.consumedAt) : undefined,
        notes: input.notes,
        totalCarbohydratesG: total("carbohydratesG"),
        totalProteinG: total("proteinG"),
        totalFatG: total("fatG"),
        totalFiberG: total("fiberG"),
        totalEnergyKcal: total("energyKcal"),
        items: { create: items as never },
      },
      include: { items: { include: { food: { include: { images: true } } } } },
    });
  }

  async update(userId: string, id: number, input: CreateConsumptionInput) {
    const consumption = await this.prisma.foodConsumption.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!consumption) throw new NotFoundException("Refeicao nao encontrada.");

    const items = await this.buildItems(input);
    const total = this.sumItems(items);

    return this.prisma.foodConsumption.update({
      where: { id },
      data: {
        mealType: input.mealType as never,
        consumedAt: input.consumedAt ? new Date(input.consumedAt) : undefined,
        notes: input.notes,
        totalCarbohydratesG: total("carbohydratesG"),
        totalProteinG: total("proteinG"),
        totalFatG: total("fatG"),
        totalFiberG: total("fiberG"),
        totalEnergyKcal: total("energyKcal"),
        items: {
          deleteMany: {},
          create: items as never,
        },
      },
      include: { items: { include: { food: { include: { images: true } } } } },
    });
  }

  findAll(userId: string) {
    return this.prisma.foodConsumption.findMany({
      where: { userId },
      orderBy: { consumedAt: "desc" },
      include: { items: { include: { food: { include: { images: true } } } } },
    });
  }

  findToday(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return this.prisma.foodConsumption.findMany({
      where: { userId, consumedAt: { gte: start, lt: end } },
      orderBy: { consumedAt: "asc" },
      include: { items: { include: { food: { include: { images: true } } } } },
    });
  }

  findTodayMeal(userId: string, meal: string) {
    const mealType = MealTypeEnum[meal];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return this.prisma.foodConsumption.findFirst({
      where: { userId, consumedAt: { gte: start, lt: end }, mealType },
      orderBy: { consumedAt: "asc" },
      include: { items: { include: { food: { include: { images: true } } } } },
    });
  }

  async remove(userId: string, id: number) {
    const consumption = await this.prisma.foodConsumption.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!consumption) throw new NotFoundException("Refeicao nao encontrada.");

    await this.prisma.foodConsumption.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async buildItems(input: CreateConsumptionInput) {
    if (!input.items?.length) throw new BadRequestException("A refeicao precisa ter alimentos.");

    const foods = await this.prisma.foods.findMany({
      where: { id: { in: input.items.map((item) => item.foodId) } },
    });
    const foodsById = new Map(foods.map((food) => [food.id, food]));

    return input.items.map((inputItem) => {
      const food = foodsById.get(inputItem.foodId);
      if (!food) throw new NotFoundException(`Alimento ${inputItem.foodId} nao encontrado.`);
      const weightG = inputItem.weightG ?? inputItem.quantity;
      if (!Number.isFinite(weightG) || weightG <= 0) {
        throw new BadRequestException("O peso do alimento deve ser maior que zero.");
      }

      const factor = weightG / 100;
      return {
        foodId: food.id,
        quantity: inputItem.quantity,
        unit: inputItem.unit,
        weightG,
        carbohydratesG: Number(food.carbohydratesG ?? 0) * factor,
        proteinG: Number(food.proteinG ?? 0) * factor,
        fatG: Number(food.fatG ?? 0) * factor,
        fiberG: Number(food.fiberG ?? 0) * factor,
        energyKcal: Number(food.energyKcal ?? 0) * factor,
        foodNameSnapshot: food.name,
        foodDescriptionSnapshot: food.description,
      };
    });
  }

  private sumItems(items: Awaited<ReturnType<FoodConsumptionsService["buildItems"]>>) {
    return (field: keyof (typeof items)[number]) =>
      items.reduce((sum, item) => sum + Number(item[field] ?? 0), 0);
  }
}
