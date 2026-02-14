import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CalculatorForm {
  monthlyConsumption: number;
  roofArea: number;
  location: string;
  peakSunHours: number;
  householdSize: number;
  budget: number;
  energyUsagePattern: 'residential' | 'commercial' | 'industrial';
  roofType: 'flat' | 'sloped' | 'mixed';
  hasShading: boolean;
  appliances: string[];
}

export interface CalculatorResult {
  recommendedVoltage: number;
  panelCount: number;
  estimatedSavings: number;
  systemCost: number;
  paybackPeriod: number;
  co2Reduction: number;
  recommendedSystem: string;
  installationArea: number;
  monthlyProduction: number;
}

export interface AIRecommendation {
  systemType: string;
  panelModel: string;
  inverterType: string;
  batteryRecommendation: string;
  installationNotes: string;
  maintenanceSchedule: string;
  governmentIncentives: string[];
  financingOptions: string[];
}

export function calculateSolarOutput(form: CalculatorForm): CalculatorResult {
  const systemEfficiency = 0.85; // performance ratio
  const panelWattageW = 400; // 400 W per panel
  const panelWattageKW = panelWattageW / 1000; // 0.4 kW
  const panelArea = 2.2; // m² per panel
  const systemCostPerKW = 180000; // DZD/kW (approx)
  const dzdPerKwh = 15; // conservative average tariff for estimation

  // Daily energy need (kWh/day)
  const dailyConsumption = form.monthlyConsumption / 30;

  // Required system size (kW) to meet daily need:
  // energy = size(kW) * sunHours * PR  =>  size = energy / (sunHours * PR)
  const requiredSystemKw = dailyConsumption / Math.max(1, form.peakSunHours * systemEfficiency);

  // Panel count from kW requirement
  const panelCount = Math.max(1, Math.ceil(requiredSystemKw / panelWattageKW));
  const systemKW = panelCount * panelWattageKW;
  const recommendedVoltage = panelCount <= 10 ? 12 : panelCount <= 20 ? 24 : 48;
  const installationArea = panelCount * panelArea;

  // Estimated monthly production from designed system
  const monthlyProduction = systemKW * form.peakSunHours * 30 * systemEfficiency; // kWh/month

  // Cost scales with system size
  const systemCost = systemKW * systemCostPerKW;

  // Annual savings estimate based on self-consumed production
  const selfConsumptionRatio = 0.6;
  const effectiveMonthly = Math.min(monthlyProduction * selfConsumptionRatio, form.monthlyConsumption);
  const annualSavings = effectiveMonthly * 12 * dzdPerKwh;
  const paybackPeriod = annualSavings > 0 ? systemCost / annualSavings : Infinity;

  // CO2 reduction (1 kWh ≈ 0.5 kg CO2)
  const co2Reduction = monthlyProduction * 12 * 0.5;

  return {
    recommendedVoltage,
    panelCount,
    estimatedSavings: annualSavings,
    systemCost,
    paybackPeriod,
    co2Reduction,
    recommendedSystem:
      systemKW <= 3 ? 'Small Residential' : systemKW <= 7 ? 'Medium Residential' : 'Large Commercial',
    installationArea,
    monthlyProduction
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-DZ').format(num);
}

export function generateQuoteId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `AGL-${timestamp}-${random}`.toUpperCase();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
}

export const solarPanels = [
  { id: 1, name: 'Agalid Premium 400W', wattage: 400, efficiency: 21.2, warranty: 25 },
  { id: 2, name: 'Agalid Standard 350W', wattage: 350, efficiency: 19.8, warranty: 20 },
  { id: 3, name: 'Agalid Commercial 500W', wattage: 500, efficiency: 22.1, warranty: 30 }
];

export const inverters = [
  { id: 1, name: 'Agalid String Inverter', type: 'String', efficiency: 97.5, phases: 1 },
  { id: 2, name: 'Agalid Hybrid Inverter', type: 'Hybrid', efficiency: 96.8, phases: 1 },
  { id: 3, name: 'Agalid Commercial Inverter', type: 'Commercial', efficiency: 98.2, phases: 3 }
];

export const batteries = [
  { id: 1, name: 'Agalid LiFePO4 5kWh', capacity: 5, cycles: 6000, warranty: 10 },
  { id: 2, name: 'Agalid LiFePO4 10kWh', capacity: 10, cycles: 6000, warranty: 10 },
  { id: 3, name: 'Agalid LiFePO4 15kWh', capacity: 15, cycles: 6000, warranty: 10 }
];
