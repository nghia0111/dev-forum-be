import {
  Controller,
  Post,
  Param,
  Query,
  Req,
  Body,
  BadRequestException,
  Delete,
  Put,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';
import { CommentDto } from './dto/comment.dto';
import { CommentValidator } from './comments.validator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId')
  create(
    @Param('postId') postId: string,
    @Query('parent') parent: string,
    @Body() commentDto: CommentDto,
    @Req() req: Request,
  ) {
    const schema = CommentValidator;
    const validateResult = schema.validate({
      description: commentDto.description,
    });
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.commentsService.create(postId, commentDto, req.user, parent);
  }

  @Post('/mark-as-best/:commentId')
  markAsBestAnswer(
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ) {
    return this.commentsService.markAsBest(commentId, req.user);
  }

  @Put(':commentId')
  update(
    @Param('commentId') commentId: string,
    @Body() commentDto: CommentDto,
    @Req() req: Request,
  ) {
    const schema = CommentValidator;
    const validateResult = schema.validate({
      description: commentDto.description,
    });
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.commentsService.updateComment(commentId, commentDto, req.user);
  }

  @Delete(':commentId')
  delete(@Param('commentId') commentId: string, @Req() req: Request) {
    return this.commentsService.deleteComment(commentId, req.user);
  }
}
