import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateJobDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  
}