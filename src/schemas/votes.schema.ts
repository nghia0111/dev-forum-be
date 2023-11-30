import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { VoteParentTypes, VoteTypes } from 'src/common/constants';
import { User } from './users.schema';

@Schema()
export class Vote {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, refPath: 'parent_type' })
  parent;

  @Prop({ type: String, enum: VoteParentTypes, required: true })
  parentType: string;

  @Prop({ type: String, enum: VoteTypes, required: true })
  voteType: number;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
