import { Module, forwardRef } from '@nestjs/common';
import { SpotsController } from './spots.controller';
import { SpotsService } from './spots.service';
import { LakeModule } from 'src/lake/lake.module';

@Module({
  imports: [forwardRef(() => LakeModule)],
  controllers: [SpotsController],
  providers: [SpotsService],
  exports: [SpotsService],
})
export class SpotsModule {}
