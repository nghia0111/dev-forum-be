import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TimestampBase } from './timestamp-base';
import { ConnectRequestStatus } from 'src/common/constants';

@Schema({ timestamps: true })
export class ConnectRequest extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  requester;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiver;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post;

  @Prop()
  message: string;

  @Prop({
    type: String,
    enum: ConnectRequestStatus,
    default: ConnectRequestStatus.PENDING,
  })
  status;
}

export const ConnectRequestSchema = SchemaFactory.createForClass(ConnectRequest);
