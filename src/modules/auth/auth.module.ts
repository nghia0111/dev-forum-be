import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Comment, CommentSchema } from 'src/schemas/comments.schema';
import { Post, PostSchema } from 'src/schemas/posts.schema';
import { Rating, RatingSchema } from 'src/schemas/ratings.schema';
import { Tag, TagSchema } from 'src/schemas/tags.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { FirebaseModule } from '../firebase/firebase.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

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
