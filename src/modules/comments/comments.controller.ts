import {
  Controller,
  Post,
  Get,
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
import { Public } from 'src/common/decorators';

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
  markAsBestAnswer(@Param('commentId') commentId: string, @Req() req: Request) {
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

  @Public()
  @Get(':commentId/replies')
  getReplies(@Param('commentId') commentId: string, @Req() req: Request) {
    const auth = req.get('Authorization');
    return this.commentsService.getReplies(commentId, auth);
  }

  @Delete(':commentId')
  delete(@Param('commentId') commentId: string, @Req() req: Request) {
    return this.commentsService.deleteComment(commentId, req.user);
  }
}
