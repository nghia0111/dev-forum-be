import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ValidationErrorMessages
} from 'src/common/constants';
import { Notification } from 'src/schemas/notifications.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async getNotifications(user: any) {
    return await this.notificationModel
      .find({ receiver: user.userId })
      .sort('-createdAt')
      .populate('sender', 'displayName avatar');
  }

  async seenNotification(user: any, notiId: string) {
    const noti = await this.notificationModel.findById(notiId);
    if(!noti) throw new NotFoundException(ValidationErrorMessages.NOTI_NOT_FOUND)
    if(noti.receiver != user.userId) throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);
    noti.hasSeen = true;
    await noti.save();
    return;
  }
}
