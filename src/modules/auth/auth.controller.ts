import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';
import { Public } from 'src/common/decorators';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(201)
  async signUp(@Body() signUpUser: SignUpUserDto) {
    const schema = Joi.object({
      displayName: Joi.string().min(3).max(30).required().messages({
        'string.min': ValidationErrorMessages.DISPLAY_NAME_LENGTH,
        'string.max': ValidationErrorMessages.DISPLAY_NAME_LENGTH,
        'any.required': ValidationErrorMessages.DISPLAY_NAME_REQUIRE,
        'string.empty': ValidationErrorMessages.DISPLAY_NAME_REQUIRE,
      }),
      password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{8,32}$'))
        .required()
        .messages({
          'string.pattern.base': ValidationErrorMessages.PASSWORD_PATTERN,
          'any.required': ValidationErrorMessages.PASSWORD_REQUIRE,
          'string.empty': ValidationErrorMessages.PASSWORD_REQUIRE,
        }),
      confirmPassword: Joi.any()
        .equal(Joi.ref('password'))
        .required()
        .messages({
          'any.only': ValidationErrorMessages.CONFIRMPASSWORD_INVALID,
        }),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net', 'vn'] },
        })
        .required()
        .messages({
          'string.email': ValidationErrorMessages.EMAIL_INVALID,
          'any.required': ValidationErrorMessages.EMAIL_REQUIRE,
          'string.empty': ValidationErrorMessages.EMAIL_REQUIRE,
        }),
    });

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

  //   @Get(':id')
  //   findOne(@Param('id') id: string) {
  //     return this.authService.findOne(+id);
  //   }

  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //     return this.authService.update(+id, updateAuthDto);
  //   }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.authService.remove(+id);
  //   }
}
