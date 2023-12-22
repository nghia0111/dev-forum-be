import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import { PostsModule } from '../posts/posts.module';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { User, UserSchema } from 'src/schemas/users.schema';
import { SocketGateway } from '../socket/socket.gateway';
import { SocketModule } from '../socket/socket.module';
import { Report, ReportSchema } from 'src/schemas/reports.schema';

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
