import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './users.schema';
import { TimestampBase } from './timestamp-base';

@Schema({ timestamps: true })
export class Transaction extends TimestampBase{
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  payee: User;

  @Prop()
  amount: number;

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
