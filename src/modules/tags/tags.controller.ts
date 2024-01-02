import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';
import { Public } from 'src/common/decorators';
import { TagDto } from './dto/tag.dto';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Body() createTagDto: TagDto) {
    const schema = Joi.object({
      name: Joi.string().required().messages({
        'any.required': ValidationErrorMessages.TAGNAME_REQUIRE,
        'string.empty': ValidationErrorMessages.TAGNAME_REQUIRE,
      }),
    });

    const validateResult = schema.validate(createTagDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    await this.tagsService.create(createTagDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTagDto: TagDto) {
    const schema = Joi.object({
      name: Joi.string().required().messages({
        'any.required': ValidationErrorMessages.TAGNAME_REQUIRE,
        'string.empty': ValidationErrorMessages.TAGNAME_REQUIRE,
      }),
    });

    const validateResult = schema.validate(updateTagDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    await this.tagsService.update(id, updateTagDto);
  }

  @Public()
  @Get()
  async findAll() {
    return await this.tagsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
