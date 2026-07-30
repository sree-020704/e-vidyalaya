import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ===========================
  // Send Email OTP
  // POST /auth/send-otp
  // ===========================

  @Post("send-otp")
  async sendOtp(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.authService.sendOtp(body);
  }

  // ===========================
  // Verify OTP
  // POST /auth/verify-otp
  // ===========================

  @Post("verify-otp")
  async verifyOtp(
    @Body()
    body: {
      email: string;
      otp: string;
    },
  ) {
    return this.authService.verifyOtp(body);
  }

  // ===========================
  // Register
  // POST /auth/register
  // ===========================

  @Post("register")
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role: string;
      acceptedTerms: boolean;
    },
  ) {
    return this.authService.register(body);
  }

  // ===========================
  // Login
  // POST /auth/login
  // ===========================

  @Post("login")
  async login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(body);
  }

  // ===========================
  // Forgot Password
  // POST /auth/forgot-password
  // ===========================

  @Post("forgot-password")
  async forgotPassword(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.authService.forgotPassword(body);
  }

  // ===========================
  // Reset Password
  // POST /auth/reset-password
  // ===========================

  @Post("reset-password")
  async resetPassword(
    @Body()
    body: {
      email: string;
      otp: string;
      newPassword: string;
    },
  ) {
    return this.authService.resetPassword(body);
  }
}
