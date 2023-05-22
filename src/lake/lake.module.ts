import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LakeController } from './lake.controller';
import { LakeService } from './lake.service';
import { LakeSchema } from './lake.model';
import { SpotsModule } from '../spots/spots.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Lake', schema: LakeSchema }]),
    forwardRef(() => SpotsModule),
  ],
  controllers: [LakeController],
  providers: [LakeService],
  exports: [LakeService],
})
export class LakeModule {}
