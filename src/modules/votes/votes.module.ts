import { Module, forwardRef } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import { Vote, VoteSchema } from 'src/schemas/votes.schema';
import { PostsModule } from '../posts/posts.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Vote.name, schema: VoteSchema },
    ]),
    SocketModule,
    PostsModule,
  ],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
