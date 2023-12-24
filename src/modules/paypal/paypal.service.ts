import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TransactionTypes,
  UserRole,
    ValidationErrorMessages,
    WithdrawStatus
} from 'src/common/constants';
import { User } from 'src/schemas/users.schema';
import { DepositDto } from './dto/deposit.dto';
import * as paypal from './paypal.config';
import { WithdrawDto } from './dto/withdraw.dto';
import { Withdraw } from 'src/schemas/withdraws.schema';
import { Transaction } from 'src/schemas/transactions.schema';

@Injectable()
export class PaypalService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Withdraw.name) private withdrawModel: Model<Withdraw>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async deposit(depositDto: DepositDto, user: any) {
    const currentUser = await this.userModel.findById(user.userId);
    if (!currentUser)
      throw new NotFoundException(ValidationErrorMessages.UNAUTHENTICATED);

    currentUser.balance += depositDto.amount * 24000;
    await currentUser.save();

    await this.transactionModel.create({
      user: user.userId,
      amount: depositDto.amount * 24000,
      type: TransactionTypes.DEPOSIT,
    });
  }

  async acceptWithdrawRequest(withdrawId: string, user: any): Promise<any> {
    try {
      const _admin = await this.userModel.findById(user.userId);
      if (_admin.role != UserRole.ADMIN)
        throw new UnauthorizedException(ValidationErrorMessages.ADMIN_REQUIRED);
      var fetch = require('node-fetch');

      const existingWithdraw = await this.withdrawModel.findById(withdrawId);
      if (!existingWithdraw)
        throw new NotFoundException(ValidationErrorMessages.WITHDRAW_NOT_FOUND);

      const formData = new URLSearchParams();
      formData.append('grant_type', 'client_credentials');
      const tokenResponse = await fetch(
        'https://api-m.sandbox.paypal.com/v1/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET_KEY}`,
            ).toString('base64')}`,
          },
          body: formData.toString(),
        },
      );
      const token = await tokenResponse.json().access_token;

      await fetch('https://api-m.sandbox.paypal.com/v1/payments/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_batch_header: {
            sender_batch_id: `Payouts_${Date.now()}`,
            email_subject: 'You have a payout!',
            email_message:
              'You have received a payout! Thanks for using our service!',
          },
          items: [
            {
              recipient_type: 'EMAIL',
              amount: {
                value: existingWithdraw.amount / 24000,
                currency: 'USD',
              },
              note: 'Thanks for your patronage!',
              sender_item_id: '201403140001',
              receiver: existingWithdraw.paypalEmail,
            },
          ],
        }),
      });
      existingWithdraw.status = WithdrawStatus.SUCCEEDED;
      await existingWithdraw.save();
      await this.transactionModel.create({
        user: existingWithdraw.requester,
        amount: existingWithdraw.amount,
        type: TransactionTypes.WITHDRAW,
      });
    } catch (error) {
      console.error(
        'P2P Transfer Error:',
        error.response ? error.response : error.message,
      );
      throw new Error('P2P Transfer failed');
    }
  }

  async createWithdraw(withdrawDto: WithdrawDto, user: any) {
    const currentUser = await this.userModel.findById(user.userId);
    if (!currentUser)
      throw new NotFoundException(ValidationErrorMessages.UNAUTHENTICATED);

    if (withdrawDto.amount > currentUser.balance)
      throw new NotAcceptableException(ValidationErrorMessages.AMOUNT_INVALID);
    currentUser.balance -= withdrawDto.amount;
    await currentUser.save();
    await this.withdrawModel.create({
      requester: user.userId,
      paypalEmail: withdrawDto.paypalEmail,
      amount: withdrawDto.amount,
    });
  }

  async cancelWithdrawRequest(withdrawId: string, user: any) {
    const currentUser = await this.userModel.findById(user.userId);
    if (!currentUser)
      throw new NotFoundException(ValidationErrorMessages.UNAUTHENTICATED);
    const existingWithdraw = await this.withdrawModel.findById(withdrawId);
    if (!existingWithdraw)
      throw new NotFoundException(ValidationErrorMessages.WITHDRAW_NOT_FOUND);
    if (user.userId != existingWithdraw.requester)
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);

    currentUser.balance += existingWithdraw.amount;
    await currentUser.save();
    existingWithdraw.status = WithdrawStatus.CANCELLED;
    await existingWithdraw.save();
  }

  async getWithdrawRequests(user: any) {
    const currentUser = await this.userModel.findById(user.userId);
    if (currentUser.role != UserRole.ADMIN)
      throw new NotFoundException(ValidationErrorMessages.ADMIN_REQUIRED);
    return await this.withdrawModel
      .find()
      .populate('requester', 'displayName avatar');
  }

  async getTransactions(user: any) {
    const currentUser = await this.userModel.findById(user.userId);
    if (!currentUser)
      throw new NotFoundException(ValidationErrorMessages.UNAUTHENTICATED);
    return await this.transactionModel
      .find({user: user.userId});
  }
}
