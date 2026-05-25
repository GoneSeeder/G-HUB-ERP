import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LectureRoomsController } from './controllers/lecture-rooms.controller';
import { SpeakersController } from './controllers/speakers.controller';
import { LectureSessionsController } from './controllers/lecture-sessions.controller';
import { PublicLectureController } from './controllers/public-lecture.controller';
import { LectureRoomsService } from './services/lecture-rooms.service';
import { SpeakersService } from './services/speakers.service';
import { LectureSessionsService } from './services/lecture-sessions.service';
import { LectureRoomGateway } from './lecture-room.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [
    LectureRoomsController,
    SpeakersController,
    LectureSessionsController,
    PublicLectureController,
  ],
  providers: [
    LectureRoomsService,
    SpeakersService,
    LectureSessionsService,
    LectureRoomGateway,
  ],
  exports: [
    LectureRoomsService,
    SpeakersService,
    LectureSessionsService,
    LectureRoomGateway,
  ],
})
export class LectureRoomsModule {}
