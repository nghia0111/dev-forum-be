import { Module } from '@nestjs/common';
import { AgoraService } from './agora.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AgoraService],
  exports: [AgoraService],
})
export class AgoraModule {}
