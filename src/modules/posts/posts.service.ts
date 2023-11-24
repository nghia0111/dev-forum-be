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
import {
  TopicTypes,
  ValidationErrorMessages,
  VoteTypes,
} from 'src/common/constants';
import { Transaction } from 'src/schemas/transactions.schema';
import { Comment } from 'src/schemas/comments.schema';
import { CommentDto } from '../comments/dto/comment.dto';
import { Vote } from 'src/schemas/votes.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
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
    let posts = await this.postModel.find().populate('tags').populate('author', 'avatar displayName');
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
    const post = await this.postModel.findById(id);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOTFOUND);
    post.views += 1;
    await post.save();
    return await this.getPostData(id);
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
    await this.commentModel.deleteMany({ post: id });
    await this.postModel.findByIdAndDelete(id);
    return;
  }

  async getPostData(postId: string) {
    const post = await this.postModel
      .findById(postId)
      .populate('tags')
      .populate('author', 'displayName avatar');
    const comments = await this.commentModel
      .find({ post: postId })
      .sort('score')
      .select('description author')
      .populate('author', 'displayName avatar').lean();
    const postAnswers = [];
    for (let i = 0; i < comments.length; i++) {
      const replies = await this.commentModel
        .find({ parent: comments[i]._id })
        .sort('createdAt')
        .select('description author')
        .populate('author', 'displayName avatar');
      
      const newComment = { ...comments[i], replies: replies };
      postAnswers.push(newComment);
    }
    return { post: post, comments: postAnswers };
  }
}
