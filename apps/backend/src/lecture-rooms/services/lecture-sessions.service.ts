import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignSessionDto } from '../dto/session.dto';
import { LectureRoomGateway } from '../lecture-room.gateway';

@Injectable()
export class LectureSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: LectureRoomGateway,
  ) {}

  async findAll() {
    return this.prisma.lectureSession.findMany({
      include: {
        room: true,
        speaker: true,
        bonusCard: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDisplayState(roomCode: string) {
    const room = await this.prisma.lectureRoom.findUnique({
      where: { roomCode },
      include: {
        activeSession: {
          include: {
            speaker: true,
            bonusCard: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('ไม่พบข้อมูลห้องบรรยายที่ระบุ');
    }

    return {
      room,
      activeSession: room.activeSession,
      serverTime: new Date().toISOString(),
    };
  }

  async assign(dto: AssignSessionDto) {
    // 1. ตรวจสอบว่าห้องบรรยายมีจริงหรือไม่
    const room = await this.prisma.lectureRoom.findUnique({
      where: { id: dto.roomId },
      include: { activeSession: true },
    });
    if (!room) {
      throw new NotFoundException('ไม่พบข้อมูลห้องบรรยายที่ระบุ');
    }
    if (room.activeSession) {
      throw new ConflictException('ห้องบรรยายนี้กำลังมีกิจกรรมอื่นดำเนินอยู่');
    }

    // 2. กรณีมีการผูก Bonus Card
    let targetSpeakerId = dto.speakerId;
    if (dto.bonusCardId) {
      const bonusCard = await this.prisma.bonusCard.findUnique({
        where: { id: dto.bonusCardId },
      });
      if (!bonusCard) {
        throw new NotFoundException('ไม่พบข้อมูล Bonus Card ที่ระบุ');
      }

      // ดึงข้อมูล narrators (ผู้บรรยาย) จาก Bonus Card
      let narrators: any[] = [];
      try {
        narrators = typeof bonusCard.narrators === 'string'
          ? JSON.parse(bonusCard.narrators)
          : (bonusCard.narrators || []);
      } catch (err) {
        narrators = [];
      }

      if (!Array.isArray(narrators) || narrators.length === 0) {
        throw new BadRequestException('สามารถมอบหมายได้เฉพาะ Bonus Card ที่มีข้อมูลผู้บรรยายพากย์เท่านั้น');
      }

      // ตรวจสอบเงื่อนไขข้อ 7: "Speaker mapping should reuse existing Bonus Card narrator structure."
      // ค้นหาผู้บรรยายในระบบ
      let speaker = await this.prisma.speaker.findUnique({
        where: { id: dto.speakerId },
      });

      if (!speaker) {
        // หากส่ง speakerId มาแล้วไม่เจอ ลองเช็กจาก narrators ในบัตร
        const primaryNarrator = narrators[0]; // ใช้คนแรกเป็นผู้บรรยายหลัก
        if (primaryNarrator && primaryNarrator.code) {
          // ตรวจสอบว่ารหัสผู้บรรยายมีอยู่ในระบบหรือไม่
          let existingSpeaker = await this.prisma.speaker.findUnique({
            where: { speakerCode: primaryNarrator.code.trim() },
          });

          if (!existingSpeaker) {
            // ดำเนินการสร้างผู้บรรยายอัตโนมัติหากไม่มีอยู่ในระบบ (Auto-Create Fallback)
            existingSpeaker = await this.prisma.speaker.create({
              data: {
                speakerCode: primaryNarrator.code.trim(),
                speakerName: (primaryNarrator.name || 'ผู้บรรยายจาก Bonus Card').trim(),
                status: 'available',
              },
            });
          }
          speaker = existingSpeaker;
          targetSpeakerId = existingSpeaker.id;
        } else {
          throw new BadRequestException('ไม่พบข้อมูลผู้บรรยายในโครงสร้าง Bonus Card');
        }
      }
    }

    // 3. ตรวจสอบผู้บรรยาย
    const speaker = await this.prisma.speaker.findUnique({
      where: { id: targetSpeakerId },
    });
    if (!speaker) {
      throw new NotFoundException('ไม่พบข้อมูลผู้บรรยายที่ระบุ');
    }
    if (speaker.status === 'lecturing') {
      throw new ConflictException('ผู้บรรยายท่านนี้กำลังติดภารกิจบรรยายในห้องอื่น');
    }
    if (speaker.status === 'inactive') {
      throw new BadRequestException('ผู้บรรยายท่านนี้ปิดใช้งานชั่วคราว');
    }

    // 4. บันทึกและเชื่อมโยงข้อมูลรอบการบรรยายใหม่
    const session = await this.prisma.lectureSession.create({
      data: {
        partyCode: dto.partyCode.trim(),
        roomId: room.id,
        roomCode: room.roomCode,
        roomName: room.roomName,
        speakerId: speaker.id,
        speakerCode: speaker.speakerCode,
        speakerName: speaker.speakerName,
        bonusCardId: dto.bonusCardId || null,
        attendeeCount: dto.attendeeCount,
        status: 'arriving', // สถานะเริ่มต้นเมื่อมอบหมาย
      },
    });

    // อัปเดตสถานะผู้บรรยายให้เปลี่ยนเป็นกำลังเตรียมงาน
    await this.prisma.speaker.update({
      where: { id: speaker.id },
      data: { status: 'available' }, // ในช่วงเตรียมการสถานะในระบบยังเป็น available อยู่จนกว่าจะ start
    });

    // ส่งสัญญาณ Real-time แจ้งเตือนไปยังหน้า Dashboard
    this.gateway.broadcastRoomStatusChange(room.roomCode, 'arriving');

    return session;
  }

  async start(roomCode: string) {
    const session = await this.prisma.lectureSession.findFirst({
      where: { roomCode },
    });

    if (!session) {
      throw new NotFoundException('ไม่พบรอบกิจกรรมในห้องบรรยายนี้');
    }

    const updatedSession = await this.prisma.lectureSession.update({
      where: { id: session.id },
      data: {
        status: 'lecturing',
        startedAt: new Date(),
      },
    });

    // เปลี่ยนสถานะผู้บรรยายในระบบเป็น lecturing
    await this.prisma.speaker.update({
      where: { id: session.speakerId },
      data: { status: 'lecturing' },
    });

    // ส่งสัญญาณ Real-time แจ้งเตือนไปยังหน้า Dashboard
    this.gateway.broadcastRoomStatusChange(roomCode, 'lecturing');

    return updatedSession;
  }

  async end(roomCode: string) {
    const session = await this.prisma.lectureSession.findFirst({
      where: { roomCode },
    });

    if (!session) {
      throw new NotFoundException('ไม่พบรอบกิจกรรมในห้องบรรยายนี้');
    }

    const startedAt = session.startedAt || session.createdAt;
    const endedAt = new Date();
    const durationSeconds = Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000));

    // 1. บันทึกลงตารางประวัติกิจกรรม (LectureHistory)
    const history = await this.prisma.lectureHistory.create({
      data: {
        partyCode: session.partyCode,
        roomId: session.roomId,
        roomCode: session.roomCode,
        roomName: session.roomName,
        speakerId: session.speakerId,
        speakerCode: session.speakerCode,
        speakerName: session.speakerName,
        bonusCardId: session.bonusCardId,
        attendeeCount: session.attendeeCount,
        startedAt,
        endedAt,
        durationSeconds,
      },
    });

    // 2. ลบรอบบรรยายออก
    await this.prisma.lectureSession.delete({
      where: { id: session.id },
    });

    // 3. คืนสถานะผู้บรรยายในระบบให้กลับมาเป็นว่าง (available)
    await this.prisma.speaker.update({
      where: { id: session.speakerId },
      data: { status: 'available' },
    });

    // ส่งสัญญาณ Real-time แจ้งเตือนไปยังหน้า Dashboard
    this.gateway.broadcastRoomStatusChange(roomCode, 'available');

    return { message: 'เสร็จสิ้นการบรรยายและบันทึกประวัติเรียบร้อย', history };
  }

  async adminClear(id: string) {
    const session = await this.prisma.lectureSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('ไม่พบรอบกิจกรรมที่ต้องการลบ');
    }

    // ลบรอบบรรยายออกทันทีโดยไม่สร้างประวัติ
    await this.prisma.lectureSession.delete({
      where: { id },
    });

    // คืนสถานะผู้บรรยายในระบบ
    await this.prisma.speaker.update({
      where: { id: session.speakerId },
      data: { status: 'available' },
    });

    // ส่งสัญญาณ Real-time แจ้งเตือนไปยังหน้า Dashboard
    this.gateway.broadcastRoomStatusChange(session.roomCode, 'available');

    return { message: 'ลบรอบกิจกรรมออกและคืนสถานะห้อง/ผู้บรรยายสำเร็จ' };
  }

  async getHistory(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.lectureHistory.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          bonusCard: true,
        },
      }),
      this.prisma.lectureHistory.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
