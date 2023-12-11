import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { UploadModule } from './modules/upload/upload.module';
import { PostsModule } from './modules/posts/posts.module';
import { TagsModule } from './modules/tags/tags.module';
import { SocketGateway } from './modules/socket/socket.gateway';
import { Post, PostSchema } from './schemas/posts.schema';
import { Comment, CommentSchema } from './schemas/comments.schema';
import { VotesModule } from './modules/votes/votes.module';
import { User, UserSchema } from './schemas/users.schema';
import { Notification, NotificationSchema } from './schemas/notifications.schema';
import { AgoraModule } from './modules/agora/agora.module';

@Module({
  imports: [
    // UsersModule,
    // PostsModule,
    // TagsModule,
    // TransactionsModule,
    // RatingsModule,
    VotesModule,
    AuthModule,
    UploadModule,
    PostsModule,
    TagsModule,
    AgoraModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ff8zaru.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
    ),
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SocketGateway,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
