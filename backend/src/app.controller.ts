import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRootHealth() {
    return {
      status: 'healthy',
      service: 'PhiloMind NestJS Backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
