import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ResponseMessage } from 'src/util/response.util';

const AWS_S3_BUCKET_NAME = 'hyd-sample';

const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('kr.object.ncloudstorage.com'),
    region: 'kr-standard',
    credentials: {
        accessKeyId: 'LJanl6hkcSwlCQ0Qx6s7',
        secretAccessKey: 'IZ0ITgMJjnYZFFW3rv9kUZRoWifupB3LDUu6Zpu4',
    }
})

@Injectable()
export class UploadService {
    public async uploadFile(file: any): Promise<any> {
        let fileName: string[] = file.originalname.split(".")
        let fileType: string = fileName[fileName.length - 1]
        let fileMimeType: string = file.mimetype;

        if(fileMimeType.startsWith('image')) {
            const params = {
                Bucket: AWS_S3_BUCKET_NAME + '/image',
                Body: file.buffer,
                Key: fileName[0] + '.' + fileType
            }
            
            console.log(`params type :: ${typeof params}`)
            try {
               return await this.uploadImageFile(params);
            } catch(err) {
                return new ResponseMessage().error(400, err).build();
            }
        } else {
            const params = {
                Bucket: AWS_S3_BUCKET_NAME  + "/" + fileMimeType,
                Body: file.buffer,
                Key: fileName[0] + "." + fileType
            }

            try {
               return await this.uploadOtherFile(params);
            } catch(err) {
                return new ResponseMessage().error(400, err).build();
            }
        }
    }

    uploadImageFile(params: AWS.S3.PutObjectRequest): Promise<any> {
        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(new ResponseMessage().success()
                    .body({
                        fileName: data,
                        fileLocation: data.Location,
                    }).build());
                }
            })
        })
    }
    
    uploadOtherFile(params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
                if(err) {
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
