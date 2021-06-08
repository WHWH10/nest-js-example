import { IsString } from "class-validator";

export class CreateUploadDto {
    @IsString()
    readonly fileName: string;
    @IsString()
    readonly fileUrl: string;
    @IsString()
    readonly author: string;
}