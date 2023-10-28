import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Tag } from './tags.schema';

@Schema()
export class User {
  @Prop()
  displayName: string;

  @Prop()
  email: string;

  @Prop(
    raw({
      url: { type: String },
      public_id: { type: String },
    }),
  )
  avatar: Record<string, any>;

  @Prop()
  password: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  favorites: Tag[];
}

export const UserSchema = SchemaFactory.createForClass(User);
