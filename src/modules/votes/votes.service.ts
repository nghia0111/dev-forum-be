import { Inject, Injectable, forwardRef, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidationErrorMessages, VoteParentTypes, VoteTypes } from 'src/common/constants';
import { Vote } from 'src/schemas/votes.schema';
import { PostsService } from '../posts/posts.service';
import { Post } from 'src/schemas/posts.schema';
import { Comment } from 'src/schemas/comments.schema';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private postService: PostsService,
  ) {}
  async create(
    postId: string,
    parentId: string,
    parentType: any,
    voteType: any,
    user: any,
  ) {
    if (!Object.values(VoteParentTypes).includes(parentType)) return;
    const existingVote = await this.voteModel.findOne({
      parent: parentId,
      parent_type: parentType,
      user: user.userId,
    });
    let voteParent = undefined;
    if(parentType === VoteParentTypes.POST) voteParent = await this.postModel.findById(parentId);
    else voteParent = await this.commentModel.findById(parentId);
    if (existingVote && voteParent) {
      if (existingVote.vote_type == voteType){
        voteParent.score -= voteType;
        await voteParent.save();
        await this.voteModel.findByIdAndDelete(existingVote._id);}
      else {
        existingVote.vote_type = 0 - existingVote.vote_type;
        voteParent.score += 2 * (0 - existingVote.vote_type);
        await voteParent.save();
        await existingVote.save();
      }
    } else {
      if(!voteParent) throw new NotFoundException(ValidationErrorMessages.POST_NOTFOUND);
      if (!Object.values(VoteTypes).includes(+voteType)) {
        return;
      }
      await this.voteModel.create({
        user: user.userId,
        parent: parentId,
        parent_type: parentType,
        vote_type: voteType,
      });
      voteParent.score += voteType;
      await voteParent.save();
    }
    return await this.postService.getPostData(postId, user.userId);
  }
}
