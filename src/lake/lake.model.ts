import * as mongoose from 'mongoose';
import { Spots } from '../spots/spots.model';

export const LakeSchema = new mongoose.Schema({
  name: { type: String, require: true },
  spots: { type: Array, require: true },
});

export interface Lake extends mongoose.Document {
  name: string;
  spots: Spots[];
}

export interface LakeOuput {
  id: string;
  name: string;
  spots: Spots[];
}
