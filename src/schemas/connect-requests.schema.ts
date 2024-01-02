import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ConnectRequestStatus } from 'src/common/constants';
import { TimestampBase } from './timestamp-base';

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

  //rating infor for succeeded request
  @Prop()
  ratingScore: number;

  @Prop()
  ratingDescription: string;
}

export const ConnectRequestSchema = SchemaFactory.createForClass(ConnectRequest);
