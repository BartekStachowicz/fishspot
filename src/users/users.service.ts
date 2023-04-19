import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { User, UserStraightInfo } from './users.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(
    username: string,
    hashedPassword: string,
  ): Promise<UserStraightInfo | null> {
    try {
      const newUser = new this.userModel({
        username: username,
        password: hashedPassword,
      });
      newUser.save();
      return {
        id: newUser._id,
        username: newUser.username,
      };
    } catch {
      throw new HttpException(
        'Create user failed!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(
    username: string,
    newHashedPassword: string,
  ): Promise<UserStraightInfo | null> {
    try {
      const updateUser: User = await this.findByName(username);
      if (!updateUser) return null;
      updateUser.password = newHashedPassword;
      updateUser.save();
      return {
        id: updateUser._id,
        username: updateUser.username,
      };
    } catch {
      throw new HttpException(
        'Update password failed!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByName(username: string): Promise<User | null> {
    try {
      return this.userModel.findOne({ username }).exec();
    } catch {
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    }
  }
}
