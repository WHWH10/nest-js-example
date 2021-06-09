import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReadService } from './read.service';
import { Schema as MongooseSchema } from 'mongoose';

@Controller('read')
export class ReadController {
  constructor(private readService: ReadService) { }

  // 파일 전체 목록 불러오기
  @Get()
  async getAllFieList(): Promise<any> {
    return await this.readService.getAllFileList();
  }

  @Get('/File')
  async getFile(@Query('fileName') fileName: string): Promise<any> {
    return await this.readService.getReadFile(fileName);
  }

  @Get('/FolderList')
  async getFolderList(): Promise<any> {
    return await this.readService.getFolderList();
  }

  @Get('/FolderList/:labNum')
  async getEachFolderList(@Param('labNum') labNum: string): Promise<any> {
    return await this.readService.getEachFolderList(labNum);
  }

  @Get('/FolderList/:labNum/:fileName(*)')
  async getEachLabFileContent(@Param('labNum') labNum: string, @Param('fileName') fileName: string): Promise<any> {
    return await this.readService.getEachLabFileContent(labNum, fileName);
  }

  // heartRate:: ObjectID 로 찾아오기
  @Get('/heartRate/:objectId')
  async getHeartRateByObjectId(@Param('objectId') objectId: MongooseSchema.Types.ObjectId) {
    return await this.readService.getHeartRateByObjectId(objectId);
  }
}
