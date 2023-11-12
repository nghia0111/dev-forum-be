import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from 'src/schemas/posts.schema';
import { Model } from 'mongoose';
import { Tag } from 'src/schemas/tags.schema';
import { TopicTypes, ValidationErrorMessages } from 'src/common/constants';
import { Transaction } from 'src/schemas/transactions.schema';
import { Answer } from 'src/schemas/answers.schema';
import { Comment } from 'src/schemas/comments.schema';
import { CommentDto } from '../comments/dto/comment.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Answer.name) private answerModel: Model<Answer>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}
  async create(createPostDto: PostDto, user: Record<string, any>) {
    if (createPostDto.bounty && createPostDto.topic !== TopicTypes.BUG)
      throw new NotAcceptableException(
        ValidationErrorMessages.BOUNTY_NOT_ACCEPTABLE,
      );
    const tags = createPostDto.tags;
    for (let i = 0; i < tags.length; i++) {
      const tag = await this.tagModel.findById(tags[i]);
      if (!tag)
        throw new NotFoundException(ValidationErrorMessages.TAG_NOTFOUND);
    }
    await this.postModel.create({ author: user.userId, ...createPostDto });
    return await this.postModel.find({ author: user.userId }).populate('tags');
  }

  async findPosts(params: any, user: Record<string, any>) {
    const { isMyPosts, filter, isBountied, sort, topic, search } = params;
    let posts = await this.postModel.find();
    if (isMyPosts === 'true') {
      posts = posts.filter((post) => post.author == user.userId);
    }
    if (filter === 'answered') {
      posts = posts.filter((post) => post.isAnswered);
    } else if (filter === 'notAnswered') {
      posts = posts.filter((post) => !post.isAnswered);
    }
    if (isBountied === 'true') {
      posts = posts.filter((post) => post.bounty);
    }
    if (sort === 'oldest') {
      posts = posts.sort((a, b) => {
        if (a.createdAt < b.createdAt) return 1;
        return -1;
      });
    } else {
      posts = posts.sort((a, b) => {
        if (a.createdAt > b.createdAt) return 1;
        return -1;
      });
    }
    if (Object.values(TopicTypes).includes(topic)) {
      posts = posts.filter((post) => post.topic === topic);
    }
    if (search) {
      const searchArr = search.toLowerCase().split(' ');
      posts = posts.filter((post) =>
        searchArr.every((word) => post.title.toLowerCase().includes(word)),
      );
    }
    return posts;
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).populate('tags');
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOTFOUND);
    post.views += 1;
    await post.save();
    return post;
  }

  async update(user, id: string, updatePostDto: PostDto) {
    if (updatePostDto.bounty && updatePostDto.topic !== TopicTypes.BUG)
      throw new NotAcceptableException(
        ValidationErrorMessages.BOUNTY_NOT_ACCEPTABLE,
      );
    const tags = updatePostDto.tags;
    console.log(tags);
    for (let i = 0; i < tags.length; i++) {
      const tag = await this.tagModel.findById(tags[i]);
      if (!tag)
        throw new NotFoundException(ValidationErrorMessages.TAG_NOTFOUND);
    }
    const post = await this.postModel.findById(id);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOTFOUND);
    if (post.author != user.userId)
      throw new UnauthorizedException(
        ValidationErrorMessages.UPDATE_UNAUTHORIZATION,
      );
    post.title = updatePostDto.title;
    post.description = updatePostDto.description;
    post.tags = updatePostDto.tags;
    post.bounty = updatePostDto.bounty;
    post.topic = updatePostDto.topic;
    await post.save();
    return;
  }

  async remove(id: string) {
    const post = await this.postModel.findById(id);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOTFOUND);
    const existingTransaction = await this.transactionModel.findOne({
      post: id,
    });
    if (existingTransaction)
      throw new NotAcceptableException(
        ValidationErrorMessages.POST_DELETE_CONFLICT,
      );
    await this.answerModel.deleteMany({ parent: id });
    await this.commentModel.deleteMany({ parent: id });
    await this.postModel.findByIdAndDelete(id);
    return;
  }

  async createComment(postId: string, createCommentDto: CommentDto, user: any) {
    const post = await this.postModel.findById(postId);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOTFOUND);
    return;
  }
}
