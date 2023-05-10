import { Injectable } from '@nestjs/common';

export interface BlockedDatesInput {
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
  public setBlockedDates(
    blockedDates: BlockedDatesInput,
  ): OutputDatesWithSpotsId[] | BlockedDatesOutput[] {
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
          dates.splice(dates.indexOf(blockedDates.date), 1);
        } else {
          dates.push(blockedDates.date);
        }
      }
    }

    const output = this.transformDataForFrontend(allBlockedDates);
    console.log(JSON.stringify(output));

    return output;
  }

  public clearBlockedDates(clientId: string): void {
    allBlockedDates = allBlockedDates.filter(
      (date) => date.clientId !== clientId,
    );
  }

  private transformDataForFrontend(
    allBlockedDates: BlockedDatesOutput[],
  ): OutputDatesWithSpotsId[] {
    const output: OutputDatesWithSpotsId[] = allBlockedDates.map(
      (blockedDates, index) => ({
        spotId: blockedDates.data[index].spotId,
        data: blockedDates.data.map((data) => ({
          dates: data.dates,
          clientId: blockedDates.clientId,
        })),
      }),
    );

    return output;
  }
}
