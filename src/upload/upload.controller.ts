import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private uploadService: UploadService) { }

    // @Post()
    // @UseInterceptors(FileInterceptor('file'))
    // async uploadFile(@UploadedFile() file: any): Promise<any> {
    //     return await this.uploadService.uploadFile(file);
    // }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any): Promise<any> {
        return await this.uploadService.uploadLabFile(file);
    }
}
