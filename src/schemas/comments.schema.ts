import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { CommentParentTypes } from 'src/common/constants';
import { Base } from './base';

@Schema({ timestamps: true })
export class Comment extends Base {
  @Prop({ type: mongoose.Schema.Types.ObjectId, refPath: 'parent_type' })
  parent;

  @Prop({ type: String, enum: CommentParentTypes, required: true })
  parent_type: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
