import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TransactionStatus, TransactionTypes } from 'src/common/constants';
import { TimestampBase } from './timestamp-base';

@Schema({ timestamps: true })
export class Transaction extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user;

  @Prop()
  amount: number;

  //reference for update after admin accepts report
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiver;

  @Prop({ type: String, enum: TransactionTypes, required: true })
  type;

  @Prop()
  message: string;

  // reference to withdraw for transaction cancelling
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Withdraw' })
  withdraw;

  // reference to post for post owner reporting
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post;

  @Prop({
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status;

  // for report user
  @Prop({ default: false })
  isReported: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
