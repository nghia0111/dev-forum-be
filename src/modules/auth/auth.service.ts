import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { SignUpUserDto } from './dto/signup-user.dto';
import { User } from 'src/schemas/users.schema';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { ValidationErrorMessages } from 'src/common/constants';
import { LoginUserDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  async createUser(signUpUser: SignUpUserDto) {
    const { email, password, displayName } = signUpUser;
    const existingUser = await this.userModel.findOne({
      email: email,
    });
    if (existingUser) {
      throw new ConflictException(ValidationErrorMessages.EMAIL_CONFLICT);
    }
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT),
    );
    await this.userModel.create({
      displayName,
      email,
      password: hashedPassword,
    });
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userModel.findOne({ email: loginUserDto.email });
    if (!user) {
      throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
    }
    const isValid = await bcrypt.compareSync(
      loginUserDto.password,
      user.password,
    );
    if (!isValid) {
      throw new UnauthorizedException(ValidationErrorMessages.PASSWORD_INVALID);
    }
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id.toString() };
    const {password, ...result} = user;
    return {
      user: result,
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  async changePassword(password: ChangePasswordDto, user: any) {
    const existingUser = await this.userModel.findById(user.userId);
    if(!existingUser) throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
    const isValid = await bcrypt.compareSync(
      password.currentPassword,
      existingUser.password,
    );
    if (!isValid) {
      throw new UnauthorizedException(ValidationErrorMessages.PASSWORD_INVALID);
    }
    const hashedPassword = await bcrypt.hash(
      password.newPassword,
      Number(process.env.SALT),
    );
    existingUser.password = hashedPassword;
    await existingUser.save();
  }

  async getMe(user: any) {
    const existingUser = await this.userModel.findById(user.userId).populate('favorites').lean();
    if (!existingUser)
      throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
    const { password, ...result } = existingUser;
    return result;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
