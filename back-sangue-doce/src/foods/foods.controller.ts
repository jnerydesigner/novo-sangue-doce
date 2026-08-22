import { AuthGuard } from '@app/@infra/guard/auth.guard';
import { RolesGuard } from '@app/@infra/guard/roles.guard';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { Role } from '@app/auth/enums/role.enum';
import type { UploadedImageFile } from '@app/uploads/types/uploaded-image-file.type';
import { Body, Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';
import { FoodsService } from './foods.service';

const createFoodSchema = z.object({
    name: z.string().trim().min(2),
    description: z.string().trim().optional(),
    categoryName: z.string().trim().min(2),
    carbohydratesG: z.coerce.number().min(0).optional(),
    proteinG: z.coerce.number().min(0).optional(),
    fatG: z.coerce.number().min(0).optional(),
    fiberG: z.coerce.number().min(0).optional(),
    energyKcal: z.coerce.number().min(0).optional(),
});

@Controller('foods')
export class FoodsController {
    constructor(private readonly foodsService: FoodsService) { }

    @Get()
    async getFoods(@Query('name') name?: string) {
        return this.foodsService.getFoods(name);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor("image", { limits: { fileSize: 5 * 1024 * 1024 } }))
    async createFood(
        @Body() body: unknown,
        @UploadedFile() image?: UploadedImageFile,
    ) {
        const input = createFoodSchema.parse(body);
        return this.foodsService.createFood(input, image);
    }

    @Post('images/process-all')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async processAllImages() {
        return this.foodsService.queueImagesForAllFoods();
    }
}
