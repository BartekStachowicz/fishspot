import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { SpotsService } from './spots.service';
import { Spots, SpotsInfo } from './spots.model';

@Controller('spots')
export class SpotsController {
  constructor(private spotsService: SpotsService) {}

  @Post('regenerate-spotid/:lakename')
  async regenerateSpotId(@Param('lakename') lakeName: string): Promise<void> {
    await this.spotsService.regenerateSpotId(lakeName);
  }

  @Post('new-spot/:lakename')
  async addNewSpot(
    @Param('lakename') lakeName: string,
    @Body() spot: Spots,
  ): Promise<string> {
    const id = await this.spotsService.addNewSpot(lakeName, spot);
    return id;
  }

  @Post('update-spot/:lakename')
  async updateSpot(
    @Param('lakename') lakeName: string,
    @Body() spot: Spots,
  ): Promise<Spots> {
    const updatedSpot = await this.spotsService.updateSpot(lakeName, spot);
    return updatedSpot;
  }

  @Get('get-spot/:lakename/:id')
  async getSpotById(
    @Param('lakename') lakeName: string,
    @Param('id') spotId: string,
  ): Promise<{
    spotId: string;
    number: string;
    info: SpotsInfo;
  }> {
    const spot = this.spotsService.getSpotById(lakeName, spotId);

    return spot;
  }

  @Delete('delete-spot/:lakename/:id')
  async deleteSpot(
    @Param('lakename') lakeName: string,
    @Param('id') spotId: string,
  ) {
    await this.spotsService.deleteSpot(lakeName, spotId);
  }
}
