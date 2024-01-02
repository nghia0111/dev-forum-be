import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TransactionStatus } from 'src/common/constants';
import { TimestampBase } from './timestamp-base';

@Schema({ timestamps: true })
export class Withdraw extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  requester;

  @Prop()
  paypalEmail: string;

  @Prop()
  amount: number;

  @Prop({
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
