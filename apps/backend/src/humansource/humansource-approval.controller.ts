import { Controller, Get, Patch, Post, Delete, Body, Param } from '@nestjs/common';
import { HumansourceApprovalService } from './humansource-approval.service';
import { UpdateApprovalConfigDto, UpsertPersonApproverDto } from './dto/approval.dto';

@Controller('api/humansource/approval')
export class HumansourceApprovalController {
  constructor(private svc: HumansourceApprovalService) {}

  @Get('configs') findAllConfigs() { return this.svc.findAllConfigs(); }
  @Patch('configs/:docType') updateConfig(@Param('docType') docType: string, @Body() dto: UpdateApprovalConfigDto) {
    return this.svc.updateConfig(docType, dto);
  }

  @Get('person-approvers') findAllPersonApprovers() { return this.svc.findAllPersonApprovers(); }
  @Post('person-approvers') upsertPersonApprover(@Body() dto: UpsertPersonApproverDto) {
    return this.svc.upsertPersonApprover(dto);
  }
  @Delete('person-approvers/:employeeId') removePersonApprover(@Param('employeeId') employeeId: string) {
    return this.svc.removePersonApprover(employeeId);
  }
}
