import {
  Controller,
  Get,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findPosts(@Req() req: Request) {
    return this.notificationsService.getNotifications(req.user);
  }
}
