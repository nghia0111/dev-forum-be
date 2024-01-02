import { Module } from '@nestjs/common';
import { ConnectRequestsService } from './connect-requests.service';
import { ConnectRequestsController } from './connect-requests.controller';
import { User, UserSchema } from 'src/schemas/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from 'src/schemas/reports.schema';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { ConnectRequest, ConnectRequestSchema } from 'src/schemas/connect-requests.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transactions.schema';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: ConnectRequest.name, schema: ConnectRequestSchema },
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    SocketModule,
  ],
  controllers: [ConnectRequestsController],
  providers: [ConnectRequestsService],
})
export class ConnectRequestsModule {}
