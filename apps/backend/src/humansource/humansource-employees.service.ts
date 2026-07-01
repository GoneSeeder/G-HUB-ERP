import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

const ORG_TREE_KEY = 'org-tree';
const COMPANIES_KEY = 'companies';

export type EmployeeDto = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  branch: string;
  empType: string;
  schedule: string;
  startDate: string;
  salary: number;
  status: string;
  active: boolean;
  companyId: string;
  branchNodeId: string;
  departmentNodeId: string;
  positionId: string;
  employeeTypeId: string;
  supervisorId: string | null;
};

type EmployeeRow = EmployeeDto & {
  payrollEmploymentTypeId?: string | null;
  shiftId?: string | null;
  title?: string;
  firstName?: string;
  lastName?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  nickname?: string;
  birthDate?: string;
  nationality?: string;
  idNumber?: string;
  personalInfo?: unknown;
  addressInfo?: unknown;
  payrollInfo?: unknown;
  socialSecurityInfo?: unknown;
  taxInfo?: unknown;
  documents?: unknown;
  workHistory?: unknown;
  educationHistory?: unknown;
  familyInfo?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
};

type MasterRef = {
  companies: Array<{ id: string; tradeName: string; active: boolean; orgNodeId?: string | null }>;
  orgNodes: Array<{ id: string; name: string; type: string; parentId: string | null; active: boolean }>;
  positions: Array<{ id: string; nameTh: string; jobLevelId: string; active: boolean }>;
  employeeTypes: Array<{ id: string; nameTh: string; active: boolean }>;
  payrollEmploymentTypes: Array<{ id: string; nameTh: string; active: boolean }>;
  shifts: Array<{ id: string; name: string; enabled: boolean }>;
};

type StoredOrgNode = {
  id?: unknown;
  name?: unknown;
  type?: unknown;
  active?: unknown;
  children?: unknown;
};

type StoredCompany = {
  id?: unknown;
  orgNodeId?: unknown;
  tradeName?: unknown;
  legalNameTh?: unknown;
  name?: unknown;
  active?: unknown;
  workConditions?: unknown;
  branches?: unknown;
};

