import {
  Controller,
  Get,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@Req() req: Request) {
    return this.notificationsService.getNotifications(req.user);
  }

  @Put(':notificationId')
  seenNotification(@Param('notificationId') notiId: string, @Req() req: Request) {
    return this.notificationsService.seenNotification(req.user, notiId);
  }
}
