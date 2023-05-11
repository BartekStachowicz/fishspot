import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { LakeModule } from '../lake/lake.module';
import { MailService } from '../mails/mails.service';

@Module({
  imports: [LakeModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, MailService],
})
export class ReservationsModule {}
