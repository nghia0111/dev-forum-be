import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';

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
