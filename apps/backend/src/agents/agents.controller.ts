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
import { Roles } from '../auth/decorators/roles.decorator';
import { AppAccessGuard } from '../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Controller('api/agents')
@UseGuards(JwtAuthGuard, AppAccessGuard)
@RequireAppAccess('information-member')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('nation') nation?: string,
    @Query('active') active?: string,
    @Query('typeGroup') typeGroup?: string,
  ) {
    return this.agentsService.findAll({ page, search, nation, active, typeGroup });
  }

  @Post()
  create(@Body() body: CreateAgentDto) {
    return this.agentsService.create(body);
  }

  @Post('import-legacy')
  @UseGuards(JwtAuthGuard, AppAccessGuard, RolesGuard)
  @Roles('admin')
  importLegacy(@Body() body: { fileBase64: string }) {
    return this.agentsService.importLegacy(body);
  }

  @Post('import-legacy-preview')
  @UseGuards(JwtAuthGuard, AppAccessGuard, RolesGuard)
  @Roles('admin')
  previewLegacy(@Body() body: { fileBase64: string }) {
    return this.agentsService.previewLegacy(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAgentDto) {
    return this.agentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentsService.remove(id);
  }
}
