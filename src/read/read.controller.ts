import { Controller, Get, Query } from '@nestjs/common';
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
  getFile(@Query('fileName') fileName: string) {
    return this.readService.getReadFile(fileName);
  }
}
