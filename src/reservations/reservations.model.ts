export interface Reservation {
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
