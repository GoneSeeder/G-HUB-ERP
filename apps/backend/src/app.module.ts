import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';
import { PermissionsModule } from './permissions/permissions.module';
import { BonusCardsModule } from './bonus-cards/bonus-cards.module';
import { MembersModule } from './members/members.module';
import { BookingsModule } from './bookings/bookings.module';
import { AgentsModule } from './agents/agents.module';
import { NameListsModule } from './name-lists/name-lists.module';
import { LectureRoomsModule } from './lecture-rooms/lecture-rooms.module';
import { ReferenceDataModule } from './reference-data/reference-data.module';
import { HumansourceAuthModule } from './humansource-auth/humansource-auth.module';
import { HumansourceModule } from './humansource/humansource.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AppsModule,
    PermissionsModule,
    BonusCardsModule,
    MembersModule,
    AgentsModule,
    BookingsModule,
    NameListsModule,
    LectureRoomsModule,
    ReferenceDataModule,
    HumansourceAuthModule,
    HumansourceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
