import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TagDto } from './dto/tag.dto';
import { Tag } from 'src/schemas/tags.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidationErrorMessages } from 'src/common/constants';
import { Post } from 'src/schemas/posts.schema';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}
  async create(createTagDto: TagDto) {
    const { name } = createTagDto;
    const existingTag = await this.tagModel.findOne({
      name,
    });
    if (existingTag) {
      throw new ConflictException(ValidationErrorMessages.TAGNAME_CONFLICT);
    }
    await this.tagModel.create({ name });
  }

  async findAll() {
    return await this.tagModel.find();
  }

  async update(id: string, updateTagDto: TagDto) {
    const { name } = updateTagDto;
    const existingTag = await this.tagModel.findById(id);
    if (!existingTag) {
      throw new NotFoundException(ValidationErrorMessages.TAG_NOT_FOUND);
    }
    const conflictTag = await this.tagModel.findOne({
      name,
      _id: { $ne: id },
    });
    if (conflictTag) {
      throw new ConflictException(ValidationErrorMessages.TAGNAME_CONFLICT);
    }
    await this.tagModel.findByIdAndUpdate(id, { name });
  }

  async remove(id: string) {
    const existingTag = await this.tagModel.findById(id);
    if (!existingTag) {
      throw new NotFoundException(ValidationErrorMessages.TAG_NOT_FOUND);
    }
    const allPosts = await this.postModel.find();
    const posts = allPosts.filter((post) => post.tags.includes(id));
    for (let i = 0; i < posts.length; i++) {
      posts[i].tags.pull(id);
      await posts[i].save();
    }
    await this.tagModel.findByIdAndRemove(id);
  }
}
