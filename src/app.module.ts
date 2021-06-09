import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { ReadModule } from './read/read.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [UploadModule, ReadModule, ConfigModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.getMongoConfig(),
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
