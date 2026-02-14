import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min, Max, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ClientType {
  Particulier = 'Particulier',
  Entreprise = 'Entreprise',
  Industrie = 'Industrie',
  Administration = 'Administration',
}

export enum EnergyUsagePattern {
  residential = 'residential',
  commercial = 'commercial',
  industrial = 'industrial',
}

export enum RoofType {
  flat = 'flat',
  sloped = 'sloped',
  mixed = 'mixed',
}

export class CreateRequestDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
  @Transform(({ value }) => value?.replace(/\s/g, ''))
  @IsString() @Matches(/^(?:0|\+213)[567]\d{8}$/) phone!: string;
  @IsString() @MinLength(5) address!: string;
  @IsEnum(ClientType) clientType!: ClientType;

  @IsNumber() @Min(50) @Max(10000) monthlyConsumption!: number;
  @IsNumber() @Min(1) @Max(20) householdSize!: number;
  @IsEnum(EnergyUsagePattern) energyUsagePattern!: EnergyUsagePattern;
  @IsString({ each: true }) appliances!: string[];

  @IsNumber() @Min(10) @Max(5000) roofArea!: number;
  @IsEnum(RoofType) roofType!: RoofType;
  @IsString() @MinLength(2) location!: string;
  @IsNumber() @Min(2) @Max(10) peakSunHours!: number;
  @IsBoolean() hasShading!: boolean;

  @IsNumber() @Min(50000) @Max(10000000) budget!: number;
  @IsOptional() @IsString() notes?: string;
}
