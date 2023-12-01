import {
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import {
  TopicTypes,
  ValidationErrorMessages,
  VoteParentTypes,
  VoteTypes,
} from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';
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
  ) {}
  async create(createPostDto: PostDto, user: Record<string, any>) {
    const tags = createPostDto.tags;
    for (let i = 0; i < tags.length; i++) {
      const tag = await this.tagModel.findById(tags[i]);
      if (!tag)
        throw new NotFoundException(ValidationErrorMessages.TAG_NOT_FOUND);
    }
    await this.postModel.create({ author: user.userId, ...createPostDto });
    return await this.postModel.find({ author: user.userId }).populate('tags');
  }

  async findPosts(params: any, auth?: string) {
    const { isMyPosts, filter, isBountied, sort, topic, search } = params;
    let posts = await this.postModel
      .find()
      .populate('tags')
      .populate('author', 'avatar displayName')
      .lean();
    if (isMyPosts === 'true') {
      if (!auth) throw new UnauthorizedException();
      const token = auth.split(' ')[1];
      let decoded;
      if (token) {
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (!decoded) throw new UnauthorizedException();
        } catch (err) {
          throw new UnauthorizedException();
        }
      } else {
        throw new UnauthorizedException();
      }
      posts = await Promise.all(
        posts.map(async (post) => {
          const existingUser = await this.userModel.findById(decoded.sub);
          const newPost = {
            ...post,
            isSaved: existingUser.savedPosts.includes(post._id),
          };
          return newPost;
        }),
      );
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
        } catch (err) {
        }
      } else {
        throw new UnauthorizedException();
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
      throw new NotFoundException(ValidationErrorMessages.POST_NOT_FOUND);
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

  async getPostData(postId: string, userId?: string) {
    // Use Promise.all to parallelize population and vote retrieval
    const [post, comments] = await Promise.all([
      this.postModel
        .findById(postId)
        .populate('tags', 'name')
        .populate('author', 'displayName avatar')
        .lean(),
      this.commentModel
        .find({ post: postId })
        .sort('score')
        .select('description author score isAccepted createdAt')
        .populate('author', 'displayName avatar')
        .lean(),
    ]);

    // Use Promise.all for parallelizing vote retrieval for post and comments
    const [postVote] = await Promise.all([
      this.getVoteType(post._id, VoteParentTypes.POST, userId),
      // Parallelize vote retrieval for comments
      Promise.all(
        comments.map(async (comment) => ({
          ...comment,
          vote: await this.getVoteType(
            comment._id,
            VoteParentTypes.COMMENT,
            userId,
          ),
        })),
      ),
    ]);

    // Combine the results
    const newPost = {
      ...post,
      vote: postVote,
    };

    const postAnswers = await Promise.all(
      comments.map(async (comment) => {
        // Parallelize the retrieval of replies and their votes
        const _replies = await this.commentModel
          .find({ parent: comment._id })
          .sort('createdAt')
          .select('description author')
          .populate('author', 'displayName avatar')
          .lean();

        const replies = await Promise.all(
          _replies.map(async (reply) => ({
            ...reply,
            vote: await this.getVoteType(
              reply._id,
              VoteParentTypes.COMMENT,
              userId,
            ),
          })),
        );

        return {
          ...comment,
          vote: await this.getVoteType(
            comment._id,
            VoteParentTypes.COMMENT,
            userId,
          ),
          replies: replies,
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
    if (vote) return vote.voteType;
    return 0;
  }

  async getMyPosts(user: any){
    return await this.postModel.find({author: user.userId}).populate('tags');
  }
}
