import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { Tag, TagSchema } from 'src/schemas/tags.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/schemas/transactions.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { Vote, VoteSchema } from 'src/schemas/votes.schema';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Notification, NotificationSchema } from 'src/schemas/notifications.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Vote.name, schema: VoteSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
