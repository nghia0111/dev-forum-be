import {
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserRole,
    ValidationErrorMessages
} from 'src/common/constants';
import { User } from 'src/schemas/users.schema';
import { DepositDto } from './dto/deposit.dto';
import * as paypal from './paypal.config';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class PaypalService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async deposit(depositDto: DepositDto, user: any) {
    const currentUser = await this.userModel.findById(user.userId);
    if (!currentUser)
      throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);

    currentUser.balance += depositDto.amount * 24000;
    await currentUser.save();
    return;
  }

  async acceptWithdrawRequest(
    withdrawDto: WithdrawDto,
    user: any,
  ): Promise<any> {
    try {
      const _admin = await this.userModel.findById(user.userId);
      if (_admin.role != UserRole.ADMIN)
        throw new UnauthorizedException(ValidationErrorMessages.ADMIN_REQUIRED);
      var fetch = require('node-fetch');

      await fetch(
        'https://api-m.sandbox.paypal.com/v1/payments/payouts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer A21AAJk1Kzcg7zt251QNVVJ8RJPBxvB5IJghevprsul5EAvQ6a-4CDP6Twl0G_HkJzA_QvnstfzAeDoAvQ2ez0Q4rXkjzT0lg',
          },
          body: JSON.stringify({
            sender_batch_header: {
              sender_batch_id: 'Payouts_2020_100007',
              email_subject: 'You have a payout!',
              email_message:
                'You have received a payout! Thanks for using our service!',
            },
            items: [
              {
                recipient_type: 'EMAIL',
                amount: { value: withdrawDto.amount, currency: 'USD' },
                note: 'Thanks for your patronage!',
                sender_item_id: '201403140001',
                receiver: withdrawDto.paypalEmail,
              },
            ],
          }),
        },
      );

    } catch (error) {
      console.error(
        'P2P Transfer Error:',
        error.response ? error.response : error.message,
      );
      throw new Error('P2P Transfer failed');
    }
  }
}
