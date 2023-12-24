import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TimestampBase } from './timestamp-base';

@Schema({ timestamps: true })
export class ConnectRequest extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  requester;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiver;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post;

  @Prop({ default: false })
  isAccepted: boolean;
}

export const ConnectRequestSchema = SchemaFactory.createForClass(ConnectRequest);
