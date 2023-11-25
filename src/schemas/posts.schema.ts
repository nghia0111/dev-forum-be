import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TopicTypes } from 'src/common/constants';
import { TextBase } from './text-base';
import * as slug from 'mongoose-slug-generator'
@Schema({ timestamps: true })
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

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  score: number;

  @Prop({ type: String, slug: 'title' })
  slug;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.plugin(slug);

PostSchema.pre('deleteOne', async function (next) {
  const postId = this.getQuery()['_id'];
  await mongoose.model('Vote').deleteMany({ parent: postId });
});