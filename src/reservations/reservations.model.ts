import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  Length,
} from 'class-validator';

export interface Reservation {
  [year: string]: ReservationData[];
}

export class ReservationData {
  id: string;
  @IsNotEmpty()
  @IsString()
  @Length(1, 40, {
    message: 'Name is invalid.',
  })
  fullName: string;
  @IsNotEmpty()
  @Matches(/^(0|[1-9]\d*)(\.\d+)?$/, {
    message: 'Phone number is invalid.',
  })
  phone: string;
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Email is invalid.',
    },
  )
  email: string;
  data: {
    dates: {
      date: string;
      priceForDate: number;
    }[];
    spotId: string;
  }[];
  timestamp: string;
  confirmed: boolean;
  rejected: boolean;
  price: number;
  fullPaymentMethod: string; //online, cash itp.
  fullPaymentStatus: string; //oczekujące, zapłacone itp.
  depositPrice: number; //wysokość zaliczki
  depositSoFar: number; //wysokość wpłaconej zaliczki (np. gotówką przy okazji łowienia)
  isDepositPaid: boolean; //czy zapłacona zaliczka
  isDepositRequired: boolean; // czy wymagana zaliczka

  constructor(
    id: string,
    fullName: string,
    phone: string,
    email: string,
    data: {
      dates: {
        date: string;
        priceForDate: number;
      }[];
      spotId: string;
    }[],
    timestamp: string,
    confirmed: boolean,
    rejected: boolean,
    price: number,
    fullPaymentMethod: string,
    fullPaymentStatus: string,
    depositPrice: number,
    depositSoFar: number,
    isDepositPaid: boolean,
    isDepositRequired: boolean,
  ) {
    this.id = id;
    this.fullName = fullName;
    this.phone = phone;
    this.email = email;
    this.data = data;
    this.timestamp = timestamp;
    this.confirmed = confirmed;
    this.rejected = rejected;
    this.price = price;
    this.fullPaymentMethod = fullPaymentMethod;
    this.fullPaymentStatus = fullPaymentStatus;
    this.depositPrice = depositPrice;
    this.depositSoFar = depositSoFar;
    this.isDepositPaid = isDepositPaid;
    this.isDepositRequired = isDepositRequired;
  }
}
