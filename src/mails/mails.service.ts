import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ReservationData } from '../reservations/reservations.model';

const DOMAIN = process.env.DOMAIN;

export interface MailContent {
  id: string;
  name: string;
  fullName: string;
  phone: string;
  timestamp: string;
  confirmed: string;
  header: string;
  textAfterHeader1: string;
  textAfterHeader2: string;
  domain: string;
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(input: {
    to: string;
    from: string;
    subject: string;
    template: string;
    context: { mailContent: MailContent };
  }): Promise<void> {
    await this.mailerService.sendMail(input);
  }

  private pending = 'Rezerwacja złożona pomyślnie!';
  private pendingText1 =
    'Twoja rezerwacja została pomyślnie złożona. Poniżej możesz zobaczyć informacje dotyczące twojej rezerwacji.';
  private pendingText2 = 'W kolejnym mailu prześlemy potwierdzenie rezerwacji.';

  private confirmed = 'Rezerwacja zaakceptowana!';
  private confirmedText1 =
    'Twoja rezerwacja została potwierdzona! Poniżej możesz zobaczyć informacje dotyczące twojej rezerwacji.';

  private rejected = 'Rezerwacja została odrzucona!';
  private rejectedText1 =
    'Twoja rezerwacja została odrzucona. Przepraszamy za utrudnienia!';

  async prepareAndSendEmail(reservationData: ReservationData, status: string) {
    let mailContent: MailContent;

    const name = reservationData.fullName.split(' ')[0];
    const date = `${new Date(+reservationData.timestamp * 1000)
      .getDate()
      .toString()
      .padStart(2, '0')}-${(
      new Date(+reservationData.timestamp * 1000).getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${new Date(
      +reservationData.timestamp * 1000,
    ).getFullYear()}`;

    switch (status) {
      case 'pending':
        mailContent = {
          id: reservationData.id,
          name: name,
          fullName: reservationData.fullName,
          phone: reservationData.phone,
          timestamp: date,
          confirmed: 'Oczekująca',
          header: this.pending,
          textAfterHeader1: this.pendingText1,
          textAfterHeader2: this.pendingText2,
          domain: DOMAIN + reservationData.id,
        };
        break;
      case 'confirmed':
        mailContent = {
          id: reservationData.id,
          name: name,
          fullName: reservationData.fullName,
          phone: reservationData.phone,
          timestamp: date,
          confirmed: 'Potwierdzona',
          header: this.confirmed,
          textAfterHeader1: this.confirmedText1,
          textAfterHeader2: '',
          domain: DOMAIN + reservationData.id,
        };
        break;
      case 'rejected':
        mailContent = {
          id: reservationData.id,
          name: name,
          fullName: reservationData.fullName,
          phone: reservationData.phone,
          timestamp: date,
          confirmed: '',
          header: this.rejected,
          textAfterHeader1: this.rejectedText1,
          textAfterHeader2: '',
          domain: '',
        };
        break;
    }

    const subject = `Rezerwacja z dnia ${date} Leśna Przystań Ocieka`;

    const config = {
      to: reservationData.email,
      from: 'fishspot.test@gmail.com',
      subject: subject,
      template: 'fishspot',
      context: { mailContent: mailContent },
    };

    await this.sendEmail(config);
  }
}
