import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/users.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Tag, TagSchema } from 'src/schemas/tags.schema';
import { FirebaseModule } from '../firebase/firebase.module';
import { Rating, RatingSchema } from 'src/schemas/ratings.schema';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import { Post, PostSchema } from 'src/schemas/posts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Tag.name, schema: TagSchema },
      { name: Post.name, schema: PostSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
    PassportModule,
    FirebaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
