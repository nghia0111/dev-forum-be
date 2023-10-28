import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from 'src/schemas/tags.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidationErrorMessages } from 'src/common/constants';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}
  async create(createTagDto: CreateTagDto) {
    const { name } = createTagDto;
    const existingTag = await this.tagModel.findOne({
      name
    });
    if (existingTag) {
      throw new ConflictException(ValidationErrorMessages.TAGNAME_CONFLICT);
    }
    await this.tagModel.create({ name });
  }

  async findAll() {
    return await this.tagModel.find();
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const { name } = updateTagDto;
    const existingTag = await this.tagModel.findOne({
      name,
      _id: {$ne: id}
    });
    if (existingTag) {
      throw new ConflictException(ValidationErrorMessages.TAGNAME_CONFLICT);
    }
    await this.tagModel.findByIdAndUpdate(id, { name });
  }

  async remove(id: string) {
    await this.tagModel.findByIdAndRemove(id);
  }
}
