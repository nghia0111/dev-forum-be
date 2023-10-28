import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import * as Joi from 'joi'
import { ValidationErrorMessages } from 'src/common/constants';
import { Request } from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    const schema = Joi.object({
      title: Joi.string().required().messages({
        'any.required': ValidationErrorMessages.TITLE_REQUIRE,
        'string.empty': ValidationErrorMessages.TITLE_REQUIRE,
      }),
      description: Joi.string().required().messages({
        'any.required': ValidationErrorMessages.DESCRIPTION_REQUIRE,
        'string.empty': ValidationErrorMessages.DESCRIPTION_REQUIRE,
      }),
      bounty: Joi.number().optional()
        .messages({
          'string.email': ValidationErrorMessages.EMAIL_INVALID,
          'any.required': ValidationErrorMessages.EMAIL_REQUIRE,
          'string.empty': ValidationErrorMessages.EMAIL_REQUIRE,
        }),
    });

    const validateResult = schema.validate(createPostDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    this.postsService.create(createPostDto, req.user);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
