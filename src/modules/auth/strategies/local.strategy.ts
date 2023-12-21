import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserStatus, ValidationErrorMessages } from 'src/common/constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser({email, password});
    if (!user) {
      throw new UnauthorizedException();
    }
    if(user._doc.status == UserStatus.BANNED){
      throw new BadRequestException(ValidationErrorMessages.USER_BANNED);
    }
    return user;
  }
}
