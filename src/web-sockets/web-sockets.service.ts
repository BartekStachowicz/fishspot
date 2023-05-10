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
  dates: string[];
  spotId: string;
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

    // const output = this.transformDataForFrontend(allBlockedDates);
    // console.log(JSON.stringify(output));
    return allBlockedDates;
  }

  public clearBlockedDates(clientId: string): void {
    allBlockedDates = allBlockedDates.filter(
      (date) => date.clientId !== clientId,
    );
  }

  private transformDataForFrontend(
    allBlockedDates: BlockedDatesOutput[],
  ): OutputDatesWithSpotsId[] {
    const outputMap = new Map<string, string[]>();

    for (const dates of allBlockedDates) {
      for (const data of dates.data) {
        const existingDates = outputMap.get(data.spotId) || [];
        const newDates = [
          ...existingDates,
          ...data.dates.filter((date) => !existingDates.includes(date)),
        ];
        outputMap.set(data.spotId, newDates);
      }
    }

    const output: OutputDatesWithSpotsId[] = [];
    for (const [spotId, dates] of outputMap) {
      output.push({ spotId, dates });
    }

    return output;
  }
}
