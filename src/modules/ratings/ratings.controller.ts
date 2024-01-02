import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RatingDto } from './dto/rating.dto';
import { RatingsService } from './ratings.service';
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
