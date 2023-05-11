import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(input: {
    to: string;
    from: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    await this.mailerService.sendMail(input);
  }
}
