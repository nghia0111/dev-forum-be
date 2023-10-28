// cloudinary.module.ts
import { Module } from '@nestjs/common';
import { UploadProvider } from './upload.provider';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [UploadProvider, UploadService],
  exports: [UploadProvider, UploadService],
})
export class UploadModule {}
