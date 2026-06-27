import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { HumansourceLeaveRuntimeService } from './humansource-leave-runtime.service';
import { CreateLeaveRequestDto, UpdateLeaveRequestStatusDto, UpsertLeaveBalanceDto } from './dto/leave-runtime.dto';

@Controller('api/humansource/leave')
export class HumansourceLeaveRuntimeController {
  constructor(private readonly service: HumansourceLeaveRuntimeService) {}

  // --- Requests ---
  @Get('requests')
  listRequests(@Query('employeeId') employeeId?: string, @Query('status') status?: string) {
    return this.service.listRequests(employeeId, status);
  }

  @Get('requests/:id')
  getRequest(@Param('id') id: string) {
    return this.service.getRequest(id);
  }

  @Post('requests')
  createRequest(@Body() dto: CreateLeaveRequestDto) {
    return this.service.createRequest(dto);
  }

  @Patch('requests/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveRequestStatusDto) {
    return this.service.updateRequestStatus(id, dto);
  }

  @Delete('requests/:id')
  deleteRequest(@Param('id') id: string) {
    return this.service.deleteRequest(id);
  }

  // --- Balances ---
  @Get('balances')
  listBalances(@Query('employeeId') employeeId: string, @Query('year') year: string) {
    return this.service.listBalances(employeeId, parseInt(year));
  }

  @Post('balances')
  upsertBalance(@Body() dto: UpsertLeaveBalanceDto) {
    return this.service.upsertBalance(dto);
  }
}
