import {
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import {
  TopicTypes,
  ValidationErrorMessages,
  VoteParentTypes,
  VoteTypes,
} from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';
import { User } from 'src/schemas/users.schema';
import { Notification } from 'src/schemas/notifications.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async getNotifications(user: any) {
    return await this.notificationModel.find({receiver: user.userId}).sort('-createdAt').populate('sender', 'displayName avatar');
  }
}
