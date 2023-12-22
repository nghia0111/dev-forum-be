import { Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole, UserStatus, ValidationErrorMessages } from 'src/common/constants';
import { User } from 'src/schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll() {
    return await this.userModel
      .find({ role: UserRole.USER })
      .select('displayName avatar email status');
  }

  async updateStatus(userId: string, user: any) {
    const _admin = await this.userModel.findById(user.userId);
    if(_admin.role != UserRole.ADMIN) throw new UnauthorizedException(ValidationErrorMessages.ADMIN_REQUIRED);
    const _user = await this.userModel.findById(userId);
    if(!_user) throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
    if (_user.role != UserRole.USER)
      throw new NotAcceptableException(ValidationErrorMessages.ADMIN_UNBANNABLE);
    if(_user.status == UserStatus.ACTIVE) _user.status = UserStatus.BANNED;
    else _user.status = UserStatus.ACTIVE;
    await _user.save();
    return;
  }
}
