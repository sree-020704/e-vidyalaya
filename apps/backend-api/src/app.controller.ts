import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHealthCheck() {
    return {
      status: "online",
      system: "e-Vidyalaya Multi-Tenant Platform Engine",
      timestamp: new Date().toISOString(),
    };
  }
}
