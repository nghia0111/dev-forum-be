import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { SignUpUserDto } from './dto/signup-user.dto';
import { User } from 'src/schemas/users.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole, ValidationErrorMessages, defaultAvatar } from 'src/common/constants';
import { LoginUserDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Tag } from 'src/schemas/tags.schema';
import { FirebaseService } from '../firebase/firebase.service';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    private jwtService: JwtService,
    @Inject(FirebaseService) private readonly firebaseService: FirebaseService,
  ) {}
  async createUser(signUpUser: SignUpUserDto) {
    const { email, password, displayName } = signUpUser;
    const existingUser = await this.userModel.findOne({
      email: email,
    });
    if (existingUser) {
      throw new ConflictException(ValidationErrorMessages.EMAIL_CONFLICT);
    }
    console.log("test1")
    const firebaseUser = {
      displayName: signUpUser.displayName,
      email: signUpUser.email,
      createdAt: new Date(),
      photoURL: defaultAvatar
    }
    this.firebaseService.createUser(firebaseUser)
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT),
    );
    await this.userModel.create({
      displayName,
      email,
      password: hashedPassword,
      role: UserRole.USER
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
    const { password, ...result } = user;
    return {
      user: result,
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  async changePassword(password: ChangePasswordDto, user: any) {
    const existingUser = await this.userModel.findById(user.userId);
    if (!existingUser)
      throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
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
    const existingUser = await this.userModel
      .findById(user.userId)
      .populate('favorites')
      .lean();
    if (!existingUser)
      throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
    const { password, ...result } = existingUser;
    return result;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: any) {
    const existingUser = await this.userModel.findById(user.userId);
    if (!existingUser)
      throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
    await Promise.all(
      updateProfileDto.favorites.map(async (tagId) => {
        try {
          const tag = await this.tagModel.findById(tagId);
          if (!tag)
            throw new NotFoundException(ValidationErrorMessages.TAG_NOT_FOUND);
        } catch (err) {
          throw new NotFoundException(ValidationErrorMessages.TAG_NOT_FOUND);
        }
      }),
    );
    existingUser.displayName = updateProfileDto.displayName;
    if (updateProfileDto.avatar) existingUser.avatar = updateProfileDto.avatar;
    existingUser.description = updateProfileDto.description;
    existingUser.favorites = updateProfileDto.favorites;
    await existingUser.save();

    const firebaseUser = {displayName: updateProfileDto.displayName, photoURL: updateProfileDto.avatar?.secure_url || defaultAvatar};
    console.log(firebaseUser.photoURL)
    await this.firebaseService.updateUser(existingUser.email, firebaseUser)

    // Use lean() for refined object
    const _user = await this.userModel
      .findById(user.userId)
      .populate('favorites')
      .lean();

    const { password, savedPosts, ...result } = _user;
    return result;
  }

  async requestResetPassword(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new NotFoundException(ValidationErrorMessages.USER_NOT_FOUND);
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();
  }
}
