export interface Spots {
  spotId: string;
  number: string;
  unavailableDates: {
    [year: string]: string[];
  };
  info: SpotsInfo;
  options: SpotOptions;
}

export interface SpotsInfo {
  priceList: PriceList;
  description: string;
  houseSpot: boolean;
  houseSpotPrice: HouseSpot;
  spotCapacity: number;
}

export interface HouseSpot {
  priceForMinimal: number;
  minNumberOfDays: number;
  priceForExtraDay: number;
}

export interface SpotsOutput {
  spotId: string;
  number: string;
  unavailableDates: string[];
  info: SpotsInfo;
  options: SpotOptions;
}

export interface PriceList {
  options: {
    weekend: boolean;
  };
  default: {
    priceDay: number;
    priceNigth: number;
  };
  weekend: {
    priceDay: number;
    priceNigth: number;
  };
  specials: {
    [key: string]: SpecialDates;
  };
}

export interface SpecialDates {
  priceDay: number;
  priceNigth: number;
  dates: {
    startDate: string;
    endDate: string;
  };
}

export interface SpotOptions {
  isDepositRequire: boolean;
  depositValue: string;
  depositRequiredSince: number;
}
