import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TimestampBase } from './timestamp-base';

@Schema({ timestamps: true })
export class Withdraw extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  requester;

  @Prop()
  paypalEmail: string;

  @Prop()
  amount: number;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
