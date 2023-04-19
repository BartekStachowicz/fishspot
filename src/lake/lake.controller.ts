import { JwtGuard } from '../auth/jwt.guard';
import { Controller, Post } from '@nestjs/common';
import { Body, Get, Param, UseGuards } from '@nestjs/common/decorators';

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

  @Get(':name')
  async getLake(@Param('name') lakeName: string): Promise<LakeOutput> {
    return await this.lakeService.getLake(lakeName);
  }
}
