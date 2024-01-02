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
import { ReportsService } from './reports.service';
import { Request } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('comments')
  reportComment(@Req() req: Request, @Body('commentId') commentId: string) {
    return this.reportsService.reportComment(req.user, commentId);
  }

  @Post('users')
  reportUser(
    @Req() req: Request,
    @Body('transactionId') transactionId: string,
  ) {
    return this.reportsService.reportUser(req.user, transactionId);
  }

  @Put(':reportId')
  acceptReport(@Param('reportId') reportId: string) {
    return this.reportsService.acceptReport(reportId);
  }

  @Get('comments')
  findCommentReports(@Req() req: Request) {
    return this.reportsService.findCommentReports(req.user);
  }

  @Get('users')
  findUserReports(@Req() req: Request) {
    return this.reportsService.findUserReports(req.user);
  }
}
