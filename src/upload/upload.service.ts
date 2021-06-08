import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ResponseMessage } from 'src/util/response.util';

const AWS_S3_BUCKET_NAME = 'hyd-sample';

const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('kr.object.ncloudstorage.com'),
    region: 'kr-standard',
    credentials: {
        accessKeyId: '',
        secretAccessKey: '',
    }
})

@Injectable()
export class UploadService {
    public async uploadFile(file: any): Promise<any> {
        let fileName: string[] = file.originalname.split(".")
        let fileType: string = fileName[fileName.length - 1]
        const params = {
            Body: file.buffer,
            Bucket: AWS_S3_BUCKET_NAME,
            Key: fileName[0] + '.' + fileType
        }

        const data = await s3
            .putObject(params)
            .promise()
            .then(
                data => {
                    console.log(data);
                    return new ResponseMessage()
                        .success()
                        .body({
                            fileName: fileName[0],
                            fileType: fileType
                        })
                        .build();
                },
                err => {
                    console.log(err);
                    return new ResponseMessage()
                        .error(200, err);
                }
            );
        console.log(data);
        console.log(`dataType::${typeof data}`);
        return data;
    }
}
