import { Module } from '@nestjs/common';
import { HumansourceAuthController } from './humansource-auth.controller';
import { HumansourceAuthService } from './humansource-auth.service';

@Module({
  controllers: [HumansourceAuthController],
  providers: [HumansourceAuthService],
})
export class HumansourceAuthModule {}
