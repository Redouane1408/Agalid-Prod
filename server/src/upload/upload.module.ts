import { Module } from '@nestjs/common';
import { UploadController, FilesController } from './upload.controller';

@Module({
  controllers: [UploadController, FilesController],
})
export class UploadModule {}
