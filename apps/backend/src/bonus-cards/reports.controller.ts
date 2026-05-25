import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RequireAppAccess } from '../auth/decorators/app-access.decorator';
import { AppAccessGuard } from '../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from '../bookings/bookings.service';
import { BonusCardsService } from './bonus-cards.service';

@Controller('api/reports')
@UseGuards(JwtAuthGuard, AppAccessGuard)
@RequireAppAccess('information-report')
export class ReportsController {
  constructor(
    private readonly bonusCardsService: BonusCardsService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Get('bonus-cards')
  bonusCards(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bonusCardsService.findAll({ from, to });
  }

  @Get('bookings')
  bookings(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bookingsService.findAll({ from, to });
  }
}
