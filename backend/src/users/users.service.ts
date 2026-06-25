import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => JwtService)) private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}

  private withoutPassword(user: any) {
    if (!user) return user;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        progress: true,
        reviews: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.withoutPassword(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  generateToken(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }

  async register(email: string, name: string, password?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await this.findByEmail(normalizedEmail);
    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        password: hashedPassword,
        role: 'student',
        streak: 0,
      },
    });

    const token = this.generateToken(user);
    return { user: this.withoutPassword(user), token };
  }

  async login(email: string, password?: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.findByEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundException('User not found. Please register first.');
    }

    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new BadRequestException('Invalid credentials');
      }
    } else if (user.password && !password) {
      throw new BadRequestException('Password required');
    }

    const token = this.generateToken(user);
    return { user: this.withoutPassword(user), token };
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
            role: 'student',
            streak: 1,
          },
        });
      }
      const token = this.generateToken(user);
      return { user: this.withoutPassword(user), token };
    } catch (err: any) {
      throw new BadRequestException(`Google login failed: ${err.message}`);
    }
  }

  async supabaseLogin(token: string) {
    const supabaseClient = this.supabaseService.getClient();

    // If Supabase is not initialized (e.g. running in mock mode)
    if (!supabaseClient) {
      // In local development or mock mode, we accept a mock token
      if (token === 'mock-supabase-jwt-token-string') {
        const email = 'philosopher.beginner@gmail.com';
        const name = 'Tân thủ Triết học';
        
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await this.prisma.user.create({
            data: {
              email,
              name,
              role: 'student',
              streak: 1,
            },
          });
        }
        const jwtToken = this.generateToken(user);
        return { user: this.withoutPassword(user), token: jwtToken };
      }
      throw new BadRequestException('Supabase URL/Key missing and invalid mock token');
    }

    try {
      const { data: { user: sbUser }, error } = await supabaseClient.auth.getUser(token);
      if (error || !sbUser) {
        throw new BadRequestException(`Invalid Supabase token: ${error?.message || 'User not found'}`);
      }

      const email = sbUser.email.trim().toLowerCase();
      const name = sbUser.user_metadata?.full_name || email.split('@')[0];

      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            role: 'student',
            streak: 1,
          },
        });
      }
      const jwtToken = this.generateToken(user);
      return { user: this.withoutPassword(user), token: jwtToken };
    } catch (err: any) {
      throw new BadRequestException(`Supabase auth failed: ${err.message}`);
    }
  }

  async findAll(take: number = 50, skip: number = 0) {
    return this.prisma.user.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        streak: true,
        createdAt: true,
      },
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
