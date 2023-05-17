import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SpotsService } from './spots.service';
import { SpotOptions, Spots, SpotsInfo } from './spots.model';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('spots')
export class SpotsController {
  constructor(private spotsService: SpotsService) {}

  @UseGuards(JwtGuard)
  @Post('regenerate-spotid/:lakename')
  async regenerateSpotId(@Param('lakename') lakeName: string): Promise<void> {
    await this.spotsService.regenerateSpotId(lakeName);
  }
  @UseGuards(JwtGuard)
  @Post('new-spot/:lakename')
  async addNewSpot(
    @Param('lakename') lakeName: string,
    @Body() spot: Spots,
  ): Promise<string> {
    const id = await this.spotsService.addNewSpot(lakeName, spot);
    return id;
  }
  @UseGuards(JwtGuard)
  @Patch('update-spot/:lakename')
  async updateSpot(
    @Param('lakename') lakeName: string,
    @Body() spot: Spots,
  ): Promise<Spots> {
    const updatedSpot = await this.spotsService.updateSpot(lakeName, spot);
    return updatedSpot;
  }
  @UseGuards(JwtGuard)
  @Patch('update-all-spot/:lakename')
  async updateAllSpot(
    @Param('lakename') lakeName: string,
    @Body() input: { info: SpotsInfo; options: SpotOptions },
  ): Promise<Spots[]> {
    const updatedSpots = this.spotsService.updateAllSpots(lakeName, input);
    return updatedSpots;
  }
  @UseGuards(JwtGuard)
  @Get('get-spot/:lakename/:id')
  async getSpotById(
    @Param('lakename') lakeName: string,
    @Param('id') spotId: string,
  ): Promise<{
    spotId: string;
    number: string;
    info: SpotsInfo;
    options: SpotOptions;
  }> {
    const spot = this.spotsService.getSpotById(lakeName, spotId);

    return spot;
  }
  @UseGuards(JwtGuard)
  @Delete('delete-spot/:lakename/:id')
  async deleteSpot(
    @Param('lakename') lakeName: string,
    @Param('id') spotId: string,
  ) {
    await this.spotsService.deleteSpot(lakeName, spotId);
  }
}
