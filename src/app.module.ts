import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { ReadModule } from './read/read.module';

@Module({
  imports: [UploadModule, ReadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
