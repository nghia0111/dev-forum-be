import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TimestampBase } from './timestamp-base';
import { TransactionStatus, TransactionTypes } from 'src/common/constants';

@Schema({ timestamps: true })
export class Transaction extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user;

  @Prop()
  amount: number;

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
    required: true,
  })
  status;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
