import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonusCardDto } from './dto/create-bonus-card.dto';
import { UpdateBonusCardDto } from './dto/update-bonus-card.dto';

type BonusGuide = {
  code: string;
  name: string;
  phone: string;
};

type BonusNarrator = {
  code: string;
  name: string;
};

type ActiveLectureRegistration = {
  id: string;
  roomCode: string;
  roomName: string;
  speakerCode: string;
  speakerName: string;
  speaker2Code: string;
  speaker2Name: string;
  attendeeCount: number;
};

@Injectable()
export class BonusCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { workDate?: string; from?: string; to?: string; excludeLectureHistory?: boolean } = {}) {
    const where: Prisma.BonusCardWhereInput = {};
    if (filters.from || filters.to) {
      where.workDate = {
        ...(filters.from ? { gte: this.toDate(filters.from) } : {}),
        ...(filters.to ? { lte: this.toDate(filters.to) } : {}),
      };
    } else if (filters.workDate) {
      where.workDate = this.toDate(filters.workDate);
    }
    const rows = await this.prisma.bonusCard.findMany({
      where,
      include: {
        lectureSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ workDate: 'desc' }, { bonus: 'asc' }],
    });
    const availableRows = filters.excludeLectureHistory ? await this.excludeCompletedLectureRows(rows) : rows;
    const recorderNames = await this.recorderNameMap(availableRows.map((row) => row.recorder));
    return availableRows.map((row) => this.toResponse(row, recorderNames));
  }

  async create(dto: CreateBonusCardDto, user: AuthUser) {
    await this.ensureNameListAvailable(dto.nameListCode, null);
    const recorder = this.recorderUsername(user);
    const recorderTime = this.currentRecorderTime();
    const row = await this.prisma.bonusCard.create({
      data: this.toCreateData(dto, recorder, recorderTime),
    });
    return this.toResponse(row, new Map([[recorder, user.name || recorder]]));
  }

  async update(id: string, dto: UpdateBonusCardDto, user: AuthUser) {
    await this.ensureExists(id);
    await this.ensureNameListAvailable(dto.nameListCode, id);
    const recorder = this.recorderUsername(user);
    const recorderTime = this.currentRecorderTime();
    const row = await this.prisma.bonusCard.update({
      where: { id },
      data: this.toUpdateData(dto, recorder, recorderTime),
    });
    return this.toResponse(row, new Map([[recorder, user.name || recorder]]));
  }

  async remove(id: string) {
    const row = await this.ensureExists(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.bonusCard.delete({ where: { id } });
      await tx.booking.updateMany({
        where: {
          dateBookJw: row.workDate,
          bonusCode: row.bonus,
        },
        data: { upload: false, bonusCode: '' },
      });
    });
    return { message: 'Bonus card deleted successfully' };
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.bonusCard.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Bonus card "${id}" not found`);
    }
    return row;
  }

  private async ensureNameListAvailable(nameListCode: string | undefined, currentBonusCardId: string | null) {
    const code = nameListCode?.trim();
    if (!code) return;
    const nameList = await this.prisma.nameList.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!nameList) {
      throw new NotFoundException(`Name list "${code}" not found`);
    }
    const linkedBonus = await this.prisma.bonusCard.findFirst({
      where: {
        nameListCode: code,
        ...(currentBonusCardId ? { id: { not: currentBonusCardId } } : {}),
      },
      select: { bonus: true },
    });
    if (linkedBonus) {
      throw new ConflictException(`Name list "${code}" is already linked to bonus "${linkedBonus.bonus}"`);
    }
  }

  private toCreateData(dto: CreateBonusCardDto, recorder = '', recorderTime = ''): Prisma.BonusCardCreateInput {
    return {
      workDate: this.toDate(dto.workDate),
      bonus: dto.bonus,
      bonusName: dto.bonusName,
      agentCode: dto.agentCode,
      agentName: dto.agentName,
      companyCode: dto.companyCode ?? '',
      guide: dto.guide,
      guideName: dto.guideName,
      memberCode: dto.memberCode ?? '',
      supervisorCode: dto.supervisorCode ?? '',
      tourLeaderName: dto.tourLeaderName ?? '',
      tourLeaderPassport: dto.tourLeaderPassport ?? '',
      partyCode: dto.partyCode,
      nation: dto.nation,
      province: dto.province ?? '',
      adult: dto.adult,
      child: dto.child,
      tourLeader: dto.tourLeader,
      student: dto.student ?? 0,
      carCode: dto.carCode ?? '',
      shop: dto.shop ?? '',
      charterCode: dto.charterCode ?? '',
      hotel: dto.hotel ?? '',
      comeFrom: dto.comeFrom ?? '',
      busType: dto.busType ?? '',
      tourIn: dto.tourIn ?? '',
      tourOut: dto.tourOut ?? '',
      recorder,
      recorderTime,
      comment: dto.comment ?? '',
      imageUrl: dto.imageUrl,
      nameListCode: dto.nameListCode ?? '',
      extraGuides: this.sanitizeGuides(dto.extraGuides),
      narratorGroup: dto.narratorGroup ?? '',
      narratorPax: dto.narratorPax ?? 0,
      narrators: this.sanitizeNarrators(dto.narrators),
    };
  }

  private toUpdateData(dto: UpdateBonusCardDto, recorder = '', recorderTime = ''): Prisma.BonusCardUpdateInput {
    return {
      ...(dto.workDate ? { workDate: this.toDate(dto.workDate) } : {}),
      ...(dto.bonus !== undefined ? { bonus: dto.bonus } : {}),
      ...(dto.bonusName !== undefined ? { bonusName: dto.bonusName } : {}),
      ...(dto.agentCode !== undefined ? { agentCode: dto.agentCode } : {}),
      ...(dto.agentName !== undefined ? { agentName: dto.agentName } : {}),
      ...(dto.companyCode !== undefined ? { companyCode: dto.companyCode } : {}),
      ...(dto.guide !== undefined ? { guide: dto.guide } : {}),
      ...(dto.guideName !== undefined ? { guideName: dto.guideName } : {}),
      ...(dto.memberCode !== undefined ? { memberCode: dto.memberCode } : {}),
      ...(dto.supervisorCode !== undefined ? { supervisorCode: dto.supervisorCode } : {}),
      ...(dto.tourLeaderName !== undefined ? { tourLeaderName: dto.tourLeaderName } : {}),
      ...(dto.tourLeaderPassport !== undefined ? { tourLeaderPassport: dto.tourLeaderPassport } : {}),
      ...(dto.partyCode !== undefined ? { partyCode: dto.partyCode } : {}),
      ...(dto.nation !== undefined ? { nation: dto.nation } : {}),
      ...(dto.province !== undefined ? { province: dto.province } : {}),
      ...(dto.adult !== undefined ? { adult: dto.adult } : {}),
      ...(dto.child !== undefined ? { child: dto.child } : {}),
      ...(dto.tourLeader !== undefined ? { tourLeader: dto.tourLeader } : {}),
      ...(dto.student !== undefined ? { student: dto.student } : {}),
      ...(dto.carCode !== undefined ? { carCode: dto.carCode } : {}),
      ...(dto.shop !== undefined ? { shop: dto.shop } : {}),
      ...(dto.charterCode !== undefined ? { charterCode: dto.charterCode } : {}),
      ...(dto.hotel !== undefined ? { hotel: dto.hotel } : {}),
      ...(dto.comeFrom !== undefined ? { comeFrom: dto.comeFrom } : {}),
      ...(dto.busType !== undefined ? { busType: dto.busType } : {}),
      ...(dto.tourIn !== undefined ? { tourIn: dto.tourIn } : {}),
      ...(dto.tourOut !== undefined ? { tourOut: dto.tourOut } : {}),
      ...(recorder ? { recorder } : {}),
      ...(recorderTime ? { recorderTime } : {}),
      ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
      ...(dto.nameListCode !== undefined ? { nameListCode: dto.nameListCode } : {}),
      ...(dto.extraGuides !== undefined ? { extraGuides: this.sanitizeGuides(dto.extraGuides) } : {}),
      ...(dto.narratorGroup !== undefined ? { narratorGroup: dto.narratorGroup } : {}),
      ...(dto.narratorPax !== undefined ? { narratorPax: dto.narratorPax } : {}),
      ...(dto.narrators !== undefined ? { narrators: this.sanitizeNarrators(dto.narrators) } : {}),
    };
  }

  private toDate(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }

  private async excludeCompletedLectureRows<T extends { id: string; partyCode: string; bonus: string }>(rows: T[]) {
    if (rows.length === 0) return rows;

    const ids = rows.map((row) => row.id);
    const partyCodes = rows.map((row) => row.partyCode.trim()).filter(Boolean);
    const bonusCodes = rows.map((row) => row.bonus.trim()).filter(Boolean);
    const histories = await this.prisma.lectureHistory.findMany({
      where: {
        OR: [
          { bonusCardId: { in: ids } },
          ...(partyCodes.length ? [{ partyCode: { in: partyCodes } }] : []),
          ...(bonusCodes.length ? [{ bonusCard: { bonus: { in: bonusCodes } } }] : []),
        ],
      },
      select: {
        bonusCardId: true,
        partyCode: true,
        bonusCard: {
          select: { bonus: true },
        },
      },
    });

    const completedIds = new Set(histories.map((item) => item.bonusCardId).filter(Boolean) as string[]);
    const completedPartyCodes = new Set(histories.map((item) => item.partyCode.trim()).filter(Boolean));
    const completedBonusCodes = new Set(histories.map((item) => item.bonusCard?.bonus.trim()).filter(Boolean) as string[]);

    return rows.filter(
      (row) =>
        !completedIds.has(row.id) &&
        !completedPartyCodes.has(row.partyCode.trim()) &&
        !completedBonusCodes.has(row.bonus.trim()),
    );
  }

  private toResponse(row: {
    id: string;
    workDate: Date;
    bonus: string;
    bonusName: string;
    agentCode: string;
    agentName: string;
    companyCode: string;
    guide: string;
    guideName: string;
    memberCode: string;
    supervisorCode: string;
    tourLeaderName: string;
    tourLeaderPassport: string;
    partyCode: string;
    nation: string;
    province: string;
    adult: number;
    child: number;
    tourLeader: number;
    student: number;
    carCode: string;
    shop: string;
    charterCode: string;
    hotel: string;
    comeFrom: string;
    busType: string;
    tourIn: string;
    tourOut: string;
    recorder: string;
    recorderTime: string;
    comment: string;
    imageUrl: string | null;
    nameListCode: string;
    extraGuides: Prisma.JsonValue;
    narratorGroup: string;
    narratorPax: number;
    narrators: Prisma.JsonValue;
    lectureSessions?: ActiveLectureRegistration[];
  }, recorderNames = new Map<string, string>()) {
    const guide = row.guide.trim();
    const activeLectureSession = row.lectureSessions?.[0] ?? null;
    return {
      ...row,
      workDate: row.workDate.toISOString().slice(0, 10),
      guideName: this.isValidLookupCode(guide) ? row.guideName : '',
      recorderName: recorderNames.get(row.recorder) ?? row.recorder,
      imageUrl: row.imageUrl ?? '',
      extraGuides: this.normalizeGuides(row.extraGuides),
      narrators: this.normalizeNarrators(row.narrators),
      lectureRegistration: activeLectureSession
        ? {
            roomCode: activeLectureSession.roomCode,
            roomName: activeLectureSession.roomName,
            speakerCode: activeLectureSession.speakerCode,
            speakerName: activeLectureSession.speakerName,
            speaker2Code: activeLectureSession.speaker2Code,
            speaker2Name: activeLectureSession.speaker2Name,
            attendeeCount: row.adult + row.child + row.tourLeader + row.student,
          }
        : null,
    };
  }

  private isValidLookupCode(value: string) {
    return !['', '-', 'NO', 'NONE', 'NULL', 'N/A'].includes(value.trim().toUpperCase());
  }

  private recorderUsername(user: AuthUser) {
    return user.username || '';
  }

  private currentRecorderTime() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
    return `${value('day')}/${value('month')}/${value('year')} ${value('hour')}:${value('minute')}:${value('second')}`;
  }

  private async recorderNameMap(recorders: string[]) {
    const usernames = [...new Set(recorders.map((recorder) => recorder.trim()).filter(Boolean))];
    if (usernames.length === 0) {
      return new Map<string, string>();
    }
    const users = await this.prisma.user.findMany({
      where: { username: { in: usernames } },
      select: { username: true, name: true },
    });
    return new Map(users.map((user) => [user.username, user.name || user.username]));
  }

  private sanitizeGuides(value: CreateBonusCardDto['extraGuides']): Prisma.InputJsonValue {
    return (value ?? [])
      .map((guide) => ({
        code: String(guide.code ?? '').trim(),
        name: String(guide.name ?? '').trim(),
        phone: String(guide.phone ?? '').trim(),
      }))
      .filter((guide) => guide.code || guide.name || guide.phone);
  }

  private sanitizeNarrators(value: CreateBonusCardDto['narrators']): Prisma.InputJsonValue {
    return (value ?? [])
      .map((narrator) => ({
        code: String(narrator.code ?? '').trim(),
        name: String(narrator.name ?? '').trim(),
      }))
      .filter((narrator) => narrator.code || narrator.name);
  }

  private normalizeGuides(value: Prisma.JsonValue): BonusGuide[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
        const guide = item as Record<string, unknown>;
        return {
          code: String(guide.code ?? '').trim(),
          name: String(guide.name ?? '').trim(),
          phone: String(guide.phone ?? '').trim(),
        };
      })
      .filter((guide): guide is BonusGuide => Boolean(guide && (guide.code || guide.name || guide.phone)));
  }

  private normalizeNarrators(value: Prisma.JsonValue): BonusNarrator[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
        const narrator = item as Record<string, unknown>;
        return {
          code: String(narrator.code ?? '').trim(),
          name: String(narrator.name ?? '').trim(),
        };
      })
      .filter((narrator): narrator is BonusNarrator => Boolean(narrator && (narrator.code || narrator.name)));
  }
}
