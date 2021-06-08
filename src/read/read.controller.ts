import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReadService } from './read.service';

@Controller('read')
export class ReadController {
  constructor(private readService: ReadService) {}

  // 파일 전체 목록 불러오기
  @Get()
  async getAllFieList(): Promise<any> {
    return await this.readService.getAllFileList();
  }

  @Get('/File')
  async getFile(@Query('fileName') fileName: string) {
    return await this.readService.getReadFile(fileName);
  }

  @Get('/FolderList') 
  async getFolderList(): Promise<any> {
      return await this.readService.getFolderList();
  }

  @Get('/FolderList/:folderName')
  async getEachFolderList(@Param('folderName') folderName: string): Promise<any> {
    return await this.readService.getEachFolderList(folderName);
  }
}
