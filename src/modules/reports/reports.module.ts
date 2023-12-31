import { Module } from '@nestjs/common';
import {  ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { User, UserSchema } from 'src/schemas/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from 'src/schemas/reports.schema';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transactions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
