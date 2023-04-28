import { ReservationData } from '../reservations/reservations.model';

export interface Spots {
  number: number;
  unavailableDates: {
    [year: string]: string[];
  };
  info: SpotsInfo;
}

export interface SpotsInfo {
  priceForDay: number;
  priceForNight: number;
  isPriceForWeekend: boolean;
  priceForWeekend: number;
  description: string;
  houseSpot: boolean;
  houseSpotPrice: HouseSpot;
}

export interface HouseSpot {
  priceForMinimal: number;
  minNumberOfDays: number;
  priceForExtraDay: number;
}

export interface SpotsOutput {
  number: number;
  unavailableDates: string[];
  info: SpotsInfo;
}

export interface SpotsOutputWithReservations {
  number: number;
  reservations: ReservationData[];
}
