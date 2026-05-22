import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RequireAppAccess } from '../../auth/decorators/app-access.decorator';
import { AppAccessGuard } from '../../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateSpeakerDto, UpdateSpeakerDto } from '../dto/speaker.dto';
import { SpeakersService } from '../services/speakers.service';

@Controller('api/speakers')
@UseGuards(JwtAuthGuard, AppAccessGuard)
@RequireAppAccess('information-lecture-room')
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Get()
  findAll() {
    return this.speakersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speakersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSpeakerDto) {
    return this.speakersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSpeakerDto) {
    return this.speakersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speakersService.remove(id);
  }
}
