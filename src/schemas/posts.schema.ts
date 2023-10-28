import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Base } from './base';
import { Tag } from './tags.schema';

@Schema({ timestamps: true })
export class Post extends Base{
  @Prop()
  title: string;

  @Prop()
  bounty: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tags: Tag[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
