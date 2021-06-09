import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Schema as MongooseSchema } from "mongoose";
import { CreateHeartRateDto } from "src/dto/create-heart-rate.dto";
import { HeartRate } from "src/schema/heart-rate.schema";

//https://github.com/Cfvillarroel/nestjs-mongodb-app/blob/master/src/repositories/user.repository.ts
export class HeartRateRepository {
    constructor(@InjectModel('HeartRate') private readonly heartRateModel: Model<HeartRate>) { }

    async createHeartRate(createHeartRateDto: CreateHeartRateDto) {
        console.log(`dsse :: ${createHeartRateDto[0].userID}`);
        const heartRateExists: any = await this.getCreateHeartRateByUserID(createHeartRateDto.userID);

        if (heartRateExists.length == 0) {
            const newHeartRate = new this.heartRateModel({
                dataCategory: '0',
                userID: createHeartRateDto.userID,
                timeYear: createHeartRateDto.timeYear,
                timeMinute: createHeartRateDto.timeMinute,
                checkLocation: createHeartRateDto.checkLocation,
                statusID: createHeartRateDto.statusID,
                heartRateNum: createHeartRateDto.heartRateNum,
                accuracy: createHeartRateDto.accuracy
            });

            try {
                const createdHeartRate = await newHeartRate.save();
                return createdHeartRate;
            } catch (error) {
                throw new InternalServerErrorException(error);
            }
        } else {
            throw new ConflictException('HeartRate Exists');
        }

    }

    async createHeartRateList(createHeartRateDto: CreateHeartRateDto[]) {
        console.log(`length :: ${createHeartRateDto.length}`)
        try {
            for (let i = 0; i < createHeartRateDto.length; i++) {
                const newHeartRate = new this.heartRateModel({
                    ...createHeartRateDto[i]
                });
                await newHeartRate.save();
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async getUserbyObjectId(id: MongooseSchema.Types.ObjectId) {
        try {
            const heartRate = await this.heartRateModel.findById({ _id: id });
            return heartRate;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async getCreateHeartRateByUserID(userID: string) {
        try {
            const heartRate = await this.heartRateModel.find({ userID }, 'dataCategory userID timeYear timeMinute checkLocation statusID heartRateNum accuracy').exec();
            return heartRate;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}