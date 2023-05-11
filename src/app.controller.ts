import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

export interface MailContent {
  id: string;
  name: string;
  fullName: string;
  phone: string;
  timestamp: string;
  confirmed: boolean;
  header: string;
  textAfterHeader1: string;
  textAfterHeader2: string;
  domain: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('mail')
  // async sendEmail() {
  //   return await this.mailService.sendEmail(this.config);
  // }
}
