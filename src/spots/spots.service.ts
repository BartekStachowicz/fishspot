import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { LakeService } from '../lake/lake.service';

@Injectable()
export class SpotsService {
  constructor(private lakeService: LakeService) {}

  async addUniqueIDtospots(lakeName: string) {
    const lake = await this.lakeService.findByName(lakeName);

    lake.spots.map((spot) => {
      spot.spotId = this.buildUniqueID(lakeName, spot.number);
    });

    await this.lakeService.updateLake(lake);
  }

  private buildUniqueID(lakeName: string, number: string): string {
    const uuid = uuidv4();
    const name =
      '$LN' + lakeName.charAt(0) + lakeName.charAt(lakeName.length - 1);

    const id = `${name.toUpperCase()}.${number}.${uuid}`;
    return id;
  }
}
