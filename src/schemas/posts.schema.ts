import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TextBase } from './text-base';
import { Tag } from './tags.schema';
import { TopicTypes, VoteTypes } from 'src/common/constants';

@Schema({ timestamps: true, toJSON: {virtuals: true} })
export class Post extends TextBase {
  @Prop()
  title: string;

  @Prop()
  bounty: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tags;

  @Prop({ type: String, enum: TopicTypes, required: true })
  topic: string;

  @Prop({ default: false })
  isAnswered: boolean;

  @Prop({ default: 0})
  views: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.virtual('score').get(async function () {
  return (
    (await mongoose
      .model('Vote')
      .countDocuments({ parent: this._id, vote_type: VoteTypes.UP_VOTE })) -
    (await mongoose
      .model('Vote')
      .countDocuments({ parent: this._id, vote_type: VoteTypes.DOWN_VOTE }))
  );
});