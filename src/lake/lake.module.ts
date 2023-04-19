import { Module } from '@nestjs/common';
import { LakeController } from './lake.controller';
import { LakeService } from './lake.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LakeSchema } from './lake.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Ocieka', schema: LakeSchema }]),
  ],
  controllers: [LakeController],
  providers: [LakeService],
  exports: [LakeService],
})
export class LakeModule {}
