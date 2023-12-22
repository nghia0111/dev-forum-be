import {
  Body,
  Controller,
  Get,
  Post,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('update-status')
  updateStatus(@Body('userId') userId: string, @Req() req: Request) {
    return this.usersService.updateStatus(userId, req.user);
  }
}
