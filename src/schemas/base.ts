import { Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './users.schema';

export class Base {
  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;
}
