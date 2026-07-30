import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as nodemailer from "nodemailer";
import { Pool } from "pg";

@Injectable()
export class AuthService {
  private pool: Pool;
  private transporter: nodemailer.Transporter;

  constructor(private readonly jwtService: JwtService) {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // ==========================================
  // UTILITY HELPERS
  // ==========================================

  public validateEmail(email: string): string {
    if (!email || typeof email !== "string") {
      throw new BadRequestException("Email is required.");
    }
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new BadRequestException("Invalid email format.");
    }
    return trimmed;
  }

  public validatePassword(password: string): void {
    if (!password || typeof password !== "string") {
      throw new BadRequestException("Password is required.");
    }
    if (password.length < 8) {
      throw new BadRequestException(
        "Password must contain at least 8 characters.",
      );
    }
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException(
        "Password must contain at least one uppercase letter.",
      );
    }
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException(
        "Password must contain at least one lowercase letter.",
      );
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException(
        "Password must contain at least one number.",
      );
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new BadRequestException(
        "Password must contain at least one special character.",
      );
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // ==========================================
  // SEND SIGNUP OTP
  // ==========================================

  async sendOtp(body: { email: string }) {
    const email = this.validateEmail(body.email);

    const userCheck = await this.pool.query(
      `SELECT id FROM users WHERE email=$1`,
      [email],
    );

    if (userCheck.rows.length > 0) {
      throw new BadRequestException("User with this email already exists.");
    }

    const otp = this.generateOtp();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // Upsert or update pending verification table / users table depending on your schema.
    // Assuming you store temp registration or otp columns in users:
    const existingTemp = await this.pool.query(
      `SELECT email FROM users WHERE email=$1`,
      [email],
    );

    if (existingTemp.rows.length === 0) {
      await this.pool.query(
        `INSERT INTO users (email, reset_otp, reset_otp_expiry) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET reset_otp=$2, reset_otp_expiry=$3`,
        [email, otp, expiry],
      );
    } else {
      await this.pool.query(
        `UPDATE users SET reset_otp=$1, reset_otp_expiry=$2 WHERE email=$3`,
        [otp, expiry, email],
      );
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "e-Vidyalaya Registration OTP",
      html: `
      <div style="font-family:Arial">
        <h2>Welcome to e-Vidyalaya</h2>
        <p>Your verification OTP is</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
      `,
    });

    return {
      success: true,
      message: "OTP sent successfully.",
    };
  }

  // ==========================================
  // VERIFY OTP
  // ==========================================

  async verifyOtp(body: { email: string; otp: string }) {
    const email = this.validateEmail(body.email);
    const { otp } = body;

    if (!otp) {
      throw new BadRequestException("OTP is required.");
    }

    const result = await this.pool.query(`SELECT * FROM users WHERE email=$1`, [
      email,
    ]);

    if (result.rows.length === 0) {
      throw new BadRequestException("Account not found.");
    }

    const user = result.rows[0];

    if (!user.reset_otp || user.reset_otp !== otp) {
      throw new BadRequestException("Invalid OTP.");
    }

    if (
      !user.reset_otp_expiry ||
      new Date(user.reset_otp_expiry) < new Date()
    ) {
      throw new BadRequestException("OTP expired.");
    }

    return {
      success: true,
      message: "OTP verified successfully.",
    };
  }

  // ==========================================
  // REGISTER
  // ==========================================

  async register(body: {
    name: string;
    email: string;
    password: string;
    role: string;
    acceptedTerms: boolean;
  }) {
    const email = this.validateEmail(body.email);
    this.validatePassword(body.password);

    if (!body.name || body.name.trim() === "") {
      throw new BadRequestException("Name is required.");
    }

    if (!body.acceptedTerms) {
      throw new BadRequestException(
        "You must accept the terms and conditions.",
      );
    }

    const hashedPassword = await this.hashPassword(body.password);

    const result = await this.pool.query(
      `UPDATE users 
       SET name=$1, password_hash=$2, role=$3, reset_otp=NULL, reset_otp_expiry=NULL 
       WHERE email=$4 
       RETURNING id, name, email, role`,
      [body.name.trim(), hashedPassword, body.role || "student", email],
    );

    if (result.rows.length === 0) {
      throw new BadRequestException(
        "Registration failed. Please request OTP first.",
      );
    }

    const user = result.rows[0];
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: "Registration Successful",
      token,
    };
  }

  // ==========================================
  // LOGIN
  // ==========================================

  async login(body: { email: string; password: string }) {
    const email = this.validateEmail(body.email);
    const { password } = body;

    if (!password) {
      throw new BadRequestException("Password is required.");
    }

    const result = await this.pool.query(`SELECT * FROM users WHERE email=$1`, [
      email,
    ]);

    if (result.rows.length === 0) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: "Login successful",
      token,
    };
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  async forgotPassword(body: { email: string }) {
    const email = this.validateEmail(body.email);

    const userResult = await this.pool.query(
      `SELECT id, email FROM users WHERE email=$1`,
      [email],
    );

    if (userResult.rows.length === 0) {
      throw new BadRequestException("No account found with this email.");
    }

    const otp = this.generateOtp();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await this.pool.query(
      `UPDATE users SET reset_otp=$1, reset_otp_expiry=$2 WHERE email=$3`,
      [otp, expiry, email],
    );

    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "e-Vidyalaya Password Reset OTP",
      html: `
      <div style="font-family:Arial">
        <h2>Password Reset</h2>
        <p>Your OTP is</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
      `,
    });

    return {
      success: true,
      message: "Password reset OTP sent successfully.",
    };
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  async resetPassword(body: any) {
    const { email, otp, newPassword } = body;

    const userEmail = this.validateEmail(email);
    this.validatePassword(newPassword);

    const result = await this.pool.query(`SELECT * FROM users WHERE email=$1`, [
      userEmail,
    ]);

    if (result.rows.length === 0) {
      throw new BadRequestException("Account not found.");
    }

    const user = result.rows[0];

    if (!user.reset_otp || user.reset_otp !== otp) {
      throw new BadRequestException("Invalid OTP.");
    }

    if (
      !user.reset_otp_expiry ||
      new Date(user.reset_otp_expiry) < new Date()
    ) {
      throw new BadRequestException("OTP expired.");
    }

    const hashed = await this.hashPassword(newPassword);

    await this.pool.query(
      `UPDATE users
       SET password_hash=$1,
           reset_otp=NULL,
           reset_otp_expiry=NULL,
           failed_login_attempts=0,
           account_locked_until=NULL
       WHERE id=$2`,
      [hashed, user.id],
    );

    return {
      success: true,
      message: "Password updated successfully.",
    };
  }
}
