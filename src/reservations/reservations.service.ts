import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { LakeService } from '../lake/lake.service';
import { ReservationData } from './reservations.model';
import { Lake } from '../lake/lake.model';

@Injectable()
export class ReservationsService {
  constructor(private lakeService: LakeService) {}

  async createNewReservations(lakeName: string, reservation: ReservationData) {
    try {
      const lakeForUpdate = await this.lakeService.findByName(lakeName);
      const year = this.dateConverter(reservation.timestamp);
      const uniqueID = this.buildUniqueID(lakeName, reservation.timestamp);
      const newReservation: ReservationData = {
        ...reservation,
        id: uniqueID,
      };

      if (!lakeForUpdate.reservations) {
        lakeForUpdate.reservations = {};
      }
      if (!lakeForUpdate.reservations[year]) {
        lakeForUpdate.reservations[year] = [];
      }
      lakeForUpdate.reservations[year].push(newReservation);

      if (!lakeForUpdate) return null;

      const updatedLake = this.addUnavailableDates(
        lakeForUpdate,
        reservation,
        year,
      );
      await this.lakeService.updateLake(updatedLake);
      return newReservation;
    } catch (error) {}
  }

  async updateConfirmedReservation(lakeName: string, id: string) {
    const lake = await this.lakeService.findByName(lakeName);
    const year = this.getYearFromID(id);

    lake.reservations[year].find((el) => el.id === id).confirmed = true;
    await this.lakeService.updateLake(lake);

    return lake.reservations[year].find((el) => el.id === id);
  }

  async getReservationByID(
    lakeName: string,
    id: string,
  ): Promise<ReservationData> {
    return this.findReservationByID(lakeName, id);
  }

  async getNotConfirmedReservations(
    lakeName: string,
    offset: number,
    limit: number,
    filter: string,
  ): Promise<ReservationData[]> {
    const lake = await this.lakeService.findByName(lakeName);
    const currentYear = this.getCurrentYear();
    const reservations = lake.reservations[currentYear]
      .filter((reservation) => !reservation.confirmed)
      .sort((a, b) => +a.timestamp - +b.timestamp)
      .slice(offset, offset + limit);

    if (filter === '') return reservations;
    return reservations.filter((el) => el.fullName.includes(filter));
  }

  async getAllReservationsByYear(
    lakeName: string,
    year: string,
    offset: number,
    limit: number,
  ): Promise<ReservationData[]> {
    const lake = await this.lakeService.findByName(lakeName);
    const reservations = lake.reservations[year]
      .filter((reservation) => reservation.confirmed)
      .sort((a, b) => +a.timestamp - +b.timestamp)
      .slice(offset, offset + limit);
    return reservations;
  }

  async getReservationsBySpotsId(
    lakeName: string,
    spotId: string,
    offset: number,
    limit: number,
  ): Promise<ReservationData[]> {
    const lake = await this.lakeService.findByName(lakeName);
    const currentYear = this.getCurrentYear();
    const reservations = lake.reservations[currentYear];
    const spotsWithReservations: ReservationData[] = [];

    reservations.forEach((reservation) => {
      reservation.data.forEach((el) => {
        if (el.spotId === spotId) {
          spotsWithReservations.push(reservation);
        }
      });
    });

    return spotsWithReservations
      .filter((reservation) => reservation.confirmed)
      .sort((a, b) => +a.timestamp - +b.timestamp)
      .slice(offset, offset + limit);
  }

  async getTodaysReservations(
    lakeName: string,
    offset: number,
    limit: number,
  ): Promise<ReservationData[]> {
    const lake = await this.lakeService.findByName(lakeName);
    const currentYear = this.getCurrentYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() * 24 * 60 * 60 * 1000);
    const reservations = lake.reservations[currentYear]
      .filter(
        (el) =>
          new Date(el.timestamp) >= today && new Date(el.timestamp) < tomorrow,
      )
      .sort((a, b) => +a.timestamp - +b.timestamp)
      .slice(offset, offset + limit);

    return reservations;
  }

  // async getReservationsWaitingForDeposit(lakeName: string, offset: number, limit: number) {
  //   const lake = await this.lakeService.findByName(lakeName);
  //   const currentYear = this.getCurrentYear();
  // }

  async deleteReservation(lakeName: string, id: string): Promise<void> {
    const lake = await this.lakeService.findByName(lakeName);
    const year = this.getYearFromID(id);
    const data = (await this.getReservationByID(lakeName, id)).data;
    lake.reservations[year] = lake.reservations[year].filter(
      (el) => el.id !== id,
    );
    data.forEach(({ dates, spotId }) => {
      const spotToUpdate = lake.spots.find((s) => s.spotId === spotId);
      if (spotToUpdate && spotToUpdate.unavailableDates) {
        Object.keys(spotToUpdate.unavailableDates).forEach((year) => {
          lake.spots.find((s) => s.spotId === spotId).unavailableDates[year] =
            spotToUpdate.unavailableDates[year].filter(
              (date) => !dates.includes(date),
            );
        });
      }
    });

    await this.lakeService.updateLake(lake);
  }

  private async findReservationByID(
    lakeName: string,
    id: string,
  ): Promise<ReservationData> {
    const lake = await this.lakeService.findByName(lakeName);
    const year = this.getYearFromID(id);
    const reservation = lake.reservations[year].find((el) => el.id === id);
    return reservation;
  }

  private addUnavailableDates(
    lakeForUpdate: Lake,
    reservation: ReservationData,
    year: string,
  ): Lake | null {
    for (let i = 0; i < reservation.data.length; i++) {
      for (let j = 0; j < lakeForUpdate.spots.length; j++) {
        if (lakeForUpdate.spots[j].spotId === reservation.data[i].spotId) {
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
  }

  private getYearFromID(id: string): string {
    const timestamp = id.split('.')[1];
    const year = this.dateConverter(timestamp);
    return year;
  }

  private getCurrentYear(): string {
    return String(new Date().getFullYear());
  }

  private dateConverter(timestamp: string) {
    const date: Date = new Date(+timestamp * 1000);
    return String(date.getFullYear());
  }

  private buildUniqueID(lakeName: string, timestamp: string): string {
    const uuid = uuidv4();
    const name =
      '$LN' + lakeName.charAt(0) + lakeName.charAt(lakeName.length - 1);

    const id = `${name.toUpperCase()}.${timestamp}.${uuid}`;
    return id;
  }
}
