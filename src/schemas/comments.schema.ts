import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Post } from './posts.schema';
import { TextBase } from './text-base';

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Comment extends TextBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  parent;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post;

  @Prop({ default: false })
  is_accepted: boolean;

  @Prop({ default: 0 })
  score: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.pre('deleteOne', async function (next) {
  const commentId = this.getQuery()['_id'];
  await mongoose.model('Vote').deleteMany({ parent: commentId });
});
