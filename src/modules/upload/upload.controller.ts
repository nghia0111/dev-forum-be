// app.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles, HttpCode } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @HttpCode(200)
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file);
  }

  @HttpCode(200)
  @Post('images')
  @UseInterceptors(FilesInterceptor('file[]', 3))
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    
  }
}
