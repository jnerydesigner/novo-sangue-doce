import type { UploadedImageFile } from '@app/uploads/types/uploaded-image-file.type';
import { Injectable } from '@nestjs/common';
import { FoodImagesService } from './food-images.service';
import { FoodsImagesQueue } from './foods-images.queue';
import { FoodsRepository } from './repository/foods.repository';

type CreateFoodInput = {
    name: string;
    description?: string;
    categoryName: string;
    carbohydratesG?: number;
    proteinG?: number;
    fatG?: number;
    fiberG?: number;
    energyKcal?: number;
};

@Injectable()
export class FoodsService {
    constructor(private readonly foodsRepository: FoodsRepository, private readonly foodsImagesQueue: FoodsImagesQueue, private readonly foodImagesService: FoodImagesService) { }


    async getFoods(name?: string) {
        return this.foodsRepository.list(name?.trim() || undefined);
    }

    async createFood(input: CreateFoodInput, image?: UploadedImageFile) {
        const food = await this.foodsRepository.create({
            ...input,
            description: input.description?.trim() || input.name,
            carbohydratesG: input.carbohydratesG ?? 0,
            proteinG: input.proteinG ?? 0,
            fatG: input.fatG ?? 0,
            fiberG: input.fiberG ?? 0,
            energyKcal: input.energyKcal ?? 0,
        });

        if (!image) return food;

        const result = await this.foodImagesService.attachManualUpload(food.id, image, {
            sourceName: "Cadastro manual",
        });

        return result.food;
    }

    async queueImagesForAllFoods() {
        const foods = await this.foodsRepository.list();
        for (const food of foods) await this.foodsImagesQueue.add(food.id);
        return { queued: foods.length };
    }
}
