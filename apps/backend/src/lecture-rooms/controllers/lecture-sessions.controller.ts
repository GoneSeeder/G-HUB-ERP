import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RequireAppAccess } from '../../auth/decorators/app-access.decorator';
import { AppAccessGuard } from '../../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AssignSessionDto } from '../dto/session.dto';
import { LectureSessionsService } from '../services/lecture-sessions.service';

@Controller('api')
@UseGuards(JwtAuthGuard, AppAccessGuard)
@RequireAppAccess('information-lecture-room')
export class LectureSessionsController {
  constructor(private readonly lectureSessionsService: LectureSessionsService) {}

  @Get('lecture-sessions')
  findAll() {
    return this.lectureSessionsService.findAll();
  }

  @Post('lecture-sessions')
  assign(@Body() dto: AssignSessionDto) {
    return this.lectureSessionsService.assign(dto);
  }

  @Delete('lecture-sessions/:id')
  adminClear(@Param('id') id: string) {
    return this.lectureSessionsService.adminClear(id);
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
  end(@Param('roomCode') roomCode: string) {
    return this.lectureSessionsService.end(roomCode);
  }

  @Get('lecture-rooms/history')
  getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 50;
    return this.lectureSessionsService.getHistory(p, l);
  }

  @Get('lecture-sessions/history')
  getSessionHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 50;
    return this.lectureSessionsService.getHistory(p, l);
  }
}
