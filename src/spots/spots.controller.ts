import { Controller, Param, Post } from '@nestjs/common';

import { SpotsService } from './spots.service';

@Controller('spots')
export class SpotsController {
  constructor(private spotsService: SpotsService) {}

  @Post('regenerate-spotid/:lakename')
  async regenerateSpotId(@Param('lakename') lakeName: string) {
    await this.spotsService.regenerateSpotId(lakeName);
  }
}
