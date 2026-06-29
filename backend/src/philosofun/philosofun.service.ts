import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { TtlCache } from "../common/ttl-cache";

@Injectable()
export class PhilosofunService {
  private readonly listCache = new TtlCache<any[]>();

  constructor(private prisma: PrismaService) {}

  async create(dto: { title: string; description?: string; videoUrl: string }) {
    const item = await this.prisma.philosofun.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        videoUrl: dto.videoUrl,
      },
    });
    this.listCache.clear();
    return item;
  }

  async findAll() {
    return this.listCache.getOrSet("philosofun:list", 60000, () =>
      this.prisma.philosofun.findMany({
        orderBy: { createdAt: "desc" },
      }),
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.philosofun.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException("Philosofun video not found");
    return item;
  }

  async update(
    id: string,
    dto: { title?: string; description?: string; videoUrl?: string },
  ) {
    await this.findOne(id);
    const item = await this.prisma.philosofun.update({
      where: { id },
      data: dto,
    });
    this.listCache.clear();
    return item;
  }

  async remove(id: string) {
    await this.findOne(id);
    const item = await this.prisma.philosofun.delete({
      where: { id },
    });
    this.listCache.clear();
    return item;
  }
}
