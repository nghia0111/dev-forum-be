import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  BadRequestException,
  Req,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostDto } from './dto/posts.dto';
import { PostValidator } from './posts.validator';
import { Request } from 'express';
import { Public } from 'src/common/decorators';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: PostDto, @Req() req: Request) {
    const schema = PostValidator;
    const validateResult = schema.validate(createPostDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    this.postsService.create(createPostDto, req.user);
  }

  @Public()
  @Get()
  findPosts(@Query() params: any, @Req() req: Request) {
    return this.postsService.findPosts(params, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updatePostDto: PostDto) {
    const schema = PostValidator;
    const validateResult = schema.validate(updatePostDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.postsService.update(req.user, id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
