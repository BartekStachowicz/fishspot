import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Lake, LakeOuput } from './lake.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LakeService {
  constructor(@InjectModel('Ocieka') private readonly lakeModel: Model<Lake>) {}

  async createNewLake(lake: Lake): Promise<LakeOuput | null> {
    const lakeName = lake.name.toLowerCase().split(' ').join('-');

    const isUnique = await this.hasUniqueName(lakeName);
    if (!isUnique)
      throw new HttpException('Lake already exist!', HttpStatus.CONFLICT);

    const newLake = new this.lakeModel({ ...lake, name: lakeName });
    newLake.save();

    return {
      id: newLake._id,
      name: lakeName,
      spots: newLake.spots,
    };
  }

  async updateLake(lake: Lake): Promise<LakeOuput | null> {
    const lakeForUpdate = await this.findByName(lake.name);

    lakeForUpdate.name = lake?.name || lakeForUpdate.name;
    lakeForUpdate.spots = lake?.spots || lakeForUpdate.spots;

    lakeForUpdate.save();

    return {
      id: lake._id,
      name: lake.name,
      spots: lake.spots,
    };
  }

  async getLake(lakeName: string): Promise<LakeOuput | null> {
    try {
      const lake = await this.findByName(lakeName);
      return {
        id: lake._id,
        name: lake.name,
        spots: lake.spots,
      };
    } catch (error) {
      throw new HttpException('Lake not found!', HttpStatus.NOT_FOUND);
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
