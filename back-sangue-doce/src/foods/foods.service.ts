import { Injectable } from '@nestjs/common';
import { FoodsRepository } from './repository/foods.repository';
import { FoodsImagesQueue } from './foods-images.queue';

@Injectable()
export class FoodsService {
    constructor(private readonly foodsRepository: FoodsRepository, private readonly foodsImagesQueue: FoodsImagesQueue) { }


    async getFoods(name?: string) {
        return this.foodsRepository.list(name?.trim() || undefined);
    }

    async queueImagesForAllFoods() {
        const foods = await this.foodsRepository.list();
        for (const food of foods) await this.foodsImagesQueue.add(food.id);
        return { queued: foods.length };
    }
}
