import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementCategoryDto, UpdateAnnouncementCategoryDto, CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

@Injectable()
export class HumansourceAnnouncementsService {
  constructor(private prisma: PrismaService) {}

  // ── Categories ──────────────────────────────────────────────────────────
  findAllCategories() {
    return this.prisma.hrAnnouncementCategory.findMany({ orderBy: { id: 'asc' } });
  }

  async createCategory(dto: CreateAnnouncementCategoryDto) {
    const id = await this.nextCatId();
    return this.prisma.hrAnnouncementCategory.create({ data: { id, ...dto } });
  }

  async updateCategory(id: string, dto: UpdateAnnouncementCategoryDto) {
    await this.ensureCatExists(id);
    return this.prisma.hrAnnouncementCategory.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    await this.ensureCatExists(id);
    return this.prisma.hrAnnouncementCategory.delete({ where: { id } });
  }

  private async ensureCatExists(id: string) {
    const row = await this.prisma.hrAnnouncementCategory.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`AnnouncementCategory ${id} not found`);
  }

  private async nextCatId(): Promise<string> {
    const rows = await this.prisma.hrAnnouncementCategory.findMany({ select: { id: true } });
    const nums = rows.map((r) => r.id.match(/^AC-(\d+)$/)).filter(Boolean).map((m) => parseInt(m![1], 10));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `AC-${String(next).padStart(3, '0')}`;
  }

  // ── Announcements ───────────────────────────────────────────────────────
  findAll(status?: string) {
    return this.prisma.hrAnnouncement.findMany({
      where: status ? { status } : undefined,
      orderBy: { pinned: 'desc' },
    });
  }

  async create(dto: CreateAnnouncementDto) {
    return this.prisma.hrAnnouncement.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...dto, attachments: (dto.attachments ?? []) as any, audience: (dto.audience ?? { scope: 'all', companyIds: [], orgNodeIds: [], employeeTypeIds: [], employeeIds: [] }) as any },
    });
  }

  async update(id: string, dto: UpdateAnnouncementDto) {
    const row = await this.prisma.hrAnnouncement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Announcement ${id} not found`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.hrAnnouncement.update({ where: { id }, data: { ...dto, ...(dto.attachments !== undefined && { attachments: dto.attachments as any }), ...(dto.audience !== undefined && { audience: dto.audience as any }) } });
  }

  async remove(id: string) {
    const row = await this.prisma.hrAnnouncement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Announcement ${id} not found`);
    return this.prisma.hrAnnouncement.delete({ where: { id } });
  }
}
