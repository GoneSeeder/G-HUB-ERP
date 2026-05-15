import { Module } from '@nestjs/common';
import { BonusCardsController } from './bonus-cards.controller';
import { BonusCardsService } from './bonus-cards.service';

@Module({
  controllers: [BonusCardsController],
  providers: [BonusCardsService],
})
export class BonusCardsModule {}
