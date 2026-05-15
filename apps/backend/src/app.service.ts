import { Injectable } from '@nestjs/common';

interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string | undefined;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to G-HUB API!';
  }

  getStatus(): HealthStatus {
    return {
      status: 'running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };
  }
}
