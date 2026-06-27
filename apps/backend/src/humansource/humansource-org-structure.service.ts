import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ORG_TREE_KEY = 'org-tree';
const COMPANIES_KEY = 'companies';

@Injectable()
export class HumansourceOrgStructureService {
  constructor(private prisma: PrismaService) {}

  async getOrgTree() {
    const row = await this.prisma.hrJsonStore.findUnique({ where: { key: ORG_TREE_KEY } });
    return row?.value ?? [];
  }

  async setOrgTree(value: unknown) {
    return this.prisma.hrJsonStore.upsert({
      where: { key: ORG_TREE_KEY },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { key: ORG_TREE_KEY, value: value as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { value: value as any },
    });
  }

  async getCompanies() {
    const row = await this.prisma.hrJsonStore.findUnique({ where: { key: COMPANIES_KEY } });
    return row?.value ?? [];
  }

  async setCompanies(value: unknown) {
    return this.prisma.hrJsonStore.upsert({
      where: { key: COMPANIES_KEY },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { key: COMPANIES_KEY, value: value as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { value: value as any },
    });
  }
}
