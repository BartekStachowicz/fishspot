export interface Reservation {
  [year: string]: ReservationData[];
}

export interface ReservationData {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  data: {
    dates: string[];
    spotId: string;
  }[];
  timestamp: string;
  confirmed: boolean;
  rejected: boolean;
  price: number;
  fullPaymentMethod: string; //online, cash
  fullPaymentStatus: string; //oczekujące, zapłacone itp.
  depositPrice: number;
  isDepositPaidOnline: boolean;
  isDepositRequired: boolean;
}
