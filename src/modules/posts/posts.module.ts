import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { Tag, TagSchema } from 'src/schemas/tags.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transactions.schema';
import { Answer, AnswerSchema } from 'src/schemas/answers.schema';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Tag.name, schema: TagSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Answer.name, schema: AnswerSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