@Injectable()
export class HumansourceEmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EmployeeDto[]> {
    const [rows, refs] = await Promise.all([
      this.prisma.hrEmployee.findMany({ orderBy: { code: 'asc' } }),
      this.getRefs(),
    ]);
    return rows.map((row) => this.toListDto(this.withResolvedMasterLabels(row as EmployeeRow, refs)));
  }

  async findOne(id: string) {
    const row = await this.prisma.hrEmployee.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Employee ${id} not found`);
    return this.toDetailDto(row as EmployeeRow);
  }

  async getMasterData() {
    const [companies, orgNodes, positions, jobLevels, employeeTypes, payrollEmploymentTypes, shifts, defaults, employees] =
      await Promise.all([
        this.getCompaniesForMasterData(),
        this.getOrgNodesForMasterData(),
        this.prisma.hrPosition.findMany({ orderBy: { nameTh: 'asc' } }),
        this.prisma.hrJobLevel.findMany({ orderBy: { rank: 'asc' } }),
        this.prisma.hrEmployeeType.findMany({ orderBy: { id: 'asc' } }),
        this.prisma.hrPayrollEmploymentType.findMany({ orderBy: { id: 'asc' } }),
        this.prisma.hrShift.findMany({ orderBy: { code: 'asc' } }),
        this.prisma.hrEmployeeDefaults.upsert({
          where: { id: 'default' },
          update: {},
          create: { id: 'default' },
        }),
        this.prisma.hrEmployee.findMany({
          where: { active: true },
          select: {
            id: true,
            code: true,
            name: true,
            position: true,
            department: true,
            companyId: true,
            branchNodeId: true,
            departmentNodeId: true,
            positionId: true,
            active: true,
          },
          orderBy: { name: 'asc' },
        }),
      ]);

    return {
      companies,
      orgNodes,
      branches: orgNodes.filter((node) => node.type === 'branch'),
      departments: orgNodes.filter((node) => node.type === 'department'),
      positions,
      jobLevels,
      employeeTypes,
      payrollEmploymentTypes,
      shifts,
      supervisors: employees,
      defaults,
      optionLists: this.employeeMasterOptionLists(),
    };
  }

  async create(dto: CreateEmployeeDto) {
    const refs = await this.getRefs();
    const id = dto.id?.trim() || await this.nextEmployeeId();
    const code = (dto.employeeCode ?? dto.code)?.trim() || await this.nextEmployeeCode();
    await this.ensureUniqueCode(code);
    const data = this.buildCreateData(dto, refs, id, code);
    const row = await this.prisma.hrEmployee.create({ data: data as any });
    return this.toDetailDto(row as EmployeeRow);
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const found = await this.prisma.hrEmployee.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Employee ${id} not found`);
    const nextCode = dto.employeeCode ?? dto.code;
    if (nextCode && nextCode !== found.code) await this.ensureUniqueCode(nextCode, id);
    const refs = await this.getRefs();
    const data = this.buildUpdateData(dto, refs, found as EmployeeRow);
    const row = await this.prisma.hrEmployee.update({ where: { id }, data: data as any });
    return this.toDetailDto(row as EmployeeRow);
  }

  private toListDto(row: EmployeeRow): EmployeeDto {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      email: row.email,
      phone: row.phone,
      position: row.position,
      department: row.department,
      branch: row.branch,
      empType: row.empType,
      schedule: row.schedule,
      startDate: row.startDate,
      salary: row.salary,
      status: row.status,
      active: row.active,
      companyId: row.companyId,
      branchNodeId: row.branchNodeId,
      departmentNodeId: row.departmentNodeId,
      positionId: row.positionId,
      employeeTypeId: row.employeeTypeId,
      supervisorId: row.supervisorId ?? null,
    };
  }

  private withResolvedMasterLabels(row: EmployeeRow, refs: MasterRef): EmployeeRow {
    const resolved = this.resolveDisplay(
      {
        companyId: row.companyId,
        branchNodeId: row.branchNodeId,
        departmentNodeId: row.departmentNodeId,
        positionId: row.positionId,
        employeeTypeId: row.employeeTypeId,
        shiftId: row.shiftId ?? undefined,
      },
      refs,
      row,
    );
    return {
      ...row,
      position: resolved.position,
      department: resolved.department,
      branch: resolved.branch,
      empType: resolved.empType,
      schedule: resolved.schedule,
    };
  }

  private toDetailDto(row: EmployeeRow) {
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row;
    return rest;
  }

  private async getRefs(): Promise<MasterRef> {
    const [companies, orgNodes, positions, employeeTypes, payrollEmploymentTypes, shifts] = await Promise.all([
      this.getCompaniesForMasterData(),
      this.getOrgNodesForMasterData(),
      this.prisma.hrPosition.findMany({ select: { id: true, nameTh: true, jobLevelId: true, active: true } }),
      this.prisma.hrEmployeeType.findMany({ select: { id: true, nameTh: true, active: true } }),
      this.prisma.hrPayrollEmploymentType.findMany({ select: { id: true, nameTh: true, active: true } }),
      this.prisma.hrShift.findMany({ select: { id: true, name: true, enabled: true } }),
    ]);
    return { companies, orgNodes, positions, employeeTypes, payrollEmploymentTypes, shifts };
  }

  private async getCompaniesForMasterData(): Promise<MasterRef['companies']> {
    const storedCompanies = await this.readJsonStore(COMPANIES_KEY);
    const companies = this.normalizeStoredCompanies(storedCompanies);
    if (companies.length > 0) return companies;
    return this.prisma.hrCompany.findMany({
      select: { id: true, tradeName: true, active: true, orgNodeId: true },
      orderBy: { tradeName: 'asc' },
    });
  }

  private async getOrgNodesForMasterData(): Promise<MasterRef['orgNodes']> {
    const storedTree = await this.readJsonStore(ORG_TREE_KEY);
    const orgNodes = this.flattenStoredOrgTree(storedTree);
    if (orgNodes.length > 0) return orgNodes;
    return this.prisma.hrOrgNode.findMany({
      select: { id: true, name: true, type: true, parentId: true, active: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  private async readJsonStore(key: string): Promise<unknown> {
    const row = await this.prisma.hrJsonStore.findUnique({ where: { key } });
    return row?.value ?? null;
  }

  private normalizeStoredCompanies(value: unknown): MasterRef['companies'] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => this.normalizeStoredCompany(item))
      .filter((item): item is MasterRef['companies'][number] => item !== null)
      .sort((a, b) => a.tradeName.localeCompare(b.tradeName, 'th'));
  }

  private normalizeStoredCompany(value: unknown): MasterRef['companies'][number] | null {
    if (!this.isRecord(value)) return null;
    const company = value as StoredCompany;
    const id = this.stringValue(company.id) || this.stringValue(company.orgNodeId);
    const tradeName =
      this.stringValue(company.tradeName) ||
      this.stringValue(company.name) ||
      this.stringValue(company.legalNameTh);
    if (!id || !tradeName) return null;
    const orgNodeId = this.stringValue(company.orgNodeId) || undefined;
    return {
      id,
      tradeName,
      active: typeof company.active === 'boolean' ? company.active : true,
      orgNodeId,
    };
  }

  private flattenStoredOrgTree(value: unknown): MasterRef['orgNodes'] {
    if (!Array.isArray(value)) return [];
    const nodes: MasterRef['orgNodes'] = [];
    const walk = (items: unknown[], parentId: string | null) => {
      for (const item of items) {
        if (!this.isRecord(item)) continue;
        const node = item as StoredOrgNode;
        const id = this.stringValue(node.id);
        const name = this.stringValue(node.name);
        const type = this.stringValue(node.type);
        if (id && name && type) {
          nodes.push({
            id,
            name,
            type,
            parentId,
            active: typeof node.active === 'boolean' ? node.active : true,
          });
        }
        if (Array.isArray(node.children)) walk(node.children, id || parentId);
      }
    };
    walk(value, null);
    return nodes;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private stringValue(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
  }

  private buildCreateData(dto: CreateEmployeeDto, refs: MasterRef, id: string, code: string) {
    const resolved = this.resolveDisplay(dto, refs);
    const personalInfo = {
      title: dto.title ?? '',
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      firstNameEn: dto.firstNameEn ?? '',
      lastNameEn: dto.lastNameEn ?? '',
      nickname: dto.nickname ?? '',
      birthDate: dto.birthDate ?? '',
      nationality: dto.nationality ?? '',
      idNumber: dto.idNumber ?? '',
      ...(dto.personalInfo ?? {}),
    };
    return {
      id,
      code,
      name: dto.name?.trim() || this.composeName(dto) || code,
      email: (dto.personalEmail ?? dto.email ?? '').trim(),
      phone: (dto.mobile ?? dto.phone ?? '').trim(),
      position: resolved.position,
      department: resolved.department,
      branch: resolved.branch,
      empType: resolved.empType,
      schedule: resolved.schedule,
      startDate: dto.startDate ?? '',
      salary: dto.salary ?? this.numberFromInfo(dto.payrollInfo, 'salaryRate'),
      status: dto.status ?? 'ปกติ',
      active: dto.active ?? true,
      companyId: dto.companyId,
      branchNodeId: dto.branchNodeId,
      departmentNodeId: dto.departmentNodeId,
      positionId: dto.positionId,
      employeeTypeId: dto.employeeTypeId,
      payrollEmploymentTypeId: dto.payrollEmploymentTypeId ?? null,
      supervisorId: dto.supervisorId ?? null,
      shiftId: dto.shiftId ?? null,
      title: dto.title ?? '',
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      firstNameEn: dto.firstNameEn ?? '',
      lastNameEn: dto.lastNameEn ?? '',
      nickname: dto.nickname ?? '',
      birthDate: dto.birthDate ?? '',
      nationality: dto.nationality ?? '',
      idNumber: dto.idNumber ?? '',
      personalInfo,
      addressInfo: dto.addressInfo ?? {},
      payrollInfo: dto.payrollInfo ?? {},
      socialSecurityInfo: dto.socialSecurityInfo ?? {},
      taxInfo: dto.taxInfo ?? {},
      documents: dto.documents ?? [],
      workHistory: dto.workHistory ?? [],
      educationHistory: dto.educationHistory ?? [],
      familyInfo: dto.familyInfo ?? [],
    };
  }

  private buildUpdateData(dto: UpdateEmployeeDto, refs: MasterRef, current: EmployeeRow) {
    const resolved = this.resolveDisplay(dto, refs, current);
    const data: Record<string, unknown> = {};
    const assign = (key: string, value: unknown) => {
      if (value !== undefined) data[key] = value;
    };
    assign('code', dto.employeeCode ?? dto.code);
    if (dto.name !== undefined) {
      assign('name', dto.name);
    } else if (dto.title !== undefined || dto.firstName !== undefined || dto.lastName !== undefined) {
      assign('name', this.composeName(dto));
    }
    assign('email', dto.personalEmail ?? dto.email);
    assign('phone', dto.mobile ?? dto.phone);
    assign('position', resolved.position);
    assign('department', resolved.department);
    assign('branch', resolved.branch);
    assign('empType', resolved.empType);
    assign('schedule', resolved.schedule);
    assign('startDate', dto.startDate);
    assign('salary', dto.salary);
    assign('status', dto.status);
    assign('active', dto.active);
    assign('companyId', dto.companyId);
    assign('branchNodeId', dto.branchNodeId);
    assign('departmentNodeId', dto.departmentNodeId);
    assign('positionId', dto.positionId);
    assign('employeeTypeId', dto.employeeTypeId);
    assign('payrollEmploymentTypeId', dto.payrollEmploymentTypeId);
    assign('supervisorId', dto.supervisorId);
    assign('shiftId', dto.shiftId);
    assign('title', dto.title);
    assign('firstName', dto.firstName);
    assign('lastName', dto.lastName);
    assign('firstNameEn', dto.firstNameEn);
    assign('lastNameEn', dto.lastNameEn);
    assign('nickname', dto.nickname);
    assign('birthDate', dto.birthDate);
    assign('nationality', dto.nationality);
    assign('idNumber', dto.idNumber);
    assign('personalInfo', this.mergeJson(current.personalInfo, {
      ...(dto.personalInfo ?? {}),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.firstNameEn !== undefined && { firstNameEn: dto.firstNameEn }),
      ...(dto.lastNameEn !== undefined && { lastNameEn: dto.lastNameEn }),
      ...(dto.nickname !== undefined && { nickname: dto.nickname }),
      ...(dto.birthDate !== undefined && { birthDate: dto.birthDate }),
      ...(dto.nationality !== undefined && { nationality: dto.nationality }),
      ...(dto.idNumber !== undefined && { idNumber: dto.idNumber }),
    }));
    assign('addressInfo', dto.addressInfo);
    assign('payrollInfo', dto.payrollInfo);
    assign('socialSecurityInfo', dto.socialSecurityInfo);
    assign('taxInfo', dto.taxInfo);
    assign('documents', dto.documents);
    assign('workHistory', dto.workHistory);
    assign('educationHistory', dto.educationHistory);
    assign('familyInfo', dto.familyInfo);
    return data;
  }

  private resolveDisplay(dto: Partial<CreateEmployeeDto>, refs: MasterRef, current?: EmployeeRow) {
    const company = dto.company ?? refs.companies.find((item) => item.id === dto.companyId)?.tradeName;
    const branch = dto.branch ?? refs.orgNodes.find((item) => item.id === dto.branchNodeId)?.name;
    const department = dto.department ?? refs.orgNodes.find((item) => item.id === dto.departmentNodeId)?.name;
    const position = dto.position ?? refs.positions.find((item) => item.id === dto.positionId)?.nameTh;
    const empType = dto.empType ?? refs.employeeTypes.find((item) => item.id === dto.employeeTypeId)?.nameTh;
    const schedule = dto.schedule ?? refs.shifts.find((item) => item.id === dto.shiftId)?.name;
    return {
      company: company ?? current?.companyId ?? '',
      branch: branch ?? current?.branch ?? '',
      department: department ?? current?.department ?? '',
      position: position ?? current?.position ?? '',
      empType: empType ?? current?.empType ?? '',
      schedule: schedule ?? current?.schedule ?? '',
    };
  }

  private composeName(dto: Partial<CreateEmployeeDto>) {
    return [dto.title, dto.firstName, dto.lastName].filter(Boolean).join(' ').trim();
  }

  private numberFromInfo(info: Record<string, unknown> | undefined, key: string) {
    const value = info?.[key];
    const number = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^\d.]/g, ''));
    return Number.isFinite(number) ? Math.round(number) : 0;
  }

  private mergeJson(base: unknown, patch: Record<string, unknown>) {
    if (Object.keys(patch).length === 0) return undefined;
    return { ...(typeof base === 'object' && base ? base as Record<string, unknown> : {}), ...patch };
  }

  private async ensureUniqueCode(code: string, exceptId?: string) {
    const found = await this.prisma.hrEmployee.findUnique({ where: { code } });
    if (found && found.id !== exceptId) throw new BadRequestException(`Employee code ${code} already exists`);
  }

  private async nextEmployeeId() {
    const rows = await this.prisma.hrEmployee.findMany({ select: { id: true } });
    const max = rows.reduce((acc, row) => {
      const n = Number(row.id.replace(/^EMP0*/, ''));
      return Number.isFinite(n) && n > acc ? n : acc;
    }, 0);
    return `EMP${String(max + 1).padStart(4, '0')}`;
  }

  private async nextEmployeeCode() {
    const rows = await this.prisma.hrEmployee.findMany({ select: { code: true } });
    const max = rows.reduce((acc, row) => {
      const n = Number(row.code.replace(/\D/g, ''));
      return Number.isFinite(n) && n > acc ? n : acc;
    }, 20000);
    return String(max + 1);
  }

  private employeeMasterOptionLists() {
    return {
      titles: ['นาย', 'นาง', 'นางสาว'],
      nationalities: ['ไทย', 'ต่างชาติ'],
      banks: ['ธนาคารกสิกรไทย (KBANK)', 'ธนาคารไทยพาณิชย์ (SCB)', 'ธนาคารกรุงไทย (KTB)', 'ธนาคารกรุงเทพ (BBL)', 'ธนาคารทหารไทยธนชาต (TTB)'],
      statuses: ['ปกติ', 'ทดลองงาน', 'ลาพักร้อน', 'สิ้นสุดสัญญา', 'ลาออก'],
      socialSecurityStatuses: ['ขึ้นทะเบียนผู้ประกันตนใหม่', 'มีผู้ประกันตนอยู่แล้ว', 'ไม่เข้าประกันสังคม'],
      taxMethods: ['คำนวณภาษีแบบเฉลี่ยทั้งปี', 'หัก ณ ที่จ่ายตามจริง', 'ไม่คำนวณภาษี'],
      providentFund: ['ไม่เข้าร่วม', 'เข้าร่วมกองทุน'],
      educationLevels: ['มัธยมศึกษา', 'ปวช.', 'ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'],
      relationships: ['บิดา', 'มารดา', 'คู่สมรส', 'พี่น้อง', 'ญาติ', 'เพื่อน'],
    };
  }

  staticOptionLists() {
    return {
      titles: ['นาย', 'นาง', 'นางสาว'],
      nationalities: ['ไทย', 'ต่างชาติ'],
      banks: ['ธนาคารกสิกรไทย (KBANK)', 'ธนาคารไทยพาณิชย์ (SCB)', 'ธนาคารกรุงไทย (KTB)', 'ธนาคารกรุงเทพ (BBL)', 'ธนาคารทหารไทยธนชาต (TTB)'],
      statuses: ['ปกติ', 'ทดลองงาน', 'ลาพักร้อน', 'สิ้นสุดสัญญา', 'ลาออก'],
      socialSecurityStatuses: ['ขึ้นทะเบียนผู้ประกันตนใหม่', 'มีผู้ประกันตนอยู่แล้ว', 'ไม่เข้าประกันสังคม'],
      taxMethods: ['คำนวณภาษีแบบเฉลี่ยทั้งปี', 'หัก ณ ที่จ่ายตามจริง', 'ไม่คำนวณภาษี'],
      providentFund: ['ไม่เข้าร่วม', 'เข้าร่วมกองทุน'],
      educationLevels: ['มัธยมศึกษา', 'ปวช.', 'ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'],
      relationships: ['บิดา', 'มารดา', 'คู่สมรส', 'พี่น้อง', 'ญาติ', 'เพื่อน'],
    };
  }
}
