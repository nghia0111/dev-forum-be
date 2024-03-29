import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidationErrorMessages, VoteParentTypes, VoteTypes } from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';
import { Post } from 'src/schemas/posts.schema';
import { Vote } from 'src/schemas/votes.schema';
import { PostsService } from '../posts/posts.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly socketGateway: SocketGateway,
    private postService: PostsService,
  ) {}
  async create(
    postId: string,
    parentId: string,
    parentType: any,
    voteType: number,
    user: any,
  ) {
    if (!Object.values(VoteParentTypes).includes(parentType)) return;
    const existingVote = await this.voteModel.findOne({
      parent: parentId,
      parentType: parentType,
      user: user.userId,
    });
    let voteParent = undefined;
    if (parentType === VoteParentTypes.POST)
      voteParent = await this.postModel.findById(parentId);
    else
      voteParent = await this.commentModel
        .findById(parentId)
        .populate('author', 'displayName avatar');

    let vote = voteType;
    if (existingVote && voteParent) {
      if (existingVote.voteType == voteType) {
        voteParent.score -= voteType;
        await voteParent.save();
        vote = 0;
        await this.voteModel.findByIdAndDelete(existingVote._id);
      } else {
        existingVote.voteType = 0 - existingVote.voteType;
        voteParent.score += 2 * existingVote.voteType;
        await voteParent.save();
        await existingVote.save();
      }
    } else {
      if (!voteParent)
        throw new NotFoundException(ValidationErrorMessages.POST_NOT_FOUND);
      if (!Object.values(VoteTypes).includes(voteType)) {
        return;
      }
      await this.voteModel.create({
        user: user.userId,
        parent: parentId,
        parentType: parentType,
        voteType: voteType,
      });
      voteParent.score += voteType;
      await voteParent.save();
    }

    const postData = await this.postService.getPostData(postId.toString());
    this.socketGateway.server
      .to(postId)
      .emit('updatePost', postData);
  }
}
