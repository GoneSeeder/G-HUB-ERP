import { Controller, Get, Put, Body } from '@nestjs/common';
import { HumansourceOrgStructureService } from './humansource-org-structure.service';

@Controller('api/humansource/org-structure')
export class HumansourceOrgStructureController {
  constructor(private svc: HumansourceOrgStructureService) {}

  @Get('tree')     getTree()                          { return this.svc.getOrgTree(); }
  @Put('tree')     setTree(@Body() body: unknown)     { return this.svc.setOrgTree(body); }
  @Get('companies') getCompanies()                    { return this.svc.getCompanies(); }
  @Put('companies') setCompanies(@Body() body: unknown) { return this.svc.setCompanies(body); }
}
