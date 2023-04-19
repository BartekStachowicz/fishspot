import { Body, Controller, Param, Post } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationData } from './reservations.model';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post(':lakename')
  async createNewLake(
    @Param('lakename') lakeName: string,
    @Body() reservation: ReservationData,
  ): Promise<ReservationData | null> {
    await this.reservationsService.createNewReservations(lakeName, reservation);
    return reservation;
  }
}
