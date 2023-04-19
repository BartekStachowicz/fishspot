import { Injectable } from '@nestjs/common';

import { LakeService } from '../lake/lake.service';
import { ReservationData } from './reservations.model';
import { Lake } from '../lake/lake.model';

@Injectable()
export class ReservationsService {
  constructor(private lakeService: LakeService) {}

  async createNewReservations(lakeName: string, reservation: ReservationData) {
    const lakeForUpdate = await this.manageReservations(lakeName, reservation);
    await this.lakeService.updateLake(lakeForUpdate);
  }

  private async manageReservations(
    lakeName: string,
    reservation: ReservationData,
  ): Promise<Lake | null> {
    try {
      const lakeForUpdate = await this.lakeService.findByName(lakeName);

      if (!lakeForUpdate) return null;
      for (let i = 0; i < reservation.data.length; i++) {
        for (let j = 0; j < lakeForUpdate.spots.length; j++) {
          if (lakeForUpdate.spots[j].number === reservation.data[i].spot) {
            const tempData: { dates: string[]; spot: number }[] = [];
            tempData.push(reservation.data[i]);

            const newReservation: ReservationData = {
              fullName: reservation.fullName,
              phone: reservation.phone,
              email: reservation.email,
              data: tempData,
              timestamp: reservation.timestamp,
              confirmed: reservation.confirmed,
              rejected: reservation.rejected,
            };

            const year = this.dateConverter(newReservation.timestamp);
            if (!lakeForUpdate.spots[j].reservations) {
              lakeForUpdate.spots[j].reservations = {};
            }
            if (!lakeForUpdate.spots[j].reservations[year]) {
              lakeForUpdate.spots[j].reservations[year] = [];
            }
            lakeForUpdate.spots[j].reservations[year].push(newReservation);
            if (!lakeForUpdate.spots[j].unavailableDates) {
              lakeForUpdate.spots[j].unavailableDates = {};
            }
            if (!lakeForUpdate.spots[j].unavailableDates[year]) {
              lakeForUpdate.spots[j].unavailableDates[year] = [];
            }
            lakeForUpdate.spots[j].unavailableDates[year] = [
              ...lakeForUpdate.spots[j].unavailableDates[year],
              ...reservation.data[i].dates,
            ];
          }
        }
      }
      return lakeForUpdate;
    } catch (error) {
      console.log(error);
    }
  }

  private dateConverter(timestamp: string) {
    const date: Date = new Date(+timestamp * 1000);
    return String(date.getFullYear());
  }
}
