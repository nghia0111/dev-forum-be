import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

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

  @Prop({ default: 0 })
  balance: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }] })
  savedPosts;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  favorites;
}

export const UserSchema = SchemaFactory.createForClass(User);
