import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CloseSaleDto } from '../dto/session.dto';
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

  @Post('lecture-rooms/display/:roomCode/start')
  start(@Param('roomCode') roomCode: string) {
    return this.lectureSessionsService.start(roomCode);
  }

  @Post('lecture-rooms/display/:roomCode/end')
  stopLecture(@Param('roomCode') roomCode: string) {
    return this.lectureSessionsService.end(roomCode);
  }

  @Post('lecture-rooms/display/:roomCode/close-sale')
  closeSale(@Param('roomCode') roomCode: string, @Body() dto: CloseSaleDto) {
    return this.lectureSessionsService.closeSale(roomCode, dto);
  }
}
