import { Controller, Param, Post } from '@nestjs/common';

import { SpotsService } from './spots.service';

@Controller('spots')
export class SpotsController {
  constructor(private spotsService: SpotsService) {}

  @Post(':lakename')
  async createNewReservation(@Param('lakename') lakeName: string) {
    await this.spotsService.addUniqueIDtospots(lakeName);
  }
}
