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

  @Post()
  create(@Req() req: Request, @Body('commentId') commentId: string) {
    return this.reportsService.create(req.user, commentId);
  }

  @Put(':reportId')
  acceptReport(@Param('reportId') reportId: string) {
    return this.reportsService.acceptReport(reportId);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.reportsService.findAll(req.user);
  }
}
