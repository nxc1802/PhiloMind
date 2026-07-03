import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be configured in production");
  }
  return "philomind-dev-only-secret-change-me";
};

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: "7d" },
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [PassportModule, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
