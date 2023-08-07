import { JwtGuard } from '../auth/jwt.guard';
import { Controller, Post, Req } from '@nestjs/common';
import { Body, Get, Param, Query, UseGuards } from '@nestjs/common/decorators';
import { LakeService } from './lake.service';
import { Lake, LakeOutput } from './lake.model';
import { Request } from 'express';

@Controller('lake')
export class LakeController {
  constructor(private lakeService: LakeService) {}

  @UseGuards(JwtGuard)
  @Post('create')
  async createNewLake(@Body() lake: Lake): Promise<Lake> {
    return await this.lakeService.createNewLake(lake);
  }
  @UseGuards(JwtGuard)
  @Post('generate/:lakename/:numberOfSpots')
  async generateNewLake(
    @Param('lakename') lakeName: string,
    @Param('numberOfSpots') number: number,
  ) {
    return await this.lakeService.generateNewLake(lakeName, number);
  }

  @UseGuards(JwtGuard)
  @Post(':lakename/bigfish')
  async insertBigFish(@Req() req: Request, @Param('name') lakeName: string) {
    return await this.lakeService.addBigFish(req, lakeName);
  }

  @Get(':name')
  async getLake(
    @Query('year') year: string,
    @Param('name') lakeName: string,
  ): Promise<LakeOutput> {
    return await this.lakeService.getLake(lakeName, year);
  }
}
