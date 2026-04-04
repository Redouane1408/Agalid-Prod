import { IsArray, IsBoolean, IsInt, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateOwnerSettingsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  services?: string[];

  @IsBoolean()
  @IsOptional()
  displayQuoteOnSite?: boolean;

  @IsBoolean()
  @IsOptional()
  sendEmailQuote?: boolean;

  @IsBoolean()
  @IsOptional()
  sendWhatsappQuote?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredFields?: string[];

  @IsNumber()
  @IsOptional()
  defaultSystemEfficiency?: number;

  @IsNumber()
  @IsOptional()
  defaultPanelAreaM2?: number;

  @IsNumber()
  @IsOptional()
  defaultPanelPowerKw?: number;

  @IsInt()
  @IsOptional()
  minimumPanelCount?: number;

  @IsNumber()
  @IsOptional()
  inverterSizingSafetyFactor?: number;

  @IsInt()
  @IsOptional()
  quoteValidityDays?: number;

  @IsInt()
  @IsOptional()
  installationBaseCostDa?: number;

  @IsInt()
  @IsOptional()
  installationCostPerPanelDa?: number;

  @IsInt()
  @IsOptional()
  structureCostPerPanelDa?: number;

  @IsInt()
  @IsOptional()
  cablingCostPerKwDa?: number;

  @IsInt()
  @IsOptional()
  protectionCostDa?: number;

  @IsInt()
  @IsOptional()
  transportCostDa?: number;

  @IsInt()
  @IsOptional()
  maintenanceCostDa?: number;

  @IsNumber()
  @IsOptional()
  shadingCostPercent?: number;

  @IsNumber()
  @IsOptional()
  marginPercent?: number;

  @IsNumber()
  @IsOptional()
  taxPercent?: number;

  @IsObject()
  @IsOptional()
  roofTypeMultipliers?: Record<string, number>;

  @IsObject()
  @IsOptional()
  clientTypeMultipliers?: Record<string, number>;

  @IsObject()
  @IsOptional()
  businessRules?: Record<string, unknown>;
}
