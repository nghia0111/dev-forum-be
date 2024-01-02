import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReportTypes,
  TransactionStatus,
  UserRole,
  ValidationErrorMessages,
} from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';
import { Report } from 'src/schemas/reports.schema';
import { Transaction } from 'src/schemas/transactions.schema';
import { User } from 'src/schemas/users.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async reportComment(user: any, commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment)
      throw new NotFoundException(ValidationErrorMessages.COMMENT_NOT_FOUND);

    const existingReport = await this.reportModel.findOne({
      comment: commentId,
    });
    if (!existingReport && user.userId != comment.author.toString()) {
      await this.reportModel.create({
        accuser: user.userId,
        comment: commentId,
        description: comment.description,
        post: comment.post.toString(),
        type: ReportTypes.COMMENT,
      });
    }
  }

  async reportUser(user: any, transactionId: string) {
    const transaction = await this.transactionModel
      .findById(transactionId)
      .populate('post', 'author');
    if (!transaction)
      throw new NotFoundException(
        ValidationErrorMessages.TRANSACTION_NOT_FOUND,
      );
    if (transaction.status == TransactionStatus.SUCCEEDED)
      throw new NotAcceptableException(
        ValidationErrorMessages.TRANSACTION_STATUS_INVALID,
      );

    const existingReport = await this.reportModel.findOne({
      accuser: user.userId,
      accused: transaction.post.author,
      post: transaction.post ? transaction.post._id.toString() : undefined,
    });
    if (
      !existingReport &&
      transaction.post &&
      user.userId != transaction.post.author.toString()
    ) {
      await this.reportModel.create({
        accuser: user.userId,
        accused: transaction.post.author,
        transaction: transaction._id.toString(),
        type: ReportTypes.USER,
      });
      transaction.isReported = true;
      await transaction.save();
    }
  }

  async acceptReport(reportId: string) {
    const report = await this.reportModel.findById(reportId);
    if (!report)
      throw new NotFoundException(ValidationErrorMessages.REPORT_NOT_FOUND);

    if (report.type == ReportTypes.USER) {
      const accuser = await this.userModel.findById(report.accuser);
      const transaction = await this.transactionModel.findById(
        report.transaction,
      );
      accuser.balance += transaction.amount;
      await accuser.save();
      transaction.status = TransactionStatus.SUCCEEDED;
      await transaction.save();
      await this.transactionModel.findOneAndUpdate(
        {
          user: report.accused,
          receiver: report.accuser,
          post: transaction.post,
        },
        { status: TransactionStatus.SUCCEEDED },
      );
    }
    report.isReviewed = true;
    await report.save();
  }

  async findCommentReports(user: any) {
    const _user = await this.userModel.findById(user.userId);
    if (!_user || _user.role != UserRole.ADMIN)
      throw new UnauthorizedException(ValidationErrorMessages.ADMIN_REQUIRED);
    return await this.reportModel
      .find({ type: ReportTypes.COMMENT })
      .sort('-createdAt')
      .populate('accuser', 'displayName avatar');
  }

  async findUserReports(user: any) {
    const _user = await this.userModel.findById(user.userId);
    if (!_user || _user.role != UserRole.ADMIN)
      throw new UnauthorizedException(ValidationErrorMessages.ADMIN_REQUIRED);
    return await this.reportModel
      .find({ type: ReportTypes.USER })
      .sort('-createdAt')
      .populate('accuser', 'displayName avatar')
      .populate('accused', 'displayName');
  }
}
