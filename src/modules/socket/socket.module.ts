import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/schemas/notifications.schema';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { AgoraModule } from '../agora/agora.module';
import { PostsModule } from '../posts/posts.module';
import { SocketGateway } from './socket.gateway';

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
