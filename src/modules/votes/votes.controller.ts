import { Controller, Post, Param, Query, Req } from '@nestjs/common';
import { VotesService } from './votes.service';
import { Request } from 'express';
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post(':postId/:parentId')
  create(
    @Param('postId') postId: string,
    @Param('parentId') parentId: string,
    @Query('voteType') voteType: number,
    @Query('parent') parent: string,
    @Req() req: Request,
  ) {
    return this.votesService.create(postId, parentId, parent, +voteType, req.user);
  }
}
