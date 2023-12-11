import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/users.schema';
import { Model } from 'mongoose';
import { ValidationErrorMessages } from 'src/common/constants';

@Injectable()
export class AgoraService {
  constructor(@InjectModel(User.name) private readonly userModel:Model<User>){}

  async generateRtcToken(userId: any){
    const user = await this.userModel.findById(userId);
    if(!user) throw new UnauthorizedException(ValidationErrorMessages.USER_NOT_FOUND);

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const channelName = userId + Date.now().toString();
    const userAccount = userId;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600 * 3;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpired = currentTimestamp + expirationTimeInSeconds;
    const tokenExpired = privilegeExpired;

    // Build token with user account
    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      channelName,
      userAccount,
      role,
      tokenExpired,
      privilegeExpired,
    );
    return {token: token, channelName: channelName};
  };
}
