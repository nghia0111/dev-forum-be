import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TimestampBase } from './timestamp-base';

@Schema({ timestamps: true })
export class Rating extends TimestampBase {
  @Prop()
  score: number;

  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ConnectRequest' })
  request;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reviewer;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reviewee;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
