import { Controller, Post, Body, Query } from "@nestjs/common";
import { SupportService } from "./support.service";

@Controller("support")
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post("ticket")
  async createTicket(
    @Body() body: { studentId: number; message: string },
    @Query("tenantId") tenantId: string = "default-campus",
  ) {
    return this.supportService.createTicket(
      body.studentId,
      body.message,
      tenantId,
    );
  }
}
