import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  private pending = {
    to: 'bartoszstachowicz@gmail.com',
    from: 'fishspot.test@gmail.com',
    subject: 'Rezerwacja z dnia 11.05.2023 Leśna Przystań Ocieka',
    text: 'Rezerwacja ID: "1234567890" została pomyślnie złożona',
    html: '<b>Rezerwacja ID: "1234567890" została pomyślnie złożona</b>',
  };

  @Get('mail')
  async senEmail() {
    return await this.mailService.sendEmail(this.pending);
  }
}
