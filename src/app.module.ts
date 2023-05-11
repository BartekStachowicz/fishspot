import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { WebSocketsModule } from './web-sockets/web-sockets.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SpotsModule } from './spots/spots.module';
import { LakeModule } from './lake/lake.module';

const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD;
const MONGO_DB_USER = process.env.MONGO_DB_USER;
const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE;
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

@Module({
  imports: [
    AuthModule,
    PassportModule,
    MongooseModule.forRoot(
      `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@cluster0.6eelvtt.mongodb.net/${MONGO_DB_DATABASE}?retryWrites=true&w=majority`,
    ),

    UsersModule,

    ReservationsModule,

    SpotsModule,

    LakeModule,

    ScheduleModule.forRoot(),
    WebSocketsModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: EMAIL_DOMAIN,
            pass: EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        template: {
          dir: join(__dirname, 'mails'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
