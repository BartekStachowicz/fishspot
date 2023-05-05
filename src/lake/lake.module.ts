import { Module } from '@nestjs/common';
import { LakeController } from './lake.controller';
import { LakeService } from './lake.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LakeSchema } from './lake.model';
import { SpotsModule } from 'src/spots/spots.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Ocieka', schema: LakeSchema }]),
    SpotsModule,
  ],
  controllers: [LakeController],
  providers: [LakeService],
  exports: [LakeService],
})
export class LakeModule {}
