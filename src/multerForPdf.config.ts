import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';

export const multerForPdfOptions: MulterOptions = {
  limits: {
    fileSize: +process.env.MAX_FILE_SIZE || 5242880,
  },

  fileFilter(req, file, callback) {
    if (file.mimetype.match(/\/(pdf)$/)) {
      callback(null, true);
    } else {
      callback(
        new HttpException('Unsupported file type', HttpStatus.BAD_REQUEST),
        false,
      );
    }
  },

  storage: diskStorage({
    destination(req, file, callback) {
      const path = process.env.UPLOAD_MANUALS_DIRECTORY;

      if (!existsSync(path)) {
        mkdirSync(path);
      }

      callback(null, path);
    },
    filename(req, file, callback) {
      callback(null, generateNewFileName(file.originalname));
    },
  }),
};

function generateNewFileName(originalName: string): string {
  const ext = extname(originalName);
  const newName = `${originalName
    .toLowerCase()
    .replace(ext, '')
    .split(' ')
    .join('-')}-${Date.now()}${ext}`;
  return newName;
}
