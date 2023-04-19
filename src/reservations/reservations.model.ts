export interface Reservation {
  [year: string]: ReservationData[];
}

export interface ReservationData {
  fullName: string;
  phone: string;
  email: string;
  data: {
    dates: string[];
    spot: number;
  }[];
  timestamp: string;
  confirmed: boolean;
  rejected: boolean;
}
