import * as mongoose from 'mongoose';
import { Spots, SpotsOutput } from '../spots/spots.model';
import { Reservation } from 'src/reservations/reservations.model';
import { BigFish } from './news.model';
import {
  Competition,
  CompetitionData,
} from 'src/reservations/competition.model';

export const LakeSchema = new mongoose.Schema({
  name: { type: String, require: true },
  spots: { type: Array, require: true },
  reservations: { type: Object, require: true },
  competition: { type: Object, require: true },
  bigFish: { type: Array, require: true },
});

export interface Lake extends mongoose.Document {
  name: string;
  spots: Spots[];
  reservations: Reservation;
  competition: Competition;
  bigFish: BigFish[];
}

export interface LakeOutput {
  id: string;
  name: string;
  spots: SpotsOutput[];
  competition: CompetitionData[];
  bigFish: BigFish[];
}
