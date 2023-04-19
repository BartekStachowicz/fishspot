import { Injectable } from '@nestjs/common';

import { LakeService } from '../lake/lake.service';
import { Reservation } from './reservations.model';
import { Lake } from '../lake/lake.model';

@Injectable()
export class ReservationsService {
  constructor(private lakeService: LakeService) {}

  async createNewReservations(lakeName: string, reservation: Reservation) {
    const lakeForUpdate = await this.manageReservations(lakeName, reservation);
    const updatedLake = await this.lakeService.updateLake(lakeForUpdate);
    return updatedLake;
  }

  private async manageReservations(
    lakeName: string,
    reservation: Reservation,
  ): Promise<Lake> {
    try {
      const lakeForUpdate = await this.lakeService.findByName(lakeName);
      if (!lakeForUpdate) return null;
      for (let i = 0; i < reservation.data.length; i++) {
        for (let j = 0; j < lakeForUpdate.spots.length; j++) {
          if (lakeForUpdate.spots[j].number === reservation.data[i].spot) {
            const tempData: { dates: string[]; spot: number }[] = [];
            tempData.push(reservation.data[i]);

            const newReservation: Reservation = {
              fullName: reservation.fullName,
              phone: reservation.phone,
              email: reservation.email,
              data: tempData,
              timestamp: reservation.timestamp,
              confirmed: reservation.confirmed,
              rejected: reservation.rejected,
            };
            lakeForUpdate.spots[j].unavailableDates = reservation.data[i].dates;
            lakeForUpdate.spots[j].reservations.push(newReservation);
          }
        }
      }
      return lakeForUpdate;
    } catch (error) {
      console.log(error);
    }
  }
}
