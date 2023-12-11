import { Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './users.schema';
import { TimestampBase } from './timestamp-base';

export class TextBase extends TimestampBase{
  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author;
}
