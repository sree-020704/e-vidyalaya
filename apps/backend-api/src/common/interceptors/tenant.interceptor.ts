import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // Resolve tenant context explicitly from client payload headers[cite: 1]
    const tenantId =
      request.headers["x-tenant-id"] || "77777777-7777-7777-7777-777777777777";

    request["tenantId"] = tenantId;
    return next.handle();
  }
}
