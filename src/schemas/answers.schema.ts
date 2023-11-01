// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TextBase } from './text-base';
import { Post } from './posts.schema';

@Schema({ timestamps: true })
export class Answer extends TextBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post: Post;

  @Prop()
  is_accepted: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
