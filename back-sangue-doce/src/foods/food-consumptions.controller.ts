import { AuthenticatedRequest, AuthGuard } from "@app/@infra/guard/auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { FoodConsumptionsService } from "./food-consumptions.service";
import { createConsumptionSchema } from "./dto/create-consumption.dto";

@Controller("food-consumptions")
@UseGuards(AuthGuard)
export class FoodConsumptionsController {
  constructor(private readonly service: FoodConsumptionsService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = createConsumptionSchema.parse(body);
    return this.service.create(request.user!.sub, input);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.service.findAll(request.user!.sub);
  }

  @Get("today")
  findToday(@Req() request: AuthenticatedRequest) {
    return this.service.findToday(request.user!.sub);
  }

  @Get("today/meal")
  findTodayMeal(@Req() request: AuthenticatedRequest, @Query("meal") meal: string) {
    return this.service.findTodayMeal(request.user!.sub, meal);
  }

  @Delete(":id")
  remove(@Req() request: AuthenticatedRequest, @Param("id", ParseIntPipe) id: number) {
    return this.service.remove(request.user!.sub, id);
  }

  @Patch(":id")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: unknown,
  ) {
    const input = createConsumptionSchema.parse(body);
    return this.service.update(request.user!.sub, id, input);
  }
}
