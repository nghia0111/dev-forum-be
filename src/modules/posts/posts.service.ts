import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from 'src/schemas/posts.schema';
import { Model } from 'mongoose';
import { Tag } from 'src/schemas/tags.schema';
import { TopicTypes, ValidationErrorMessages } from 'src/common/constants';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
  ) {}
  async create(createPostDto: CreatePostDto, user: Record<string, any>) {
    const tags = createPostDto.tags;
    for (const tagId in tags) {
      const tag = await this.tagModel.findById(tagId);
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
    const post = (await this.postModel.findById(id)).populate('tags');
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
