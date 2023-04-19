import * as mongoose from 'mongoose';
import { Spots, SpotsOutput } from '../spots/spots.model';

export const LakeSchema = new mongoose.Schema({
  name: { type: String, require: true },
  spots: { type: Array, require: true },
});

export interface Lake extends mongoose.Document {
  name: string;
  spots: Spots[];
}

export interface LakeOutput {
  id: string;
  name: string;
  spots: SpotsOutput[];
}
