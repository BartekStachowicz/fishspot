import { Body, Controller, Param, Post } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Reservation } from './reservations.model';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post(':lakename')
  async createNewLake(
    @Param('lakename') lakeName: string,
    @Body() reservation: Reservation,
  ): Promise<Reservation | null> {
    await this.reservationsService.createNewReservations(lakeName, reservation);
    return reservation;
  }
}
