import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeTypeDto, UpdateEmployeeTypeDto } from './dto/employee-type.dto';

@Injectable()
export class HumansourceEmployeeTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hrEmployeeType.findMany({ orderBy: { id: 'asc' } });
  }

  async create(dto: CreateEmployeeTypeDto) {
    const id = await this.nextId();
    return this.prisma.hrEmployeeType.create({
      data: {
        id,
        code: dto.code,
        nameTh: dto.nameTh,
        nameEn: dto.nameEn,
        tax: dto.tax,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateEmployeeTypeDto) {
    await this.ensureExists(id);
    return this.prisma.hrEmployeeType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.hrEmployeeType.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.hrEmployeeType.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Employee type ${id} not found`);
  }

  // Generate the next ET### id from existing rows.
  private async nextId(): Promise<string> {
    const rows = await this.prisma.hrEmployeeType.findMany({ select: { id: true } });
    const max = rows.reduce((acc, { id }) => {
      const n = Number(id.replace(/^ET/, ''));
      return Number.isFinite(n) && n > acc ? n : acc;
    }, 0);
    return `ET${String(max + 1).padStart(3, '0')}`;
  }
}
