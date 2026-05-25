import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireAppAccess } from '../auth/decorators/app-access.decorator';
import { AppAccessGuard } from '../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CreateReferenceItemDto, UpdateReferenceItemDto } from './dto/reference-item.dto';
import { ReferenceDataService } from './reference-data.service';

@Controller('api/reference-data')
@UseGuards(JwtAuthGuard, AppAccessGuard)
@RequireAppAccess('information-bonus-card')
export class ReferenceDataController {
  constructor(private readonly referenceDataService: ReferenceDataService) {}

  @Get(':type')
  findAll(
    @Param('type') type: string,
    @Query('search') search?: string,
    @Query('nationCode') nationCode?: string,
  ) {
    return this.referenceDataService.findAll(type, { search, nationCode });
  }

  @Post(':type')
  create(@Param('type') type: string, @Body() body: CreateReferenceItemDto, @CurrentUser() user: AuthUser) {
    return this.referenceDataService.create(type, body, user);
  }

  @Patch(':type/:id')
  update(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: UpdateReferenceItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.referenceDataService.update(type, id, body, user);
  }

  @Delete(':type/:id')
  remove(@Param('type') type: string, @Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.referenceDataService.remove(type, id, user);
  }
}
