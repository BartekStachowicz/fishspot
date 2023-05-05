import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Lake, LakeOutput } from './lake.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SpotsOutput } from 'src/spots/spots.model';

@Injectable()
export class LakeService {
  constructor(@InjectModel('Ocieka') private readonly lakeModel: Model<Lake>) {}

  async createNewLake(lake: Lake): Promise<Lake | null> {
    const lakeName = lake.name.toLowerCase().split(' ').join('-');

    const isUnique = await this.hasUniqueName(lakeName);
    if (!isUnique)
      throw new HttpException('Lake already exist!', HttpStatus.CONFLICT);

    const newLake = new this.lakeModel({ ...lake, name: lakeName });
    newLake.save();

    return newLake;
  }

  async updateLake(lake: Lake): Promise<void> {
    const lakeForUpdate = await this.findByName(lake.name);

    lakeForUpdate.name =
      lake?.name.toLowerCase().split(' ').join('-') || lakeForUpdate.name;
    lakeForUpdate.spots = lake?.spots || lakeForUpdate.spots;
    lakeForUpdate.reservations =
      lake?.reservations || lakeForUpdate.reservations;

    lakeForUpdate.save();
  }

  async getLake(lakeName: string, year: string): Promise<LakeOutput | null> {
    try {
      const lake = await this.findByName(lakeName);

      const currentYear = this.getCurrentYear();
      if (year === '') year = currentYear;
      const spotsMaped: SpotsOutput[] = lake.spots.map((spot) => ({
        number: spot.number,
        spotId: spot.spotId,
        unavailableDates: spot?.unavailableDates
          ? spot?.unavailableDates[year] || []
          : [],
        info: spot.info,
        options: spot.options,
      }));

      return {
        id: lake._id,
        name: lake.name,
        spots: spotsMaped,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Lake not found! Cannot get lake info!',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async hasUniqueName(name: string): Promise<boolean> {
    const foundLake = await this.findByName(name);
    const isExisting = !!foundLake;
    if (isExisting) return false;
    else return true;
  }

  async findByName(name: string): Promise<Lake | null> {
    try {
      return this.lakeModel.findOne({ name }).exec();
    } catch {
      throw new HttpException('Lake not found!', HttpStatus.NOT_FOUND);
    }
  }

  private getCurrentYear(): string {
    return String(new Date().getFullYear());
  }

  private getYearFromID(id: string): string {
    const timestamp = id.split('.')[1];
    const year = this.dateConverter(timestamp);
    return year;
  }

  private dateConverter(timestamp: string) {
    const date: Date = new Date(+timestamp * 1000);
    return String(date.getFullYear());
  }
}
