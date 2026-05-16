import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AgentAliasDto, CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

type AgentFilters = {
  page?: string;
  search?: string;
  nation?: string;
  active?: string;
  typeGroup?: string;
};

type LegacyImportDto = {
  fileBase64: string;
};

const PAGE_SIZE = 50;

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: AgentFilters = {}) {
    const page = Math.max(Number(filters.page) || 1, 1);
    const where = this.toWhere(filters);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.agent.findMany({
        where,
        include: { aliases: { orderBy: { pattern: 'asc' } } },
        orderBy: [{ agentCode: 'asc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.agent.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    };
  }

  async create(dto: CreateAgentDto) {
    await this.ensureUniqueAgentCode(dto.agentCode);
    const row = await this.prisma.agent.create({
      data: this.toCreateData(dto),
      include: { aliases: true },
    });
    return row;
  }

  async update(id: string, dto: UpdateAgentDto) {
    await this.ensureExists(id);
    if (dto.agentCode) {
      await this.ensureUniqueAgentCode(dto.agentCode, id);
    }

    const aliases = dto.aliases;
    const row = await this.prisma.agent.update({
      where: { id },
      data: {
        ...this.toUpdateData(dto),
        ...(aliases
          ? {
              aliases: {
                deleteMany: {},
                create: this.toAliases(aliases),
              },
            }
          : {}),
      },
      include: { aliases: true },
    });
    return row;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.agent.delete({ where: { id } });
    return { message: 'Agent deleted successfully' };
  }

  async importLegacy(dto: LegacyImportDto) {
    if (!dto.fileBase64) {
      throw new BadRequestException('Legacy database file is required');
    }

    const rows = this.parseLegacyAgents(dto.fileBase64);

    let imported = 0;
    for (const row of rows) {
      await this.prisma.agent.upsert({
        where: { agentCode: row.agentCode },
        update: row,
        create: row,
      });
      imported += 1;
    }

    return { imported };
  }

  previewLegacy(dto: LegacyImportDto) {
    if (!dto.fileBase64) {
      throw new BadRequestException('Legacy database file is required');
    }

    const rows = this.parseLegacyAgents(dto.fileBase64);
    return {
      rowCount: rows.length,
      rows: rows.slice(0, 50).map((row) => ({
        agentCode: row.agentCode,
        name: row.name,
        nation: row.nation,
        phone: row.phone,
        taxId: row.taxId,
        contactPerson: row.contactPerson,
        typeGroup: row.typeGroup,
        active: row.active,
      })),
    };
  }

  private toWhere(filters: AgentFilters): Prisma.AgentWhereInput {
    const and: Prisma.AgentWhereInput[] = [];
    if (filters.search) {
      const contains = { contains: filters.search, mode: 'insensitive' as const };
      and.push({
        OR: [
          { agentCode: contains },
          { codeCenter: contains },
          { name: contains },
          { phone: contains },
          { taxId: contains },
          { contactPerson: contains },
          { typeGroup: contains },
        ],
      });
    }
    if (filters.nation) {
      and.push({ nation: { equals: filters.nation, mode: 'insensitive' } });
    }
    if (filters.typeGroup) {
      and.push({ typeGroup: { contains: filters.typeGroup, mode: 'insensitive' } });
    }
    if (filters.active === 'active') {
      and.push({ active: true });
    }
    if (filters.active === 'inactive') {
      and.push({ active: false });
    }
    return and.length ? { AND: and } : {};
  }

  private toCreateData(dto: CreateAgentDto): Prisma.AgentCreateInput {
    return {
      ...this.baseData(dto),
      agentCode: dto.agentCode.trim(),
      name: dto.name.trim(),
      aliases: {
        create: this.toAliases(dto.aliases ?? []),
      },
    };
  }

  private toUpdateData(dto: UpdateAgentDto): Prisma.AgentUpdateInput {
    const data = this.baseData(dto);
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as Prisma.AgentUpdateInput;
  }

  private baseData(dto: UpdateAgentDto): Partial<Prisma.AgentUncheckedCreateInput> {
    return {
      ...(dto.agentCode !== undefined ? { agentCode: dto.agentCode.trim() } : {}),
      ...(dto.codeCenter !== undefined ? { codeCenter: dto.codeCenter.trim() } : {}),
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
      ...(dto.nation !== undefined ? { nation: dto.nation.trim().toUpperCase() } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone.trim() } : {}),
      ...(dto.fax !== undefined ? { fax: dto.fax.trim() } : {}),
      ...(dto.contactPerson !== undefined ? { contactPerson: dto.contactPerson.trim() } : {}),
      ...(dto.marketing !== undefined ? { marketing: dto.marketing.trim() } : {}),
      ...(dto.agentHO !== undefined ? { agentHO: dto.agentHO.trim() } : {}),
      ...(dto.typeCenter !== undefined ? { typeCenter: dto.typeCenter.trim() } : {}),
      ...(dto.agentType !== undefined ? { agentType: dto.agentType.trim() || 'AGENT' } : {}),
      ...(dto.typeGroup !== undefined ? { typeGroup: dto.typeGroup.trim() } : {}),
      ...(dto.navCode !== undefined ? { navCode: dto.navCode.trim() } : {}),
      ...(dto.email !== undefined ? { email: dto.email.trim() } : {}),
      ...(dto.taxId !== undefined ? { taxId: dto.taxId.trim() } : {}),
      ...(dto.branch !== undefined ? { branch: dto.branch.trim() } : {}),
      ...(dto.bankName !== undefined ? { bankName: dto.bankName.trim() } : {}),
      ...(dto.bankBranch !== undefined ? { bankBranch: dto.bankBranch.trim() } : {}),
      ...(dto.bankAccount !== undefined ? { bankAccount: dto.bankAccount.trim() } : {}),
      ...(dto.active !== undefined ? { active: dto.active } : {}),
    };
  }

  private toAliases(aliases: AgentAliasDto[]) {
    const seen = new Set<string>();
    return aliases
      .map((alias) => ({
        pattern: alias.pattern.trim(),
        matchType: alias.matchType ?? 'contains',
      }))
      .filter((alias) => {
        const key = `${alias.matchType}|${alias.pattern.toLowerCase()}`;
        if (!alias.pattern || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  private parseLegacyAgents(fileBase64: string) {
    const buffer = Buffer.from(fileBase64, 'base64');
    const text = this.decodeLegacyBuffer(buffer)
      .replace(/\u0000/g, '')
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, '');

    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => this.parseLegacyLine(line))
      .filter((agent) => agent.agentCode && agent.name);
  }

  private decodeLegacyBuffer(buffer: Buffer) {
    const sampleLength = Math.min(buffer.length, 4000);
    let oddNulls = 0;
    let evenNulls = 0;

    for (let index = 0; index < sampleLength; index += 1) {
      if (buffer[index] !== 0) {
        continue;
      }
      if (index % 2 === 0) {
        evenNulls += 1;
      } else {
        oddNulls += 1;
      }
    }

    const nullRatio = (oddNulls + evenNulls) / Math.max(sampleLength, 1);
    if (nullRatio > 0.12) {
      return oddNulls >= evenNulls ? buffer.toString('utf16le') : buffer.swap16().toString('utf16le');
    }

    return buffer.toString('utf8');
  }

  private parseLegacyLine(line: string): Prisma.AgentCreateManyInput {
    const cells = line.split(',').map((cell) => this.cleanLegacyValue(cell));
    const taxId = cells.find((cell) => /^\d{13}$/.test(cell)) ?? '';
    const bankAccount = [...cells].reverse().find((cell) => /^\d[\d-]{6,}$/.test(cell) && cell !== taxId) ?? '';
    const activeMatch = line.match(/,AGENT,([YN]),/i);
    const typeGroup = cells[cells.length - 1]?.startsWith('OT') || cells[cells.length - 1]?.startsWith('CT')
      ? cells[cells.length - 1]
      : '';
    const nation = cells.find((cell, index) => index > 10 && /^[A-Z]{2,3}$/.test(cell)) ?? '';
    const contactPerson = cells.find((cell) => cell.includes('คุณ')) ?? '';
    const phone = cells.find((cell) => /^\d{2,3}-?\d{3,4}-?\d{3,4}$/.test(cell)) ?? '';

    return {
      agentCode: cells[0] ?? '',
      codeCenter: cells[0] ?? '',
      name: cells[1] ?? '',
      address: cells.slice(2, 5).filter(Boolean).join(', '),
      nation,
      phone,
      fax: '',
      contactPerson,
      marketing: cells.find((cell) => cell === 'R') ?? '',
      agentHO: '',
      typeCenter: cells.find((cell) => cell === 'AGENT') ?? '',
      agentType: cells.find((cell) => cell === 'AGENT') ?? 'AGENT',
      typeGroup,
      navCode: cells.find((cell) => /^A[A-Z0-9]+$/.test(cell) && cell !== cells[0]) ?? '',
      email: cells.find((cell) => cell.includes('@')) ?? '',
      taxId,
      branch: cells.find((cell) => cell.includes('สำนักงานใหญ่')) ?? '',
      bankName: cells.find((cell) => cell.includes('ธ.')) ?? '',
      bankBranch: '',
      bankAccount,
      active: activeMatch ? activeMatch[1].toUpperCase() === 'Y' : true,
    };
  }

  private cleanLegacyValue(value: string) {
    return value.replace(/\u0000/g, '').replace(/[\u0001-\u001F]/g, '').trim();
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.agent.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('Agent not found');
    }
  }

  private async ensureUniqueAgentCode(agentCode: string, currentId?: string) {
    const existing = await this.prisma.agent.findUnique({ where: { agentCode } });
    if (existing && existing.id !== currentId) {
      throw new BadRequestException('Agent Code already used');
    }
  }
}
