// upload.service.ts

import { Injectable, PayloadTooLargeException, UnsupportedMediaTypeException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from '../../common/types';
import { ValidationErrorMessages } from 'src/common/constants';
const streamifier = require('streamifier');

@Injectable()
export class UploadService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    if (file.size > 10 * 1024 * 1024) {
      throw new PayloadTooLargeException(ValidationErrorMessages.FILE_SIZE);
    }
    if (!file.mimetype.startsWith('image')) {
      throw new UnsupportedMediaTypeException(ValidationErrorMessages.FILE_INVALID);
    }
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
            folder: "dev-forum",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
