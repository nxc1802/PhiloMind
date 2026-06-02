import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        progress: true,
        reviews: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async register(email: string, name: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await this.findByEmail(normalizedEmail);
    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    return this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        streak: 0,
      },
    });
  }

  async login(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.findByEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundException('User not found. Please register first.');
    }
    return user;
  }

  async googleLogin(idToken: string) {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!response.ok) {
        throw new BadRequestException('Invalid Google ID Token');
      }

      const payload = await response.json();
      if (!payload.email) {
        throw new BadRequestException('Google token does not contain email');
      }

      const email = payload.email.trim().toLowerCase();
      const name = payload.name || email.split('@')[0];

      // Upsert User by email
      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            streak: 1,
          },
        });
      }
      return user;
    } catch (err) {
      throw new BadRequestException(`Google login failed: ${err.message}`);
    }
  }

  async findAll(take: number = 50, skip: number = 0) {
    return this.prisma.user.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, name?: string, email?: string, streak?: number) {
    await this.findById(id); // Throws NotFoundException if user doesn't exist

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (streak !== undefined) data.streak = streak;

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    
    // Clean up related data inside a transaction
    return this.prisma.$transaction(async (tx) => {
      await tx.progress.deleteMany({ where: { userId: id } });
      await tx.flashcardReview.deleteMany({ where: { userId: id } });
      await tx.debate.deleteMany({ where: { userId: id } });
      return tx.user.delete({ where: { id } });
    });
  }

  async createFeedback(userId: string, content: string) {
    await this.findById(userId);
    return this.prisma.feedback.create({
      data: {
        userId,
        content,
      },
      include: {
        user: true,
      },
    });
  }

  async findAllFeedbacks() {
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });
  }
}
