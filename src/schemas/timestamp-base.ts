import { Document } from 'mongoose';

export class TimestampBase extends Document {
  createdAt: Date;
  updatedAt: Date;
}
