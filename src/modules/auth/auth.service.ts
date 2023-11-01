import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { SignUpUserDto } from './dto/signup-user.dto';
import { User } from 'src/schemas/users.schema';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { ValidationErrorMessages } from 'src/common/constants';
import { LoginUserDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

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

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
