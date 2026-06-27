import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HumansourceAuthController } from './humansource-auth.controller';
import { HumansourceAuthService } from './humansource-auth.service';

@Module({
  imports: [PrismaModule],
  controllers: [HumansourceAuthController],
  providers: [HumansourceAuthService],
})
export class HumansourceAuthModule {}
