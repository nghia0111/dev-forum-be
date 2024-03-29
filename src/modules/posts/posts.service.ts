import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import {
  TopicTypes,
  TransactionStatus,
  ValidationErrorMessages,
  VoteParentTypes,
} from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';
import { Notification } from 'src/schemas/notifications.schema';
import { Post } from 'src/schemas/posts.schema';
import { Tag } from 'src/schemas/tags.schema';
import { Transaction } from 'src/schemas/transactions.schema';
import { User } from 'src/schemas/users.schema';
import { Vote } from 'src/schemas/votes.schema';
import { PostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}
  async create(createPostDto: PostDto, user: Record<string, any>) {
    const _user = await this.userModel.findById(user.userId);
    const tags = createPostDto.tags;
    for (let i = 0; i < tags.length; i++) {
      const tag = await this.tagModel.findById(tags[i]);
      if (!tag)
        throw new NotFoundException(ValidationErrorMessages.TAG_NOT_FOUND);
    }
    if (createPostDto.bounty) {
      if (createPostDto.bounty > _user.balance) {
        throw new NotAcceptableException(ValidationErrorMessages.BOUNTY_MAX);
      }
      _user.balance -= createPostDto.bounty;
      await _user.save();
    }
    await this.postModel.create({ author: user.userId, ...createPostDto });
    return await this.postModel.find({ author: user.userId }).populate('tags');
  }

  async findPosts(params: any, auth?: string) {
    const { isMyPosts, filter, isBountied, sort, topic, tag, search } = params;
    let posts = await this.postModel
      .find()
      .populate('tags')
      .populate('author', 'avatar displayName')
      .lean();

    let decoded = undefined;
    let currentUser = undefined;
    if (auth) {
      const token = auth.split(' ')[1];
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        decoded = undefined;
      }
    }

    if (decoded) currentUser = await this.userModel.findById(decoded.sub);
    if (isMyPosts === 'true') {
      if (!currentUser) throw new UnauthorizedException();
      posts = posts.filter((post) => {
        return (
          (post.author as unknown as { _id: string })._id.toString() ==
          decoded.sub
        );
      });
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
    if (tag) {
      const _tag = await this.tagModel.findOne({ name: tag });
      if (!_tag)
        throw new NotFoundException(ValidationErrorMessages.TAG_NOT_FOUND);
      posts = posts.filter((post) => {
        const tagIds = post.tags.map((tag) => tag._id.toString());
        return tagIds.includes(_tag._id.toString());
      });
    }
    if (search) {
      const searchArr = search.toLowerCase().split(' ');
      posts = posts.filter((post) =>
        searchArr.every((word) => post.title.toLowerCase().includes(word)),
      );
    }
    const newPosts = await Promise.all(
      posts.map(async (post) => {
        const answerCount = await this.commentModel.countDocuments({
          post: post._id,
        });
        const newPost = {
          ...post,
          answerCount,
          isSaved: currentUser
            ? currentUser.savedPosts.includes(post._id.toString())
            : false,
        };
        return newPost;
      }),
    );
    return newPosts;
  }

  async findOne(slug: string, auth?: string) {
    const post = await this.postModel.findOne({ slug: slug });
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOT_FOUND);
    post.views += 1;
    await post.save();
    let userId = undefined;
    if (auth) {
      const token = auth.split(' ')[1];
      let decoded;
      if (token) {
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded) userId = decoded.sub;
          await this.notificationModel.updateMany(
            { receiver: userId, hasSeen: false, 'extraData.postSlug': slug },
            { hasSeen: true },
          );
        } catch (err) {}
      }
    }
    return await this.getPostData(post._id, userId);
  }

  async update(user: any, id: string, updatePostDto: PostDto) {
    const tags = updatePostDto.tags;
    for (let i = 0; i < tags.length; i++) {
      const tag = await this.tagModel.findById(tags[i]);
      if (!tag)
        throw new NotFoundException(ValidationErrorMessages.TAG_NOT_FOUND);
    }
    const post = await this.postModel.findById(id);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOT_FOUND);
    if (post.author != user.userId)
      throw new UnauthorizedException(
        ValidationErrorMessages.UPDATE_UNAUTHORIZATION,
      );
    const existingTransaction = await this.transactionModel.findOne({
      post: id,
      status: { $ne: TransactionStatus.CANCELED },
    });
    if (existingTransaction)
      throw new NotAcceptableException(
        ValidationErrorMessages.POST_UPDATE_CONFLICT,
      );
    const _user = await this.userModel.findById(user.userId);
    if (updatePostDto.bounty) {
      if (
        updatePostDto.bounty >
        _user.balance + (post.bounty ? post.bounty : 0)
      ) {
        throw new NotAcceptableException(ValidationErrorMessages.BOUNTY_MAX);
      }
      _user.balance =
        _user.balance + (post.bounty ? post.bounty : 0) - updatePostDto.bounty;
      await _user.save();
    }
    post.title = updatePostDto.title;
    post.description = updatePostDto.description;
    post.tags = updatePostDto.tags;
    post.bounty = updatePostDto.bounty;
    post.topic = updatePostDto.topic;
    await post.save();
    return;
  }

  async remove(id: string, user: any) {
    const post = await this.postModel.findById(id);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOT_FOUND);
    const existingTransaction = await this.transactionModel.findOne({
      post: id
    });
    if (existingTransaction)
      throw new NotAcceptableException(
        ValidationErrorMessages.POST_DELETE_CONFLICT,
      );
    if (post.author != user.userId)
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);
    const _user = await this.userModel.findById(user.userId);
    if (post.bounty) {
      _user.balance = _user.balance + post.bounty;
      await _user.save();
    }
    await this.commentModel.deleteMany({ post: id });
    await this.postModel.findByIdAndDelete(id);
    return;
  }

  async getPostData(postId: string, userId?: string) {
    // Use Promise.all to parallelize population and vote retrieval
    const [post, comments] = await Promise.all([
      this.postModel
        .findById(postId)
        .populate('tags', 'name')
        .populate('author', 'displayName avatar')
        .lean(),
      this.commentModel
        .find({ post: postId, parent: undefined })
        .sort('score')
        .select('description author score isAccepted createdAt')
        .populate('author', 'displayName avatar')
        .lean(),
    ]);

    let currentUser = undefined;
    if (userId) {
      currentUser = await this.userModel.findById(userId);
    }

    // Combine the results
    const newPost = {
      ...post,
      isSaved: currentUser ? currentUser.savedPosts.includes(postId) : false,
      vote: await this.getVoteType(post._id, VoteParentTypes.POST, userId),
    };

    const postAnswers = await Promise.all(
      comments.map(async (comment) => {
        return {
          ...comment,
          vote: await this.getVoteType(
            comment._id,
            VoteParentTypes.COMMENT,
            userId,
          ),
          replies: await this.commentModel.countDocuments({
            parent: comment._id,
          }),
        };
      }),
    );

    return { post: newPost, comments: postAnswers };
  }

  async getVoteType(
    parentId: string,
    parentType: VoteParentTypes,
    userId?: string,
  ) {
    const vote = await this.voteModel.findOne({
      parent: parentId,
      parentType: parentType,
      user: userId,
    });
    if (vote) return +vote.voteType;
    return 0;
  }

  async getSavedPosts(user: any) {
    const existingUser = await this.userModel.findById(user.userId);
    if (!existingUser)
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHENTICATED);
    const posts = await this.postModel
      .find({ _id: { $in: existingUser.savedPosts } })
      .populate('tags')
      .populate('author', 'displayName avatar')
      .lean();
    const newPosts = await Promise.all(
      posts.map(async (post) => {
        const answerCount = await this.commentModel.countDocuments({
          post: post._id,
        });
        const newPost = {
          ...post,
          isSaved: true,
          answerCount,
        };
        return newPost;
      }),
    );
    return newPosts;
  }

  async savePost(user: any, postId: string) {
    const existingUser = await this.userModel.findById(user.userId);
    if (!existingUser)
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHENTICATED);
    const post = await this.postModel.findById(postId);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOT_FOUND);
    if (existingUser.savedPosts.includes(postId))
      existingUser.savedPosts.pull(postId);
    else existingUser.savedPosts.push(postId);
    await existingUser.save();
  }
}
