import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TimestampBase } from './timestamp-base';

@Schema({ timestamps: true })
export class Report extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  accuser;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  comment;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post;
}

export const ReportSchema = SchemaFactory.createForClass(Report);