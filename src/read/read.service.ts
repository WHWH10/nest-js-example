import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ResponseMessage } from '../util/response.util';

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

  async getReadFile(fileName: string): Promise<any> {
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
    console.log('here?');
    return new Promise((resolve, reject) => {
      s3.getObject(params, (err, data: any) => {
        if (err) {
          reject(new ResponseMessage().error(400, err).build());
        } else {
          //   resolve(data);
          const body: string = Buffer.from(data.Body).toString('utf8');
          resolve(this.uploadConvertJson2(body));
        }
      });
    });
    //   .then((result: any) => {
    //       console.log('here?22');
    //     const body: string = Buffer.from(result.Body).toString('utf8');
    //     console.log('no...bb' + this.uploadConvertJson2(body))
    //     const convertJson = this.uploadConvertJson2(body);

    //     return {
    //         resultCode: 200,
    //     }

    //     // return new ResponseMessage()
    //     //   .success()
    //     //   .body(convertJson)
    //     //   .build();
    //   })
    //   .catch((err) => {
    //     return new ResponseMessage().error(400, err).build();
    //   });
  }

  uploadConvertJson2(body) {
    const data = body.split('\n');

    // Extract array of headers and
    // cut it from data
    const headers = data.shift().split(',');

    console.log(`data22: ${data}`);
    console.log(`header:: ${headers}`);

    // Define target JSON array
    let json = [];

    // Loop data
    for (let i = 0; i < data.length; i++) {
      // Remove empty lines
      if (/^\s*$/.test(data[i])) continue;
      // Split data line on cells
      const contentCells = data[i].split(',');
      // Loop cells
      let jsonLine = {};
      for (let i = 0; i < contentCells.length; i++)
        jsonLine[headers[i]] = contentCells[i];
      // Push new line to json array
      json.push(jsonLine);
    }

    // Result
    console.log(json);
    console.log(`data type : ${typeof json}`);
    this.getReadFileResult(json);
    // return json;
  }

  uploadConvertJson(body: string) {
    console.log('here?333');
    console.log(`body :: ${body}`);
    const content: string[] = [];
    body
      .replace(/\r/g, '')
      .trim()
      .split('\n')
      .map((line) => {
        content.push(line);
      });

    // const header = content[0].split(',');
    const headers = content.shift().split(',');
    console.log(`header:: ${headers}`);

    let json = [];
    let jsonLine = {};

    console.log(`length ${content.length}`);
    // for(let i=0;i<content.length;i++) {
    //     console.log(`resu  ::: ${content[i]}`)
    //     console.log(`eu :: ${header[i].split(',')}`)
    //     const key = header[i].split(',');
    //     jsonLine[content[i]] =  {
    //         key: content[i].split(',')
    //     }

    //     console.log(`what ? ${jsonLine[0]}`)
    // }

    for (let i = 0; i < content.length; i++) {
      const contentCells = content[i].split(',');
      for (let i = 0; i < contentCells.length; i++) {
        jsonLine[headers[i]] = contentCells[i];
      }
      json.push(jsonLine);
    }
    console.log(`result? ${json}`);
    console.log(`type ${typeof json}`);
    return json;
  }

  getReadFileResult(json: any): ResponseMessage {
    console.log(`result json : ${json}`);

    return new ResponseMessage().success().body(json);
  }

  async getFolderList(): Promise<any> {
    var params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Delimiter: '/',
      MaxKeys: 300,
    };

    return new Promise((resolve, reject) => {
      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          reject(new ResponseMessage().error(400, err).build());
        } else {
          resolve(
            new ResponseMessage().success().body(data.CommonPrefixes).build(),
          );
        }
      });
    });

    //  return 'success'
  }

  async getEachFolderList(folderName: string): Promise<any> {
    console.log(`folderName : ${folderName}`);
    var params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Prefix: folderName,
      MaxKeys: 300,
    };

    return new Promise((resolve, reject) => {
      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          reject(new ResponseMessage().error(400, err).build());
        } else {
          let keyList: string[] = [];
          for (let i = 0; i < data.Contents.length; i++) {
            keyList.push(data.Contents[i].Key.replace(`${folderName}/`, ''));
          }
          resolve(
            new ResponseMessage()
              .success()
              .body({
                fileName: keyList,
              })
              .build(),
          );
        }
      });
    });
  }
}
//https://stackoverflow.com/questions/24306182/convert-text-string-into-json-format-javascript
