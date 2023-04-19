import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsModule } from './reservations/reservations.module';
import { SpotsModule } from './spots/spots.module';
import { LakeModule } from './lake/lake.module';

const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD;
const MONGO_DB_USER = process.env.MONGO_DB_USER;
const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE;

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
