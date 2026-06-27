import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateJobLevelDto, UpdateJobLevelDto } from './dto/job-level.dto';
import { HumansourceJobLevelsService } from './humansource-job-levels.service';

@Controller('api/humansource/job-levels')
export class HumansourceJobLevelsController {
  constructor(private readonly service: HumansourceJobLevelsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateJobLevelDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJobLevelDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
