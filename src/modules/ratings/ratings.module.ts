import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectRequest, ConnectRequestSchema } from 'src/schemas/connect-requests.schema';
import { Rating, RatingSchema } from 'src/schemas/ratings.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: User.name, schema: UserSchema },
      { name: ConnectRequest.name, schema: ConnectRequestSchema },
    ]),
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
