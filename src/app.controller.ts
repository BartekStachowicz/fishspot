import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('mail')
  // async sendEmail() {
  //   return await this.mailService.sendEmail(this.config);
  // }
}
