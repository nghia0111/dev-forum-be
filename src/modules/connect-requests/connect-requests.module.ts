import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectRequest, ConnectRequestSchema } from 'src/schemas/connect-requests.schema';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transactions.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { SocketModule } from '../socket/socket.module';
import { ConnectRequestsController } from './connect-requests.controller';
import { ConnectRequestsService } from './connect-requests.service';

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
