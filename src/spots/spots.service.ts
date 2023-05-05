import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { LakeService } from '../lake/lake.service';
import { SpotOptions, Spots, SpotsInfo } from './spots.model';

@Injectable()
export class SpotsService {
  constructor(private lakeService: LakeService) {}

  async addNewSpot(lakeName: string, spot: Spots): Promise<string> {
    const lake = await this.lakeService.findByName(lakeName);
    const id = this.buildUniqueID(lakeName, spot.number);

    const newSpot: Spots = {
      ...spot,
      spotId: id,
    };

    lake.spots.push(newSpot);

    await this.lakeService.updateLake(lake);

    return id;
  }

  async updateSpot(lakeName: string, spot: Spots): Promise<Spots> {
    const lake = await this.lakeService.findByName(lakeName);
    const spotIndex = lake.spots.findIndex((s) => s.spotId === spot.spotId);

    if (spotIndex === -1) {
      throw new Error('Spot not found');
    }

    const updatedSpot: Spots = {
      ...lake.spots[spotIndex],
      ...spot,
    };

    lake.spots.splice(spotIndex, 1, updatedSpot);

    await this.lakeService.updateLake(lake);

    return updatedSpot;
  }

  async deleteSpot(lakeName: string, spotId: string): Promise<void> {
    const lake = await this.lakeService.findByName(lakeName);

    lake.spots.filter((spot) => spot.spotId !== spotId);

    await this.lakeService.updateLake(lake);
  }

  async getSpotById(
    lakeName: string,
    spotId: string,
  ): Promise<{
    spotId: string;
    number: string;
    info: SpotsInfo;
    options: SpotOptions;
  }> {
    const lake = await this.lakeService.findByName(lakeName);
    const spotOutput: Spots = lake.spots.find((spot) => spot.spotId === spotId);

    return {
      spotId: spotOutput.spotId,
      number: spotOutput.number,
      info: spotOutput.info,
      options: spotOutput.options,
    };
  }

  /////////////FOR DEVELOPING

  async regenerateSpotId(lakeName: string) {
    const lake = await this.lakeService.findByName(lakeName);

    lake.spots.map((spot) => {
      spot.spotId = this.buildUniqueID(lakeName, spot.number);
    });

    await this.lakeService.updateLake(lake);
  }

  ///FOR TESTING

  public genereteNewSpot(spotNumber: string, lakeName: string): Spots {
    const spot: Spots = {
      spotId: this.buildUniqueID(lakeName, spotNumber),
      number: spotNumber,
      unavailableDates: {},
      info: {
        priceList: {
          options: {
            weekend: true,
          },
          default: {
            priceDay: 100,
            priceNigth: 100,
          },
          weekend: {
            priceDay: 150,
            priceNigth: 150,
          },
          specials: {},
        },
        description: 'opis',
        houseSpot: false,
        houseSpotPrice: {
          priceForMinimal: 200,
          minNumberOfDays: 2,
          priceForExtraDay: 200,
        },
        spotCapacity: 1,
      },
      options: {
        isDepositRequire: false,
        depositValue: '50%',
        depositRequiredSince: 2,
      },
    };

    return spot;
  }

  ////////////////////////////////////////

  public buildUniqueID(lakeName: string, number: string): string {
    const uuid = uuidv4();
    const name =
      '$LN' + lakeName.charAt(0) + lakeName.charAt(lakeName.length - 1);

    const id = `${name.toUpperCase()}.${number}.${uuid}`;
    return id;
  }
}
