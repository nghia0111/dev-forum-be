import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TimestampBase } from './timestamp-base';
import { WithdrawStatus } from 'src/common/constants';

@Schema({ timestamps: true })
export class Withdraw extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  requester;

  @Prop()
  paypalEmail: string;

  @Prop()
  amount: number;

  @Prop({ type: String, enum: WithdrawStatus, default: WithdrawStatus.PENDING })
  status;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
