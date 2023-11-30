import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserRole } from 'src/common/constants';

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

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role;

  @Prop()
  resetToken: string;

  @Prop()
  resetTokenExpire: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
