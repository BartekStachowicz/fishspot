import { Injectable } from '@nestjs/common';

export interface BlockedDates {
  clientId: string;
  dates: string[];
}

let allBlockedDates: BlockedDates[] = [];

@Injectable()
export class WebSocketsService {
  public setBlockedDates(blockedDates: BlockedDates): BlockedDates[] {
    const isExist = allBlockedDates.findIndex(
      (date) => date.clientId === blockedDates.clientId,
    );
    console.log('Is Exist ' + isExist);

    if (isExist !== -1) {
      allBlockedDates[isExist] = blockedDates;
    } else {
      allBlockedDates.push(blockedDates);
    }
    console.log('Tablica niedostępnych dat (dodawanie):');
    console.log(allBlockedDates);
    return allBlockedDates;
  }

  public clearBlockedDates(clientId: string): void {
    allBlockedDates = allBlockedDates.filter(
      (date) => date.clientId !== clientId,
    );
    console.log('Tablica niedostępnych dat (usuwanie):');
    console.log(allBlockedDates);
  }
}
