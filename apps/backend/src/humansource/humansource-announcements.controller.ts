import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { HumansourceAnnouncementsService } from './humansource-announcements.service';
import { CreateAnnouncementCategoryDto, UpdateAnnouncementCategoryDto, CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

@Controller('api/humansource/announcements')
export class HumansourceAnnouncementsController {
  constructor(private svc: HumansourceAnnouncementsService) {}

  @Get('categories') findAllCategories() { return this.svc.findAllCategories(); }
  @Post('categories') createCategory(@Body() dto: CreateAnnouncementCategoryDto) { return this.svc.createCategory(dto); }
  @Patch('categories/:id') updateCategory(@Param('id') id: string, @Body() dto: UpdateAnnouncementCategoryDto) { return this.svc.updateCategory(id, dto); }
  @Delete('categories/:id') removeCategory(@Param('id') id: string) { return this.svc.removeCategory(id); }

  @Get() findAll(@Query('status') status?: string) { return this.svc.findAll(status); }
  @Post() create(@Body() dto: CreateAnnouncementDto) { return this.svc.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
