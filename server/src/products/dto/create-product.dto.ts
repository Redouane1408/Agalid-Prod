import { IsNotEmpty, IsNumber, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsObject()
  @IsOptional()
  specs?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  stock?: number;
}
