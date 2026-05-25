import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { BonusCardsController } from './bonus-cards.controller';
import { BonusCardsService } from './bonus-cards.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [BookingsModule],
  controllers: [BonusCardsController, ReportsController],
  providers: [BonusCardsService],
})
export class BonusCardsModule {}
