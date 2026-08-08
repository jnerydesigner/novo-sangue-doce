import { FoodsRepository } from "@app/foods/repository/foods.repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class FoodsPrismaRepository implements FoodsRepository {
    constructor(private readonly prisma: PrismaService) { }
    async list(name?: string): Promise<any[]> {
        const search = name?.trim();
        const query = {
            include: {
                images: true,
                category: true,
            },
        };

        if (!search) {
            return this.prisma.foods.findMany(query);
        }

        const directMatches = await this.prisma.foods.findMany({
            where: name ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            } : undefined,
            ...query,
        });

        if (directMatches.length > 0) {
            return directMatches;
        }

        const normalizedSearch = this.normalizeSearch(search);
        const foods = await this.prisma.foods.findMany(query);

        return foods.filter((food) => {
            const searchableText = this.normalizeSearch(`${food.name} ${food.description}`);
            return searchableText.includes(normalizedSearch);
        });
    }
    async create(food: any): Promise<any> {
        return this.prisma.foods.create({
            data: {
                name: food.name,
                description: food.description,
                category: {
                    connectOrCreate: {
                        where: { name: food.categoryName },
                        create: { name: food.categoryName },
                    },
                },
                carbohydratesG: food.carbohydratesG,
                proteinG: food.proteinG,
                fatG: food.fatG,
                fiberG: food.fiberG,
                energyKcal: food.energyKcal,
            },
            include: {
                images: true,
                category: true,
            },
        });
    }
    update(id: string, food: any): Promise<void> {
        throw new Error("Método não implementado.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Método não implementado.");
    }


    private normalizeSearch(value: string) {
        return value
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase();
    }
}
