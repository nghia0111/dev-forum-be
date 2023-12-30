import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { VoteParentTypes, VoteTypes } from 'src/common/constants';

@Schema()
export class Vote {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user;

  @Prop({ type: mongoose.Schema.Types.ObjectId, refPath: 'parent_type' })
  parent;

  @Prop({ type: String, enum: VoteParentTypes, required: true })
  parentType;

  @Prop({ type: Number, enum: VoteTypes, required: true })
  voteType;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
