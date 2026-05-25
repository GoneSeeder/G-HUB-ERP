import { Controller, Get, Param } from '@nestjs/common';
import { LectureRoomsService } from '../services/lecture-rooms.service';
import { LectureSessionsService } from '../services/lecture-sessions.service';

@Controller('api/public')
export class PublicLectureController {
  constructor(
    private readonly lectureRoomsService: LectureRoomsService,
    private readonly lectureSessionsService: LectureSessionsService,
  ) {}

  @Get('lecture-rooms')
  findRooms() {
    return this.lectureRoomsService.findAll();
  }

  @Get('lecture-sessions')
  findSessions() {
    return this.lectureSessionsService.findAll();
  }

  @Get('lecture-rooms/display/:roomCode')
  getDisplayState(@Param('roomCode') roomCode: string) {
    return this.lectureSessionsService.getDisplayState(roomCode);
  }
}
