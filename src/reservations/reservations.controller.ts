import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { ReservationData } from './reservations.model';
import { SpotsOutputWithReservations } from '../spots/spots.model';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post(':lakename')
  async createNewReservation(
    @Param('lakename') lakeName: string,
    @Body() reservation: ReservationData,
  ): Promise<ReservationData | null> {
    const newReservation = await this.reservationsService.createNewReservations(
      lakeName,
      reservation,
    );
    return newReservation;
  }

  @Post(':lakename/:id')
  async confirmReservation(
    @Param('lakename') lakeName: string,
    @Param('id') id: string,
  ): Promise<ReservationData> {
    const updatedReservation =
      await this.reservationsService.updateConfirmedReservation(lakeName, id);
    return updatedReservation;
  }

  @Get('one/:lakename/:id')
  async getReservationByID(
    @Param('lakename') lakeName: string,
    @Param('id') id: string,
  ): Promise<ReservationData> {
    const reservation = await this.reservationsService.getReservationByID(
      lakeName,
      id,
    );
    return reservation;
  }

  @Get('not-confirmed/:lakename')
  async getNotConfirmedReservations(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Param('lakename') lakeName: string,
  ): Promise<ReservationData[]> {
    const reservations =
      await this.reservationsService.getNotConfirmedReservations(
        lakeName,
        +offset,
        +limit,
      );
    return reservations;
  }

  @Get('confirmed/:lakename/:year')
  async getAllReservationsByYear(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Param('lakename') lakeName: string,
    @Param('year') year: string,
  ): Promise<ReservationData[]> {
    const reservations =
      await this.reservationsService.getAllReservationsByYear(
        lakeName,
        year,
        +offset,
        +limit,
      );
    return reservations;
  }

  @Get('byspots/:lakename/:spotId')
  async getReservationsBySpots(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Param('lakename') lakeName: string,
    @Param('spotId') spotId: string,
  ): Promise<SpotsOutputWithReservations> {
    const reservations = await this.reservationsService.getReservationsBySpots(
      lakeName,
      spotId,
      +offset,
      +limit,
    );
    return reservations;
  }

  @Delete('delete/:lakename/:id')
  async deleteReservation(
    @Param('lakename') lakeName: string,
    @Param('id') id: string,
  ) {
    await this.reservationsService.deleteReservation(lakeName, id);
  }
}
