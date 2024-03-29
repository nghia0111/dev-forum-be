import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { NotificationTypes } from 'src/common/constants';
import { TimestampBase } from './timestamp-base';

@Schema({ timestamps: true })
export class Notification extends TimestampBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender;

  @Prop({ type: String, enum: NotificationTypes, required: true })
  type;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiver: boolean;

  @Prop({ required: true })
  hasSeen: boolean;

  @Prop()
  message: string;

  // extra data for navigating when click to notification, such as meeting token, channel name, commentId, postId
  @Prop(
    raw({
      token: { type: String },
      channelName: { type: String },
      commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
      postSlug: { type: String },
      commentContent: { type: String },
    }),
  )
  extraData: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

