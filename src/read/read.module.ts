import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from 'src/config/config.module';
import { HeartRateRepository } from 'src/repository/heart-rate.repository';
import { HeartRateSchema } from 'src/schema/heart-rate.schema';
import { ReadController } from './read.controller';
import { ReadService } from './read.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'HeartRate', schema: HeartRateSchema }]), ConfigModule],
  controllers: [ReadController],
  providers: [ReadService, HeartRateRepository],
  exports: [ReadService, HeartRateRepository]
})
export class ReadModule { }
