import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole, ValidationErrorMessages } from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';
import { Report } from 'src/schemas/reports.schema';
import { User } from 'src/schemas/users.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(user: any, commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment)
      throw new NotFoundException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    await this.reportModel.create({
      accuser: user.userId,
      comment: commentId,
      post: comment.post.toString(),
    });
  }

  async findAll(user: any) {
    const _user = await this.userModel.findById(user.userId);
    if(!_user || _user.role != UserRole.ADMIN) throw new UnauthorizedException(ValidationErrorMessages.ADMIN_REQUIRED)
    return await this.reportModel
      .find()
      .sort('-createdAt')
      .populate('accuser', 'displayName avatar')
      .populate('comment', 'description');
  }
}
