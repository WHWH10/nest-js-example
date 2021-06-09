import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import _ from 'lodash';
import { ResponseMessage } from '../util/response.util';
import { Schema as MongooseSchema } from 'mongoose';
import { HeartRateRepository } from 'src/repository/heart-rate.repository';


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
  constructor(private readonly heartRateRepository: HeartRateRepository) { }

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

    console.log('fileName:: ' + fileName)
    switch (fileName) {
      case findKey('text/plain'):
        return await this.readTextFile(params);
      // break;
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
          resolve(this.uploadConvertJson(body))
          // resolve(this.uploadConvertJson2(body));
        }
      });
    }).then((result: any) => {
      console.log(`result --- ${result}`)
      return new ResponseMessage()
        .success()
        .body(result)
        .build();
    }).catch((err: any) => {
      return new ResponseMessage()
        .error(400, err)
        .build();
    });
  }

  uploadConvertJson(body: string) {
    const content: string[] = [];
    console.log(`body : ${body}`)

    body
      .trim()
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => {
        content.push(line);
      });
    console.log(`body 22: ${content}`)

    // console.log(`Remove space:: ${body}`)

    // console.log("Content:: " + content[0]);

    let header: string[] = content[0].replace(/\s/g, "").split(",");

    if (content[1].startsWith('0')) {
      header = ['dataCategory', 'userID', 'timeYear', 'timeMinute', 'checkLocation', 'statusID', 'heartRateNum', 'accuracy'];
    } else {
      console.log('flflflfl');
    }

    // console.log(`lodash log ${_.toString(1)}`)

    return _.tail(content).map((row: string) => {
      return _.zipObject(header, row.replace(/\s/g, "").split(","));
    });
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

  async getEachFolderList(labNum: string): Promise<any> {
    console.log(`folderName : ${labNum}`);
    var params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Prefix: labNum,
      MaxKeys: 300,
    };

    return new Promise((resolve, reject) => {
      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          reject(new ResponseMessage().error(400, err).build());
        } else {
          let keyList: string[] = [];
          for (let i = 0; i < data.Contents.length; i++) {
            keyList.push(data.Contents[i].Key.replace(`${labNum}/`, ''));
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

  async getEachLabFileContent(labNum: string, fileName: string): Promise<any> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: labNum + '/' + fileName
    }

    const findKey = (term): string => {
      if (fileName.includes(term)) {
        return fileName;
      }
    };

    console.log('fileName:: ' + fileName)
    switch (fileName) {
      case findKey('text/plain'):
        return await this.readTextFile(params);
      // break;
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

  async getHeartRateByObjectId(objectId: MongooseSchema.Types.ObjectId) {
    const heartRate = await this.heartRateRepository.getUserbyObjectId(objectId);
    if (!heartRate) {
      throw new UnauthorizedException('No exists HearTRate');
    }
    return new ResponseMessage()
      .success()
      .body({
        heartRate
      })
      .build()
  }
}
//https://stackoverflow.com/questions/24306182/convert-text-string-into-json-format-javascript
