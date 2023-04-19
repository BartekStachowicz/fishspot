import { Module } from '@nestjs/common';
import { SpotsController } from './spots.controller';
import { SpotsService } from './spots.service';

@Module({
  controllers: [SpotsController],
  providers: [SpotsService]
})
export class SpotsModule {}
