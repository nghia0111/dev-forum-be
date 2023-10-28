import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './users.schema';

@Schema()
export class Token {
  @Prop()
  refresh_token: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  expiration: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
