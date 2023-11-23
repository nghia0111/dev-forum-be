import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TextBase } from './text-base';
import { Post } from './posts.schema';
import { VoteTypes } from 'src/common/constants';

@Schema({ timestamps: true, toJSON: {virtuals: true} })
export class Comment extends TextBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  parent;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post: Post;

  @Prop({ default: false })
  is_accepted: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.virtual('score').get(async function () {
  return (
    (await mongoose
      .model('Vote')
      .countDocuments({ parent: this._id, vote_type: VoteTypes.UP_VOTE })) -
    (await mongoose
      .model('Vote')
      .countDocuments({ parent: this._id, vote_type: VoteTypes.DOWN_VOTE }))
  );
});

CommentSchema.pre('deleteOne', async function (next) {
  const commentId = this.getQuery()['_id'];
  await mongoose.model('Vote').deleteMany({ parent: commentId });
});
