import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto';

@Injectable()
export class LectureRoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.lectureRoom.findMany({
      orderBy: { roomCode: 'asc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.lectureRoom.findUnique({
      where: { id },
    });
    if (!room) {
      throw new NotFoundException('ไม่พบข้อมูลห้องบรรยายที่ระบุ');
    }
    return room;
  }

  async create(dto: CreateRoomDto) {
    const existing = await this.prisma.lectureRoom.findUnique({
      where: { roomCode: dto.roomCode.trim() },
    });
    if (existing) {
      throw new BadRequestException('รหัสห้องบรรยายนี้ถูกใช้งานไปแล้ว');
    }

    return this.prisma.lectureRoom.create({
      data: {
        roomCode: dto.roomCode.trim(),
        roomName: dto.roomName.trim(),
        capacity: dto.capacity,
      },
    });
  }

  async update(id: string, dto: UpdateRoomDto) {
    await this.ensureExists(id);

    return this.prisma.lectureRoom.update({
      where: { id },
      data: {
        ...(dto.roomName !== undefined ? { roomName: dto.roomName.trim() } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.lectureRoom.delete({
      where: { id },
    });
    return { message: 'ลบห้องบรรยายสำเร็จ' };
  }

  private async ensureExists(id: string) {
    const room = await this.prisma.lectureRoom.findUnique({
      where: { id },
    });
    if (!room) {
      throw new NotFoundException('ไม่พบข้อมูลห้องบรรยายที่ระบุ');
    }
  }
}
