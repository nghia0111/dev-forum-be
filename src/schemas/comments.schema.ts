import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { CommentParentTypes } from 'src/common/constants';
import { TextBase } from './text-base';
import { Post } from './posts.schema';

@Schema({ timestamps: true })
export class Comment extends TextBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, refPath: 'parent_type' })
  parent;

  @Prop({ type: String, enum: CommentParentTypes, required: true })
  parent_type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post: Post;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.pre('deleteOne', async function (next) {
  const commentId = this.getQuery()['_id'];
  await mongoose.model('Vote').deleteMany({ parent: commentId });
});