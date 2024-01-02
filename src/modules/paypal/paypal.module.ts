import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from 'src/schemas/transactions.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { Withdraw, WithdrawSchema } from 'src/schemas/withdraws.schema';
import { PaypalController } from './paypal.controller';
import { PaypalService } from './paypal.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Withdraw.name, schema: WithdrawSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [PaypalController],
  providers: [PaypalService],
})
export class PaypalModule {}
