import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RatingDto } from './dto/rating.dto';
import { Rating } from 'src/schemas/ratings.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConnectRequest } from 'src/schemas/connect-requests.schema';
import { User } from 'src/schemas/users.schema';
import {
  ConnectRequestStatus,
  ValidationErrorMessages,
} from 'src/common/constants';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<Rating>,
    @InjectModel(ConnectRequest.name)
    private connectRequestModel: Model<ConnectRequest>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(ratingDto: RatingDto, user: any) {
    const { requestId, description, score } = ratingDto;
    let existingRequest = undefined;
    try {
      existingRequest = await this.connectRequestModel.findById(requestId);
    } catch (err) {
      throw new NotAcceptableException(ValidationErrorMessages.ID_INVALID);
    }
    if (
      !existingRequest ||
      existingRequest.status != ConnectRequestStatus.SUCCEEDED
    )
      throw new NotFoundException(
        ValidationErrorMessages.REQUEST_STATUS_INVALID,
      );
    if (existingRequest.receiver.toString() != user.userId)
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);
    const existingRating = await this.ratingModel.findOne({
      reviewer: user.userId,
      reviewee: existingRequest.requester,
      request: requestId,
    });
    if(existingRating) return;
    await this.ratingModel.create({
      reviewer: user.userId,
      reviewee: existingRequest.requester,
      request: requestId,
      description,
      score
    });
    existingRequest.ratingScore = score;
    existingRequest.ratingDescription = description;
    await existingRequest.save();
  }
}
