import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Cron, CronExpression } from '@nestjs/schedule';

import { LakeService } from '../lake/lake.service';
import { ReservationData } from './reservations.model';
import { Lake } from '../lake/lake.model';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ReservationsService {
  constructor(
    private lakeService: LakeService,
    private authService: AuthService,
  ) {}

  async createNewReservations(
    lakeName: string,
    reservation: ReservationData,
  ): Promise<ReservationData> {
    try {
      const lakeForUpdate = await this.lakeService.findByName(lakeName);
      if (!lakeForUpdate)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );

      const year = this.dateConverter(reservation.timestamp);
      const uniqueID = this.buildUniqueID(lakeName, reservation.timestamp);

      const encryptedEmail = this.authService.encrypt(reservation.email);
      const encryptedName = this.authService.encrypt(reservation.fullName);
      const encryptedPhone = this.authService.encrypt(reservation.phone);
      const newReservation: ReservationData = {
        ...reservation,
        id: uniqueID,
        email: encryptedEmail,
        phone: encryptedPhone,
        fullName: encryptedName,
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
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można utworzyć rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateReservation(
    lakeName: string,
    id: string,
    reservationData: ReservationData,
  ): Promise<ReservationData> {
    try {
      let lake = await this.lakeService.findByName(lakeName);
      if (!lake) {
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      }
      const year = this.getYearFromID(id);
      // const res = await this.findReservationByID(lakeName, id);
      const reservationIndex = lake.reservations[year].findIndex(
        (el) => el.id === id,
      );
      if (reservationIndex === -1) {
        throw new HttpException(
          'Nie znaleziono rezerwacji!',
          HttpStatus.NOT_FOUND,
        );
      }
      const resForUpdate = {
        ...reservationData,
        email: this.authService.encrypt(reservationData?.email),
        phone: this.authService.encrypt(reservationData?.phone),
        fullName: this.authService.encrypt(reservationData?.fullName),
      };
      const reservationToUpdate = Object.assign(
        {},
        lake.reservations[year][reservationIndex],
        resForUpdate,
      );
      lake.reservations[year][reservationIndex] = reservationToUpdate;

      lake = await this.clearUnavailableDates(lakeName, lake, id);

      lake = this.addUnavailableDates(lake, reservationToUpdate, year);

      await this.lakeService.updateLake(lake);

      return {
        ...reservationToUpdate,
        phone: reservationData.phone,
        email: reservationData.email,
        fullName: reservationData.fullName,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można zaktualizować rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getReservationByID(
    lakeName: string,
    id: string,
  ): Promise<ReservationData> {
    try {
      const reservation = await this.findReservationByID(lakeName, id);
      const email = this.authService.decrypt(reservation.email);
      const phone = this.authService.decrypt(reservation.phone);
      const fullName = this.authService.decrypt(reservation.fullName);
      return {
        ...reservation,
        email: email,
        phone: phone,
        fullName: fullName,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można pobrać rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNotConfirmedReservations(
    lakeName: string,
    offset: number,
    limit: number,
    filter: string,
    year: string,
  ): Promise<ReservationData[]> {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const currentYear = this.getCurrentYear();
      if (year === '') year = currentYear;

      const reservations = lake.reservations[year]
        .filter(
          (reservation) =>
            !reservation?.confirmed && !reservation?.isDepositRequired,
        )
        .sort((a, b) => +a.timestamp - +b.timestamp)
        .slice(offset, offset + limit)
        .map((r) => {
          const email = this.authService.decrypt(r?.email);
          const phone = this.authService.decrypt(r?.phone);
          const fullName = this.authService.decrypt(r?.fullName);
          return {
            ...r,
            email: email,
            phone: phone,
            fullName: fullName,
          };
        });
      // console.log('Obiekt' + JSON.stringify(reservations));
      // console.log(reservations.length);
      if (filter === '') return reservations;
      return reservations.filter((el) =>
        el.fullName?.toLowerCase().includes(filter.toLowerCase()),
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można pobrać rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllReservationsByYear(
    lakeName: string,
    year: string,
    offset: number,
    limit: number,
    filter: string,
  ): Promise<ReservationData[]> {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const reservations = lake.reservations[year]
        .filter((reservation) => reservation?.confirmed)
        .sort((a, b) => +b.timestamp - +a.timestamp)
        .slice(offset, offset + limit)
        .map((r) => {
          const email = this.authService.decrypt(r?.email);
          const phone = this.authService.decrypt(r?.phone);
          const fullName = this.authService.decrypt(r?.fullName);
          return {
            ...r,
            email: email,
            phone: phone,
            fullName: fullName,
          };
        });

      if (filter === '') return reservations;
      return reservations.filter((el) =>
        el?.fullName.toLowerCase().includes(filter.toLowerCase()),
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można pobrać rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getReservationsBySpotsId(
    lakeName: string,
    spotId: string,
    offset: number,
    limit: number,
    filter: string,
    year: string,
  ): Promise<ReservationData[]> {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const currentYear = this.getCurrentYear();
      if (year === '') year = currentYear;
      const reservations = lake.reservations[year];
      const spotsWithReservations: ReservationData[] = [];

      reservations.forEach((reservation) => {
        reservation.data.forEach((el) => {
          if (el.spotId === spotId) {
            spotsWithReservations.push(reservation);
          }
        });
      });

      const resultReservations = spotsWithReservations
        .filter((reservation) => reservation?.confirmed)
        .sort((a, b) => +b.timestamp - +a.timestamp)
        .slice(offset, offset + limit)
        .map((r) => {
          const email = this.authService.decrypt(r?.email);
          const phone = this.authService.decrypt(r?.phone);
          const fullName = this.authService.decrypt(r?.fullName);
          return {
            ...r,
            email: email,
            phone: phone,
            fullName: fullName,
          };
        });

      if (filter === '') return resultReservations;
      return resultReservations.filter((el) =>
        el?.fullName.toLowerCase().includes(filter.toLowerCase()),
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można pobrać rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTodaysReservations(
    lakeName: string,
    offset: number,
    limit: number,
    filter: string,
    year: string,
    date: string,
  ): Promise<ReservationData[] | void> {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const currentYear = this.getCurrentYear();
      if (year === '') year = currentYear;

      const dateDay = new Date(+date * 1000).getDate();
      const dateMonth = new Date(+date * 1000).getMonth() + 1;
      const dateYear = new Date(+date * 1000).getFullYear();

      const splitedResaervation = this.createIndividualReservations(
        lake.reservations[year],
      );

      let reservations = [];
      splitedResaervation.forEach((reservation) => {
        reservation?.data.forEach((resdata) => {
          resdata.dates.sort((a, b) => +a.date - +b.date);
          const reservationDay = new Date(
            +resdata.dates[0].date * 1000,
          ).getDate();
          const reservationMonth =
            new Date(+resdata.dates[0].date * 1000).getMonth() + 1;
          const reservationYear = new Date(
            +resdata.dates[0].date * 1000,
          ).getFullYear();

          if (
            reservationDay === dateDay &&
            reservationMonth === dateMonth &&
            reservationYear === dateYear
          ) {
            reservations.push(reservation);
          }
        });
      });

      reservations = reservations
        .sort((a, b) => +b.timestamp - +a.timestamp)
        .slice(offset, offset + limit)
        .map((r) => {
          const email = this.authService.decrypt(r?.email);
          const phone = this.authService.decrypt(r?.phone);
          const fullName = this.authService.decrypt(r?.fullName);
          return {
            ...r,
            email: email,
            phone: phone,
            fullName: fullName,
          };
        });

      if (filter === '') return reservations;

      return reservations.filter((el) =>
        el?.fullName.toLowerCase().includes(filter.toLowerCase()),
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można pobrać rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getReservationsWithRequireDeposit(
    lakeName: string,
    offset: number,
    limit: number,
    filter: string,
    year: string,
  ) {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const currentYear = this.getCurrentYear();
      if (year === '') year = currentYear;
      const reservations = lake?.reservations[year]
        .filter(
          (el) => !el?.isDepositPaid && el?.isDepositRequired && !el?.confirmed,
        )
        .sort((a, b) => +b.timestamp - +a.timestamp)
        .slice(offset, offset + limit)
        .map((r) => {
          const email = this.authService.decrypt(r?.email);
          const phone = this.authService.decrypt(r?.phone);
          const fullName = this.authService.decrypt(r?.fullName);
          return {
            ...r,
            email: email,
            phone: phone,
            fullName: fullName,
          };
        });
      // console.log('Obiekt' + JSON.stringify(reservations));
      // console.log(reservations.length);
      if (filter === '') return reservations;
      return reservations.filter((el) =>
        el?.fullName.toLowerCase().includes(filter.toLowerCase()),
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można pobrać rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getReservationsWithPaidDeposit(
    lakeName: string,
    offset: number,
    limit: number,
    filter: string,
    year: string,
  ) {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const currentYear = this.getCurrentYear();
      if (year === '') year = currentYear;
      const reservations = lake?.reservations[year]
        .filter((el) => el?.isDepositPaid)
        .sort((a, b) => +b.timestamp - +a.timestamp)
        .slice(offset, offset + limit)
        .map((r) => {
          const email = this.authService.decrypt(r?.email);
          const phone = this.authService.decrypt(r?.phone);
          const fullName = this.authService.decrypt(r?.fullName);
          return {
            ...r,
            email: email,
            phone: phone,
            fullName: fullName,
          };
        });

      if (filter === '') return reservations;
      return reservations.filter((el) =>
        el?.fullName.toLowerCase().includes(filter.toLowerCase()),
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można pobrać rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanExpiredReservations() {
    try {
      const lakes: Lake[] = await this.lakeService.findAll();
      if (!lakes)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      lakes.forEach((lake) => {
        Object.values(lake?.reservations).forEach((year) => {
          year.forEach((reservation) => {
            const reservationDay = new Date(+reservation?.timestamp * 1000);
            // console.log(`DATA REZERWACJI ${index}: ${reservationDay}`);
            const twoDaysLater = new Date(reservationDay.getTime());
            twoDaysLater.setDate(twoDaysLater.getDate() + 2);
            // console.log(`DWA DNI PÓŹNIEJ ${index}: ${twoDaysLater}`);
            if (
              !reservation?.confirmed &&
              !reservation?.isDepositPaid &&
              !reservation?.isDepositRequired
            ) {
              if (twoDaysLater < new Date()) {
                this.deleteReservation(lake?.name, reservation?.id);
              }
            }
          });
        });
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można wyczyścić rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteReservation(
    lakeName: string,
    id: string,
  ): Promise<ReservationData> {
    try {
      const lake = await this.lakeService.findByName(lakeName);

      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );

      const year = this.getYearFromID(id);
      const res = await this.getReservationByID(lakeName, id);

      // const data = result?.data;
      lake.reservations[year] = lake?.reservations[year].filter(
        (el) => el?.id !== id,
      );

      // data.forEach(({ dates, spotId }) => {
      //   const spotToUpdate = lake?.spots.find((s) => s?.spotId === spotId);
      //   if (spotToUpdate && spotToUpdate?.unavailableDates) {
      //     Object.keys(spotToUpdate?.unavailableDates).forEach((year) => {
      //       lake.spots.find((s) => s?.spotId === spotId).unavailableDates[
      //         year
      //       ] = spotToUpdate?.unavailableDates[year].filter(
      //         (unavailableDate) =>
      //           !dates.some(({ date }) => date === unavailableDate),
      //       );
      //     });
      //   }
      // });

      const updatedLake = await this.clearUnavailableDates(lakeName, lake, id);
      await this.lakeService.updateLake(updatedLake);
      return res;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można usunąć rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async findReservationByID(
    lakeName: string,
    id: string,
  ): Promise<ReservationData> {
    try {
      const lake = await this.lakeService.findByName(lakeName);
      if (!lake)
        throw new HttpException(
          'Nie znaleziono łowiska!',
          HttpStatus.NOT_FOUND,
        );
      const year = this.getYearFromID(id);
      const reservation = lake?.reservations[year].find((el) => el.id === id);
      return reservation;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można odnaleźć rezerwacji!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async clearUnavailableDates(
    lakeName: string,
    lake: Lake,
    id: string,
  ): Promise<Lake> {
    const result = await this.getReservationByID(lakeName, id);

    const data = result?.data;

    data.forEach(({ dates, spotId }) => {
      const spotToUpdate = lake?.spots.find((s) => s?.spotId === spotId);
      if (spotToUpdate && spotToUpdate?.unavailableDates) {
        Object.keys(spotToUpdate?.unavailableDates).forEach((year) => {
          lake.spots.find((s) => s?.spotId === spotId).unavailableDates[year] =
            spotToUpdate?.unavailableDates[year].filter(
              (unavailableDate) =>
                !dates.some(({ date }) => date === unavailableDate),
            );
        });
      }
    });

    return lake;
  }

  private addUnavailableDates(
    lakeForUpdate: Lake,
    reservation: ReservationData,
    year: string,
  ): Lake | null {
    try {
      for (let i = 0; i < reservation.data.length; i++) {
        for (let j = 0; j < lakeForUpdate.spots.length; j++) {
          if (lakeForUpdate.spots[j].spotId === reservation.data[i].spotId) {
            if (!lakeForUpdate.spots[j].unavailableDates) {
              lakeForUpdate.spots[j].unavailableDates = {};
            }
            if (!lakeForUpdate.spots[j].unavailableDates[year]) {
              lakeForUpdate.spots[j].unavailableDates[year] = [];
            }
            // lakeForUpdate.spots[j].unavailableDates[year] = [
            //   ...lakeForUpdate.spots[j].unavailableDates[year],
            //   reservation.data[i].dates[i].date,
            // ];

            reservation.data[i].dates.forEach((d) => {
              if (
                !lakeForUpdate.spots[j].unavailableDates[year].includes(d.date)
              ) {
                lakeForUpdate.spots[j].unavailableDates[year].push(d.date);
              }
            });
          }
        }
      }
      return lakeForUpdate;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Nie można dodać niedostępnych dat!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  private createIndividualReservations(reservationData: ReservationData[]) {
    const individualReservations = [];

    reservationData.forEach((reservation) => {
      reservation.data.forEach((spot) => {
        const individualReservation = {
          id: reservation.id,
          fullName: reservation.fullName,
          phone: reservation.phone,
          email: reservation.email,
          data: [
            {
              dates: spot.dates,
              spotId: spot.spotId,
            },
          ],
          timestamp: reservation.timestamp,
          confirmed: reservation.confirmed,
          rejected: reservation.rejected,
          price: reservation.price,
          fullPaymentMethod: reservation.fullPaymentMethod,
          fullPaymentStatus: reservation.fullPaymentStatus,
          depositPrice: reservation.depositPrice,
          depositSoFar: reservation.depositSoFar,
          isDepositPaid: reservation.isDepositPaid,
          isDepositRequired: reservation.isDepositRequired,
        };

        individualReservations.push(individualReservation);
      });
    });

    return individualReservations;
  }

  // compareObjects(
  //   newobj1: {
  //     dates: {
  //       date: string;
  //       priceForDate: number;
  //     }[];
  //     spotId: string;
  //   }[],
  //   oldobj2: {
  //     dates: {
  //       date: string;
  //       priceForDate: number;
  //     }[];
  //     spotId: string;
  //   }[],
  // ): string {

  //   if (newobj1.length > oldobj2.length) return 'add';
  //   else if (newobj1.length < oldobj2.length) return 'clear';

  //     for (let i = 0; i < newobj1.length; i++) {
  //       const dates1 = newobj1[i].dates;
  //       const dates2 = oldobj2[i].dates;

  //       if (dates1.length > dates2.length) return 'add';
  //       else if(dates1.length < dates2.length) return 'clear';

  //       for (let j = 0; j < dates1.length; j++) {
  //         if (dates1[j].date !== dates2[j].date) return 'add';

  //       }

  //       if (newobj1[i].spotId !== oldobj2[i].spotId) {
  //         return 'both'; // Wartość pola spotId jest różna, obiekty są różne
  //       }
  //     }

  //   return 'same'; // Obiekty są identyczne
  // }
}
