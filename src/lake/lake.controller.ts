import { JwtGuard } from '../auth/jwt.guard';
import { Controller, Post } from '@nestjs/common';
import { Body, Get, Param, UseGuards } from '@nestjs/common/decorators';

import { LakeService } from './lake.service';
import { Lake, LakeOuput } from './lake.model';

@Controller('lake')
export class LakeController {
  constructor(private lakeService: LakeService) {}

  @UseGuards(JwtGuard)
  @Post('create')
  async createNewLake(@Body() lake: Lake): Promise<LakeOuput> {
    return await this.lakeService.createNewLake(lake);
  }

  @Get(':name')
  async getLake(@Param('name') lakeName: string): Promise<LakeOuput> {
    return await this.lakeService.getLake(lakeName);
  }
}
