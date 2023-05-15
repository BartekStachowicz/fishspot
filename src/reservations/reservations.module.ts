import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { LakeModule } from '../lake/lake.module';
import { MailService } from '../mails/mails.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [LakeModule, AuthModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, MailService],
})
export class ReservationsModule {}
