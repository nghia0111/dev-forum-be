import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingDto } from './dto/rating.dto';
import { Request } from 'express';
import { RatingValidator } from './ratings.validator';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  create(@Req() req: Request, @Body() ratingDto: RatingDto) {
    const {requestId, ...res} = ratingDto;
    const schema = RatingValidator;
    const validateResult = schema.validate(res);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.ratingsService.create(ratingDto, req.user);
  }
}
