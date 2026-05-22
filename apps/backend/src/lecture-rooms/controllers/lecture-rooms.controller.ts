import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RequireAppAccess } from '../../auth/decorators/app-access.decorator';
import { AppAccessGuard } from '../../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto';
import { LectureRoomsService } from '../services/lecture-rooms.service';

@Controller('api/lecture-rooms')
@UseGuards(JwtAuthGuard, AppAccessGuard)
@RequireAppAccess('information-lecture-room')
export class LectureRoomsController {
  constructor(private readonly lectureRoomsService: LectureRoomsService) {}

  @Get()
  findAll() {
    return this.lectureRoomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lectureRoomsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.lectureRoomsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.lectureRoomsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lectureRoomsService.remove(id);
  }
}
