import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TimestampBase } from './timestamp-base';

@Schema({ timestamps: true })
export class Report extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  accuser;

  //comment id
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  comment;

  //comment description
  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post;

  @Prop({ default: false })
  isReviewed: boolean;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
