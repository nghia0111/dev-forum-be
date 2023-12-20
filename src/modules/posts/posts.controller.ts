import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/common/decorators';
import { PostDto } from './dto/post.dto';
import { PostsService } from './posts.service';
import { PostValidator } from './posts.validator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: PostDto, @Req() req: Request) {
    const schema = PostValidator;
    const validateResult = schema.validate(createPostDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.postsService.create(createPostDto, req.user);
  }

  @Public()
  @Get()
  findPosts(@Query() params: any, @Req() req: Request) {
    const auth = req.get('Authorization');
    return this.postsService.findPosts(params, auth);
  }

  @Public()
  @Get('saved-posts')
  getSavedPosts(@Req() req: Request) {
    return this.postsService.getSavedPosts(req.user);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string, @Req() req: Request) {
    const auth = req.get('Authorization');
    return this.postsService.findOne(slug, auth);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePostDto: PostDto,
  ) {
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
