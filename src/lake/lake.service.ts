import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Lake, LakeOutput } from './lake.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { resourceLimits } from 'worker_threads';
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

    lakeForUpdate.save();
  }

  async getLake(lakeName: string): Promise<LakeOutput | null> {
    try {
      const lake = await this.findByName(lakeName);

      const currentYear = String(new Date().getFullYear());

      const spotsMaped: SpotsOutput[] = lake.spots.map((spot) => ({
        number: spot.number,
        reservations: spot?.reservations
          ? spot?.reservations[currentYear] || []
          : [],
        unavailableDates: spot?.unavailableDates
          ? spot?.unavailableDates[currentYear] || []
          : [],
        info: spot.info,
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
}
