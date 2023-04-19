import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  username: { type: String, require: true },
  password: { type: String, require: true },
});

export interface User extends mongoose.Document {
  username: string;
  password: string;
}

export interface UserInput {
  username: string;
  password: string;
}

export interface NewOrChangeUserInput {
  username: string;
  password: string;
  key: string;
}

export interface UserOutput {
  id: string;
  username: string;
  token: string;
}

export interface UserStraightInfo {
  id: string;
  username: string;
}
