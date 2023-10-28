import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersModule } from './modules/users/users.module';
// import { PostsModule } from './modules/posts/posts.module';
// import { CommentsModule } from './modules/comments/comments.module';
// import { TagsModule } from './modules/tags/tags.module';
// import { VotesModule } from './modules/votes/votes.module';
// import { TransactionsModule } from './modules/transactions/transactions.module';
// import { RatingsModule } from './modules/ratings/ratings.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { UploadModule } from './modules/upload/upload.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [
    // CommentsModule,
    // UsersModule,
    // PostsModule,
    // TagsModule,
    // VotesModule,
    // TransactionsModule,
    // RatingsModule,
    AuthModule,
    UploadModule,
    PostsModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ff8zaru.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
    ),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
