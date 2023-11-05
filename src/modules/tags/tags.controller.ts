import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post
} from '@nestjs/common';
import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @HttpCode(201)
  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    const schema = Joi.object({
      name: Joi.string().required().messages({
        'any.required': ValidationErrorMessages.TAGNAME_REQUIRE,
        'string.empty': ValidationErrorMessages.TAGNAME_REQUIRE,
      })
    });

    const validateResult = schema.validate(createTagDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    await this.tagsService.create(createTagDto);
  }

  @Get()
  async findAll() {
    await this.tagsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
