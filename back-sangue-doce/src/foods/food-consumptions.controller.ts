import { AuthenticatedRequest, AuthGuard } from "@app/@infra/guard/auth.guard";
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { FoodConsumptionsService } from "./food-consumptions.service";

const createConsumptionSchema = z.object({
  mealType: z.enum(["BREAKFAST", "MORNING_SNACK", "LUNCH", "AFTERNOON_SNACK", "DINNER", "SUPPER", "OTHER"]),
  consumedAt: z.iso.datetime().optional(),
  notes: z.string().max(500).optional(),
  items: z.array(z.object({
    foodId: z.number().int().positive(),
    quantity: z.number().positive(),
    unit: z.enum(["CUP", "GRAM", "MILLILITER", "PORTION", "SCOOP", "SLICE", "TABLESPOON", "TEASPOON", "UNIT"]).default("GRAM"),
    weightG: z.number().positive().optional(),
  })).min(1),
});

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

  @Delete(":id")
  remove(@Req() request: AuthenticatedRequest, @Param("id", ParseIntPipe) id: number) {
    return this.service.remove(request.user!.sub, id);
  }

  @Patch(":id")
  update(@Req() request: AuthenticatedRequest, @Param("id", ParseIntPipe) id: number, @Body() body: unknown) {
    const input = createConsumptionSchema.parse(body);
    return this.service.update(request.user!.sub, id, input);
  }
}
