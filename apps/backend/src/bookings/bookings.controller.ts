import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RequireAppAccess } from '../auth/decorators/app-access.decorator';
import { AppAccessGuard } from '../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('api/bookings')
@UseGuards(JwtAuthGuard, AppAccessGuard)
@RequireAppAccess('information-booking')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('agent') agent?: string,
    @Query('nation') nation?: string,
    @Query('status') status?: string,
    @Query('upload') upload?: string,
    @Query('search') search?: string,
  ) {
    return this.bookingsService.findAll({ date, agent, nation, status, upload, search });
  }

  @Post()
  create(@Body() body: CreateBookingDto) {
    return this.bookingsService.create(body);
  }

  @Post('import-separate')
  importSeparate(@Body() body: {
    mainFileName: string;
    mainFileBase64: string;
    detailFileName?: string;
    detailFileBase64?: string;
    clientImportedAt?: string;
  }) {
    return this.bookingsService.importSeparateFiles(body);
  }

  @Post('import-preview')
  importPreview(@Body() body: {
    mainFileName: string;
    mainFileBase64: string;
    detailFileName?: string;
    detailFileBase64?: string;
  }) {
    return this.bookingsService.previewImportFiles(body);
  }

  @Post('agent-matching')
  matchAgents(@Body() body: { ids: string[] }) {
    return this.bookingsService.matchSelectedAgents(body.ids);
  }

  @Get('agent-options')
  findAgentOptions(@Query('search') search?: string) {
    return this.bookingsService.findAgentOptions(search);
  }

  @Get('agent-matchings')
  findAgentMatchings(@Query('search') search?: string) {
    return this.bookingsService.findAgentMatchings({ search });
  }

  @Get('bonus-source')
  findBonusSourceRows(@Query('date') date: string) {
    return this.bookingsService.findBonusSourceRows(date);
  }

  @Post('generate-bonus-codes')
  generateBonusCodes(@Body() body: { ids: string[] }) {
    return this.bookingsService.generateBonusCodes(body.ids);
  }

  @Post('agent-matchings')
  createAgentMatching(@Body() body: { agentCodeRef: string; agentNameRef?: string; agentId?: string; agentCode?: string }) {
    return this.bookingsService.createAgentMatching(body);
  }

  @Post('agent-matchings/import-sql')
  importAgentMatchingSql(@Body() body: { fileBase64: string }) {
    return this.bookingsService.importAgentMatchingSql(body.fileBase64);
  }

  @Patch('agent-matchings/:id')
  updateAgentMatching(
    @Param('id') id: string,
    @Body() body: { agentCodeRef?: string; agentNameRef?: string; agentId?: string; agentCode?: string },
  ) {
    return this.bookingsService.updateAgentMatching(id, body);
  }

  @Delete('agent-matchings/:id')
  removeAgentMatching(@Param('id') id: string) {
    return this.bookingsService.removeAgentMatching(id);
  }

  @Post('create-bonus-cards')
  createBonusCards(@Body() body: { entries: Array<{ id: string; bonus: string }> }) {
    return this.bookingsService.createBonusCardsFromBookings(body.entries ?? []);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateBookingDto) {
    return this.bookingsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
