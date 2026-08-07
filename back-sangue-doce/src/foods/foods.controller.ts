import { Controller, Get, Post, Query } from '@nestjs/common';
import { FoodsService } from './foods.service';

@Controller('foods')
export class FoodsController {
    constructor(private readonly foodsService: FoodsService) { }

    @Get()
    async getFoods(@Query('name') name?: string) {
        return this.foodsService.getFoods(name);
    }

    @Post('images/process-all')
    async processAllImages() {
        return this.foodsService.queueImagesForAllFoods();
    }
}
