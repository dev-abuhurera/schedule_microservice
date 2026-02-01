import { IsString, IsOptional, IsBoolean } from "class-validator";

export class CreateJobDto{

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    schedule: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

}