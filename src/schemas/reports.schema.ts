import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TimestampBase } from './timestamp-base';
import { ReportTypes } from 'src/common/constants';

@Schema({ timestamps: true })
export class Report extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  accuser;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  accused;

  //transaction id
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' })
  transaction;

  //comment id
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  comment;

  //comment description
  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post;

  @Prop({
    type: String,
    enum: ReportTypes,
    required: true,
  })
  type;

  @Prop({ default: false })
  isReviewed: boolean;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
