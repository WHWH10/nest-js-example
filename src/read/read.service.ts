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
  },
});

@Injectable()
export class ReadService {
  async getAllFileList(): Promise<any> {
    var params = {
      Bucket: AWS_S3_BUCKET_NAME,
      //   Delimiter: '/',
      MaxKeys: 300,
    };

    return new Promise((resolve, reject) => {
      let outKey: string[] = [];
      s3.listObjects(params, (err, data) => {
        if (err) {
          reject(new ResponseMessage().error(400, err).build());
        } else {
          for (let i: number = 0; i < data.Contents.length; i++) {
            outKey.push(data.Contents[i].Key);
          }
          resolve(new ResponseMessage().success().body(outKey).build());
        }
      });
    });
  }

  getReadFile(fileName: string) {
    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: fileName,
      ResponseContentType: 'application/json',
    };

    const findKey = (term) => {
      if (fileName.includes(term)) {
        return fileName;
      }
    };

    switch (fileName) {
      case findKey('text/plain'):
        this.readTextFile(params);
        break;
      case findKey('text/csv'):
        //   this.readCsvFile(params);
        break;
      case findKey('image'):
        // this.readImageFile(params);
        break;
      default:
        //    this.readDefaultFile(params);
        console.log('DEFAULT');
    }
  }

  async readTextFile(params: AWS.S3.PutObjectRequest): Promise<any> {
      console.log('here?')
    return new Promise((resolve, reject) => {
      s3.getObject(params, (err, data) => {
        if (err) {
          reject(new ResponseMessage().error(400, err).build());
        } else {
          resolve(data);
        }
      });
    })
      .then((result: any) => {
          console.log('here?22');
        const body: string = Buffer.from(result.Body).toString('utf8');
        console.log('no...bb' + this.uploadConvertJson(body))
        return new ResponseMessage()
          .success()
          .body(this.uploadConvertJson(body))
          .build();
      })
      .catch((err) => {
        return new ResponseMessage().error(400, err).build();
      });
  }

  uploadConvertJson(body: string) {
      console.log('here?333');
    const content: string[] = [];
    body
      .replace(/\r/g, '')
      .trim()
      .split('\n')
      .map((line) => {
        content.push(line);
      });

    // const header = content[0].split(',');
    const header = content.shift();
    console.log('header?? ' + header)
    console.log('Result --- ' +content[1]);
    
    var obj = content.map((el) => {
        var obj = {};
        for(let i = 0;i<el.length;i++) {
            obj[header[i]] = el[i];
        }
        return obj;
    })

    var json = JSON.stringify(obj);
    console.log('json:: ' + json);
  }
}
