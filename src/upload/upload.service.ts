import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import _ from 'lodash';
import { Dictionary } from 'lodash';
import { Connection } from 'mongoose';
import { CreateHeartRateDto } from 'src/dto/create-heart-rate.dto';
import { HeartRateRepository } from 'src/repository/heart-rate.repository';
import { ResponseMessage } from 'src/util/response.util';
import { ConfigService } from '../config/config.service'

const config = new ConfigService();


const formatDate = (): string => {
    const date: Date = new Date();

    let month: string = date.getMonth() + 1 + '';
    let day: string = '' + date.getDate();
    let year: string = '' + date.getFullYear();

    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }

    return [year, month, day].join('-');
}

@Injectable()
export class UploadService {

    constructor(private readonly heartRateRepository: HeartRateRepository) {}


    async uploadLabFile(file: any): Promise<any> {

        let fileName: string[] = file.originalname.split(".")
        let fileType: string = fileName[fileName.length - 1]
        let fileMimeType: string = file.mimetype;

        let labNum = fileName[0].split('-')[3];

        let filePath: string = config.get('NAVER_CLOUD_BUCKET_NAME')
            + '/'
            + labNum
            + '/'
            + formatDate()
            + '/'
            + fileMimeType;

        console.log('eworkign?',)
        if (fileMimeType.startsWith('image')) {
            const params: AWS.S3.PutObjectRequest = {
                Bucket: filePath,
                Body: file.buffer,
                ACL: 'public-read-write',
                Key: fileName[0] + '.' + fileType
            }

            try {
                return await this.uploadImageFile(params);
            } catch (err) {
                return new ResponseMessage().error(400, err).build();
            }
        } else {

            console.log(`filePath :: ${filePath}`)
            const params: AWS.S3.PutObjectRequest = {
                Bucket: filePath,
                Body: file.buffer,
                ACL: 'public-read-write', //전체공개 (다운로드 다 가능)
                Key: fileName[0] + '.' + fileType
            }

            console.log(`buffer type :: ${typeof file.buffer}`)
            this.getFileBuffer(file.buffer);

            try {
                return await this.uploadOtherFile(params);
            } catch (err) {
                return new ResponseMessage().error(400, err).build();
            }
        }
    }

    // getFileBuffer(buffer: any): _.Dictionary<string>[] {
    //     const body: string = Buffer.from(buffer).toString('utf8');
    //     console.log(`body :: ${body}`)
    //     if (body.includes('데이터 구분')) {
    //         c  this.uploadConvertJson(body);
    //     } else {
    //         console.log('false')
    //     }
    // }

    getFileBuffer(buffer: any) {
        const body: string = Buffer.from(buffer).toString('utf8');
        if (body.includes('데이터')) {
            let content: string[] = [];
            body
                .replace(/\r/g, "")
                .split("\n")
                .map((line) => {
                    content.push(line);
                });

            const header: string[] = content[0].replace(/\s/g, "").split(",");

            console.log(`Content :: ${content}`)
            if (content[1].startsWith('0')) {
                this.saveToMongo(header, content);
                console.log('true 000');
            } else {
                console.log('false 000')
            }
        }
    }
//https://www.codegrepper.com/code-examples/javascript/js+split+string+into+array
    saveToMongo(header: string[], content: string[]) {
        content.shift();
        const userIdList: string[] = [];
        if (content[0].startsWith('0')) {
            for(let i=0;i<content.length;i++) {
                console.log(`userDATA: ${content[i].replace(/\s/g, "").split(",")}`);
            }
        
        } else {
            console.log('other foramt');
        }
    }

    public async uploadFile(file: any): Promise<any> {
        let fileName: string[] = file.originalname.split(".")
        let fileType: string = fileName[fileName.length - 1]
        let fileMimeType: string = file.mimetype;

        if (fileMimeType.startsWith('image')) {
            const params = {
                Bucket: config.get('NAVER_CLOUD_BUCKET_NAME') + '/image',
                Body: file.buffer,
                Key: fileName[0] + '.' + fileType
            }

            console.log(`params type :: ${typeof params}`)
            try {
                return await this.uploadImageFile(params);
            } catch (err) {
                return new ResponseMessage().error(400, err).build();
            }
        } else {
            const params = {
                Bucket: config.get('NAVER_CLOUD_BUCKET_NAME') + "/" + fileMimeType,
                Body: file.buffer,
                Key: fileName[0] + "." + fileType
            }

            try {
                return await this.uploadOtherFile(params);
            } catch (err) {
                return new ResponseMessage().error(400, err).build();
            }
        }
    }


    async uploadImageFile(params: AWS.S3.PutObjectRequest): Promise<any> {

        return new Promise(async (resolve, reject) => {
            await (await config.getS3Params()).upload(params, (err, data: any) => {
                if (err) {
                    reject(new ResponseMessage().error(400, err).build());
                } else {
                    resolve(new ResponseMessage().success()
                        .body({
                            fileName: data.key,
                            fileLocation: data.Location,
                        }).build());
                }
            })
        })
    }

    async uploadOtherFile(params: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            await (await config.getS3Params()).upload(params, (err, data: any) => {
                if (err) {
                    reject(new ResponseMessage().error(400, err).build())
                } else {
                    resolve(new ResponseMessage().success()
                        .body({
                            fileName: data.key,
                            fileLocation: data.Location,
                        }).build())
                }
            })
        })
    }
}
