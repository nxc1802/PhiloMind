import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PhilosofunService {
  constructor(private prisma: PrismaService) {}

  async create(dto: { title: string; description?: string; videoUrl: string }) {
    return this.prisma.philosofun.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        videoUrl: dto.videoUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.philosofun.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.philosofun.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Philosofun video not found');
    return item;
  }

  async update(id: string, dto: { title?: string; description?: string; videoUrl?: string }) {
    await this.findOne(id);
    return this.prisma.philosofun.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.philosofun.delete({
      where: { id },
    });
  }
}
