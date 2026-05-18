import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NameListsController } from './name-lists.controller';
import { NameListsService } from './name-lists.service';

@Module({
  imports: [PrismaModule],
  controllers: [NameListsController],
  providers: [NameListsService],
})
export class NameListsModule {}
