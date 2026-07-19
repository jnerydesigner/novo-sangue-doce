import { Controller, Get, Header } from "@nestjs/common";
import { Public } from "@app/auth/decorators/public.decorator";
import { registry } from "./registry";

@Controller("metrics")
@Public()
export class MetricsController {
  @Get()
  @Header("Content-Type", registry.contentType)
  metrics() {
    return registry.metrics();
  }
}
