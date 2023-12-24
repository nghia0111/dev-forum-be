import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './users.schema';
import { TimestampBase } from './timestamp-base';
import { TransactionTypes } from 'src/common/constants';

@Schema({ timestamps: true })
export class Transaction extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user;

  @Prop()
  amount: number;

  @Prop({ type: String, enum: TransactionTypes, required: true })
  type;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
