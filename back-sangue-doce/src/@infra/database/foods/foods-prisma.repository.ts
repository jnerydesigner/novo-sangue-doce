import { FoodsRepository } from "@app/foods/repository/foods.repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class FoodsPrismaRepository implements FoodsRepository {
    constructor(private readonly prisma: PrismaService) { }
    async list(name?: string): Promise<any[]> {
        return this.prisma.foods.findMany({
            where: name ? {
                OR: [
                    { name: { contains: name, mode: "insensitive" } },
                    { description: { contains: name, mode: "insensitive" } },
                ],
            } : undefined,
            include: {
                images: true,
                category: true,
            },
        });
    }
    create(food: any): Promise<void> {
        throw new Error("Método não implementado.");
    }
    update(id: string, food: any): Promise<void> {
        throw new Error("Método não implementado.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Método não implementado.");
    }


}
