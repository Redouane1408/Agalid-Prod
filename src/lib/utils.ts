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
  const systemEfficiency = 0.85; // 85% efficiency
  const panelWattage = 400; // 400W panels
  const panelArea = 2.2; // 2.2 sqm per panel
  const systemCostPerKW = 1200; // Cost per KW installed
  
  const dailyConsumption = form.monthlyConsumption / 30;
  const requiredDailyProduction = dailyConsumption / systemEfficiency;
  const requiredWattage = requiredDailyProduction / form.peakSunHours;
  
  const panelCount = Math.ceil(requiredWattage / panelWattage);
  const systemKW = (panelCount * panelWattage) / 1000;
  const recommendedVoltage = panelCount <= 10 ? 12 : panelCount <= 20 ? 24 : 48;
  const installationArea = panelCount * panelArea;
  const monthlyProduction = requiredDailyProduction * 30;
  
  // Calculate system cost
  const systemCost = systemKW * systemCostPerKW;
  
  // Calculate payback period (assuming 15% savings on electricity bill)
  const annualSavings = form.monthlyConsumption * 0.15 * 12 * 0.15; // 15% of bill is 15% savings
  const paybackPeriod = systemCost / annualSavings;
  
  // CO2 reduction (1 kWh = 0.5 kg CO2)
  const co2Reduction = monthlyProduction * 12 * 0.5; // kg per year
  
  return {
    recommendedVoltage,
    panelCount,
    estimatedSavings: annualSavings,
    systemCost,
    paybackPeriod,
    co2Reduction,
    recommendedSystem: systemKW <= 3 ? 'Small Residential' : systemKW <= 7 ? 'Medium Residential' : 'Large Commercial',
    installationArea,
    monthlyProduction
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-MA').format(num);
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
