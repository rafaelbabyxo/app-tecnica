import { Controller, Get } from '@nestjs/common'

@Controller()
export class HealthController {
  @Get()
  getRoot() {
    return {
      status: 'OK',
      message: 'Service is running',
      timestamp: new Date().toISOString(),
      service: 'Técnica API',
    }
  }

  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      message: 'Health check passed',
      timestamp: new Date().toISOString(),
      service: 'Técnica API',
    }
  }
}
