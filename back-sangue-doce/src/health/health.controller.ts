import { Controller, Get } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { HealthService } from "./health.service";

@Controller("health")
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check() {
    return this.healthService.check();
  }

  @Get("live")
  live() {
    return this.healthService.live();
  }

  @Get("ready")
  ready() {
    return this.healthService.ready();
  }
}
