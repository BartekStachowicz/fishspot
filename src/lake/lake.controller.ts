import { JwtGuard } from '../auth/jwt.guard';
import { Controller, Post } from '@nestjs/common';
import { Body, Get, Param, Query, UseGuards } from '@nestjs/common/decorators';

import { LakeService } from './lake.service';
import { Lake, LakeOutput } from './lake.model';

@Controller('lake')
export class LakeController {
  constructor(private lakeService: LakeService) {}

  @UseGuards(JwtGuard)
  @Post('create')
  async createNewLake(@Body() lake: Lake): Promise<Lake> {
    return await this.lakeService.createNewLake(lake);
  }

  @Post('generate/:lakename/:numberOfSpots')
  async generateNewLake(
    @Param('lakename') lakeName: string,
    @Param('numberOfSpots') number: number,
  ) {
    return await this.lakeService.generateNewLake(lakeName, number);
  }

  @Get(':name')
  async getLake(
    @Query('year') year: string,
    @Param('name') lakeName: string,
  ): Promise<LakeOutput> {
    return await this.lakeService.getLake(lakeName, year);
  }
}
