import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string | undefined;
}

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): HealthResponse {
    return this.appService.getStatus();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
