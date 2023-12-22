import {
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    ValidationErrorMessages
} from 'src/common/constants';
import { User } from 'src/schemas/users.schema';
import { DepositDto } from './dto/deposit.dto';

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
}
