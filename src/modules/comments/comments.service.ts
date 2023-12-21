import {
  Inject,
  Injectable,
  forwardRef,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotificationTypes,
  ValidationErrorMessages,
  VoteParentTypes,
  VoteTypes,
} from 'src/common/constants';
import { Vote } from 'src/schemas/votes.schema';
import { PostsService } from '../posts/posts.service';
import { Post } from 'src/schemas/posts.schema';
import { Comment } from 'src/schemas/comments.schema';
import { User } from 'src/schemas/users.schema';
import { CommentDto } from './dto/comment.dto';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly socketGateway: SocketGateway,
    private postService: PostsService,
  ) {}
  async create(
    postId: string,
    commentDto: CommentDto,
    user: any,
    parent?: string,
  ) {
    let receiverId, notiType, postSlug;
    if (parent) {
      const parentComment = await this.commentModel.findById(parent);
      if (!parentComment)
        throw new NotFoundException(ValidationErrorMessages.COMMENT_NOT_FOUND);
      receiverId = parentComment.author;
      notiType = NotificationTypes.REPLY;
    } else {
      const post = await this.postModel.findById(postId);
      if (!post)
        throw new NotFoundException(ValidationErrorMessages.POST_NOT_FOUND);
      receiverId = post.author;
      postSlug = post.slug;
      notiType = NotificationTypes.COMMENT;
    }
    const comment = await this.commentModel.create({
      parent: parent,
      post: postId,
      author: user.userId,
      description: commentDto.description,
    });
    const postData = await this.postService.getPostData(postId);
    this.socketGateway.server.to(postId).emit('updatePost', postData);

    const notiData = { commentId: comment._id.toString(), postSlug: postSlug };
    await this.socketGateway.createNotification(
      user.userId,
      receiverId,
      notiType,
      notiData,
    );

    return postData;
  }

  async updateComment(commentId: string, commentDto: CommentDto, user: any) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment)
      throw new NotFoundException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    if (user.userId != comment.author.toString())
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);
    comment.description = commentDto.description;
    await comment.save();
    const postData = await this.postService.getPostData(comment.post);
    this.socketGateway.server
      .to(comment.post.toString())
      .emit('updatePost', postData);

    return postData;
  }

  async deleteComment(commentId: string, user: any) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment)
      throw new NotFoundException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    const postId = comment.post;
    if (user.userId != comment.author.toString())
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);
    await this.commentModel.deleteMany({ parent: comment._id.toString() });
    await this.commentModel.findByIdAndDelete(commentId);
    const postData = await this.postService.getPostData(postId);
    this.socketGateway.server
      .to(postId.toString())
      .emit('updatePost', postData);

    return postData;
  }

  async markAsBest(commentId: string, user: any) {
    const comment = await this.commentModel.findById(commentId);
    const post = await this.postModel.findById(comment.post);
    if (!comment)
      throw new NotFoundException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOT_FOUND);
    if (user.userId != post.author.toString())
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);
    comment.isAccepted = true;
    await comment.save();
    post.isAnswered = true;
    await post.save();
    return;
  }
}