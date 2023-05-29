import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SpotsService } from 'src/spots/spots.service';

export interface BlockedDatesInput {
  lakeName: string;
  clientId: string;
  date: string;
  spotId: string;
}

export interface BlockedDatesOutput {
  clientId: string;
  data: {
    dates: string[];
    spotId: string;
  }[];
}

export interface OutputDatesWithSpotsId {
  spotId: string;
  data: {
    dates: string[];
    clientId: string;
  }[];
}

let allBlockedDates: BlockedDatesOutput[] = [];

@Injectable()
export class WebSocketsService {
  constructor(private spotService: SpotsService) {}

  public async setBlockedDates(
    blockedDates: BlockedDatesInput,
    message: any,
  ): Promise<OutputDatesWithSpotsId[] | BlockedDatesOutput[]> {
    try {
      if (!message) {
        console.log('pusta');
        console.log(allBlockedDates);
        return this.transformDataForFrontend(allBlockedDates);
      }

      const spot = await this.spotService.getSpotById(
        blockedDates.lakeName,
        blockedDates.spotId,
      );

      const index = allBlockedDates.findIndex(
        (date) => date.clientId === blockedDates.clientId,
      );
      if (index === -1) {
        allBlockedDates.push({
          clientId: blockedDates.clientId,
          data: [
            {
              dates: [blockedDates.date],
              spotId: blockedDates.spotId,
            },
          ],
        });
      } else {
        const existingDates = allBlockedDates[index].data;
        const existingSpotIndex = existingDates.findIndex(
          (data) => data.spotId === blockedDates.spotId,
        );
        if (existingSpotIndex === -1) {
          existingDates.push({
            dates: [blockedDates.date],
            spotId: blockedDates.spotId,
          });
        } else {
          const dates = existingDates[existingSpotIndex].dates;
          if (dates.includes(blockedDates.date)) {
            spot.info.houseSpot &&
            spot.info.houseSpotPrice.priceForMinimal !== 0
              ? dates.splice(0, dates.length)
              : dates.splice(dates.indexOf(blockedDates.date), 1);
          } else {
            dates.push(blockedDates.date);
          }
        }
      }
      console.log('pełna');
      const output = this.transformDataForFrontend(allBlockedDates);
      console.log(JSON.stringify(output));

      return output;
    } catch (error) {
      throw new HttpException(
        'Failed to create socket',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public afterConntection() {
    return this.transformDataForFrontend(allBlockedDates);
  }

  public clearBlockedDates(clientId: string): void {
    try {
      allBlockedDates = allBlockedDates.filter(
        (date) => date.clientId !== clientId,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to clear data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private transformDataForFrontend(
    blockedDatesOutput: BlockedDatesOutput[],
  ): OutputDatesWithSpotsId[] {
    try {
      const result = [];

      // tworzenie mapy z kluczem spotId i wartością tablicy obiektów
      const spotMap = {};
      blockedDatesOutput.forEach((client) => {
        client.data.forEach((booking) => {
          if (!spotMap[booking.spotId]) {
            spotMap[booking.spotId] = [];
          }
          spotMap[booking.spotId].push({
            dates: booking.dates,
            clientId: client.clientId,
          });
        });
      });

      // przekształcanie mapy na listę obiektów wynikowych
      Object.keys(spotMap).forEach((spotId) => {
        result.push({
          spotId,
          data: spotMap[spotId],
        });
      });

      return result;
    } catch (error) {
      throw new HttpException(
        'Failed to transform data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
