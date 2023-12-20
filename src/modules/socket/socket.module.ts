import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/schemas/notifications.schema';
import { SocketGateway } from './socket.gateway';
import { AgoraModule } from '../agora/agora.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    AgoraModule,
    PostsModule
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
