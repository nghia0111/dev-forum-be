import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { Report, ReportSchema } from 'src/schemas/reports.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { PostsModule } from '../posts/posts.module';
import { SocketModule } from '../socket/socket.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
    SocketModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
