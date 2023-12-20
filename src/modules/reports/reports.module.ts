import { Module } from '@nestjs/common';
import {  ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { User, UserSchema } from 'src/schemas/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from 'src/schemas/reports.schema';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
