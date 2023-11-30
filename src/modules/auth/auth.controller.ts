import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/common/decorators';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangePasswordValidator, SignUpValidator, UpdateProfileValidator } from './auth.validator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(201)
  async signUp(@Body() signUpUser: SignUpUserDto) {
    const schema = SignUpValidator;
    const validateResult = schema.validate(signUpUser);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    await this.authService.createUser(signUpUser);
    return;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req) {
    return this.authService.login(req.user._doc);
  }

  @HttpCode(200)
  @Post('change-password')
  changePassword(@Request() req, @Body() password: ChangePasswordDto) {
    const { currentPassword, ...res } = password;
    const schema = ChangePasswordValidator;
    const validateResult = schema.validate(res);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.authService.changePassword(password, req.user);
  }

  @Get('profile')
  getMe(@Request() req) {
    return this.authService.getMe(req.user);
  }

  @HttpCode(200)
  @Post('update-profile')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const schema = UpdateProfileValidator;
    const validateResult = schema.validate({displayName: updateProfileDto.displayName});
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.authService.updateProfile(updateProfileDto, req.user);
  }
}
