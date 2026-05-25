import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireAppAccess } from '../auth/decorators/app-access.decorator';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { AppAccessGuard } from '../auth/guards/app-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BonusCardsService } from './bonus-cards.service';
import { CreateBonusCardDto } from './dto/create-bonus-card.dto';
import { UpdateBonusCardDto } from './dto/update-bonus-card.dto';

const uploadDirectory = join(process.cwd(), 'uploads', 'bonus-cards');
mkdirSync(uploadDirectory, { recursive: true });

type UploadedImage = {
  imageUrl: string;
};

@Controller('api/bonus-cards')
@UseGuards(JwtAuthGuard, AppAccessGuard)
@RequireAppAccess('information-bonus-card')
export class BonusCardsController {
  constructor(private readonly bonusCardsService: BonusCardsService) {}

  @Get()
  findAll(
    @Query('workDate') workDate?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bonusCardsService.findAll({ workDate, from, to });
  }

  @Post()
  create(@Body() body: CreateBonusCardDto, @CurrentUser() user: AuthUser) {
    return this.bonusCardsService.create(body, this.recorderName(user));
  }

  @Post('images')
  async uploadImage(
    @Req() request: Request,
    @Headers('content-type') contentType = '',
  ): Promise<UploadedImage> {
    if (!contentType.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const body = await this.readRequestBody(request);
    if (body.length === 0) {
      throw new BadRequestException('Image file is required');
    }
    if (body.length > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large');
    }

    const extension = contentType.includes('png') ? 'png' : 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    await writeFile(join(uploadDirectory, filename), body);
    return {
      imageUrl: `/uploads/bonus-cards/${filename}`,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateBonusCardDto, @CurrentUser() user: AuthUser) {
    return this.bonusCardsService.update(id, body, this.recorderName(user));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bonusCardsService.remove(id);
  }

  private readRequestBody(request: Request): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      request.on('data', (chunk: Buffer) => chunks.push(chunk));
      request.on('end', () => resolve(Buffer.concat(chunks)));
      request.on('error', reject);
    });
  }

  private recorderName(user: AuthUser) {
    return user.name || user.username || '';
  }
}
