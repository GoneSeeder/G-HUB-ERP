import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSpeakerDto, UpdateSpeakerDto } from '../dto/speaker.dto';

@Injectable()
export class SpeakersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.speaker.findMany({
      orderBy: { speakerCode: 'asc' },
    });
  }

  async findOne(id: string) {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id },
    });
    if (!speaker) {
      throw new NotFoundException('ไม่พบข้อมูลผู้บรรยายที่ระบุ');
    }
    return speaker;
  }

  async create(dto: CreateSpeakerDto) {
    const existing = await this.prisma.speaker.findUnique({
      where: { speakerCode: dto.speakerCode.trim() },
    });
    if (existing) {
      throw new BadRequestException('รหัสผู้บรรยายนี้ถูกใช้งานไปแล้ว');
    }

    return this.prisma.speaker.create({
      data: {
        speakerCode: dto.speakerCode.trim(),
        speakerName: dto.speakerName.trim(),
        status: 'available',
      },
    });
  }

  async update(id: string, dto: UpdateSpeakerDto) {
    await this.ensureExists(id);

    return this.prisma.speaker.update({
      where: { id },
      data: {
        ...(dto.speakerName !== undefined ? { speakerName: dto.speakerName.trim() } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.speaker.delete({
      where: { id },
    });
    return { message: 'ลบผู้บรรยายสำเร็จ' };
  }

  private async ensureExists(id: string) {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id },
    });
    if (!speaker) {
      throw new NotFoundException('ไม่พบข้อมูลผู้บรรยายที่ระบุ');
    }
  }
}
