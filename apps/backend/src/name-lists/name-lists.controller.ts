import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RequireAppAccess } from '../auth/decorators/app-access.decorator';
import { AppAccessGuard } from '../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNameListDto } from './dto/create-name-list.dto';
import { ImportNameListDto } from './dto/import-name-list.dto';
import { UpdateNameListDto } from './dto/update-name-list.dto';
import { NameListsService } from './name-lists.service';

@Controller('api/name-lists')
@UseGuards(JwtAuthGuard, AppAccessGuard)
@RequireAppAccess('information-name-list')
export class NameListsController {
  constructor(private readonly nameListsService: NameListsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('partyCode') partyCode?: string,
    @Query('agentCode') agentCode?: string,
    @Query('passport') passport?: string,
    @Query('busCode') busCode?: string,
    @Query('arriveDate') arriveDate?: string,
    @Query('excludeLinked') excludeLinked?: string,
    @Query('currentBonusCardId') currentBonusCardId?: string,
  ) {
    return this.nameListsService.findAll({
      search,
      partyCode,
      agentCode,
      passport,
      busCode,
      arriveDate,
      excludeLinked: excludeLinked === 'true',
      currentBonusCardId,
    });
  }

  @Get('next-code')
  nextCode(@Query('date') date?: string) {
    return this.nameListsService.nextCode(date);
  }

  @Get('meta/next-code')
  nextCodeMeta(@Query('date') date?: string) {
    return this.nameListsService.nextCode(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nameListsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateNameListDto) {
    return this.nameListsService.create(body);
  }

  @Post('import-preview')
  importPreview(@Body() body: ImportNameListDto) {
    return this.nameListsService.previewImport(body);
  }

  @Post('import')
  import(@Body() body: ImportNameListDto) {
    return this.nameListsService.importExcel(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateNameListDto) {
    return this.nameListsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nameListsService.remove(id);
  }
}
