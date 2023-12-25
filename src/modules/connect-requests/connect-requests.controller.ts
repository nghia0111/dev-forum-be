import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ConnectRequestsService } from './connect-requests.service';
import { Request } from 'express';
import { ConnectRequestDto } from './dto/connect-request.dto';

@Controller('connect-requests')
export class ConnectRequestsController {
  constructor(
    private readonly connectRequestsService: ConnectRequestsService,
  ) {}

  @Post()
  create(@Req() req: Request, @Body() connectRequestDto: ConnectRequestDto) {
    return this.connectRequestsService.create(req.user, connectRequestDto);
  }

  @Put(':requestId/accept')
  acceptRequest(@Param('requestId') requestId: string, @Req() req: Request) {
    return this.connectRequestsService.acceptRequest(requestId, req.user);
  }

  @Put(':requestId/cancel')
  cancelRequest(@Param('requestId') requestId: string, @Req() req: Request) {
    return this.connectRequestsService.cancelRequest(requestId, req.user);
  }

  @Put(':requestId/mark-as-succeeded')
  recognizeRequest(@Param('requestId') requestId: string, @Req() req: Request) {
    return this.connectRequestsService.recognizeRequest(requestId, req.user);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.connectRequestsService.findAll(req.user);
  }
}
