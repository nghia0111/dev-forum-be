import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './users.schema';

@Schema({timestamps: true})
export class Rating {
  @Prop()
  score: number;

  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reviewer: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reviewee: User;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
