import { BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let prisma: any;
  let jwtService: any;
  let supabaseService: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue("signed-jwt"),
    };
    supabaseService = {
      getClient: jest.fn(),
    };
    service = new UsersService(prisma, jwtService, supabaseService);
  });

  it("rejects local password login for passwordless provider accounts", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "oauth@example.com",
      password: null,
      role: "student",
    });

    await expect(
      service.login("oauth@example.com", "password123"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it("rejects local login when the password is invalid", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      password: await bcrypt.hash("password123", 10),
      role: "student",
    });

    await expect(
      service.login("student@example.com", "wrongpass123"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it("returns a signed JWT when local credentials are valid", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "student@example.com",
      password: await bcrypt.hash("password123", 10),
      role: "student",
      name: "Student",
    });

    await expect(
      service.login("student@example.com", "password123"),
    ).resolves.toMatchObject({
      token: "signed-jwt",
      user: {
        id: "user-1",
        email: "student@example.com",
        role: "student",
      },
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      email: "student@example.com",
      sub: "user-1",
      role: "student",
    });
  });
});
