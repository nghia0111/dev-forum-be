import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { TextBase } from './text-base';
import { Tag } from './tags.schema';
import { TopicTypes } from 'src/common/constants';

@Schema({ timestamps: true })
export class Post extends TextBase {
  @Prop()
  title: string;

  @Prop()
  bounty: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tags: Tag[];

  @Prop({ type: String, enum: TopicTypes, required: true })
  topic: string;

  @Prop({ default: false })
  isAnswered: boolean;

  @Prop({ default: 0})
  views: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
