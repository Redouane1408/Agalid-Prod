export interface QuoteRequestData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  monthlyConsumption: number;
  roofArea: number;
  roofType: string;
  peakSunHours: number;
}

export interface QuoteProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  category?: { id: number; name: string } | null;
  specs?: Record<string, unknown> | null;
}

export interface QuoteItemData {
  id: number;
  quantity: number;
  unitPrice: number;
  product: QuoteProductData;
}

export interface QuoteSnapshotLineItem {
  type: string;
  label: string;
  quantity: number;
  unitPriceDa: number;
  totalDa: number;
}

export interface QuoteCalculationSnapshot {
  settingsId: number;
  generatedAt: string;
  annualProductionKwh: number;
  surfaceEstimateM2: number;
  systemEfficiency: number;
  quoteValidityDays: number;
  panelPowerKw: number;
  inverterPowerKw: number;
  requiredSystemKw: number;
  requiredInverterKw: number;
  lineItems: QuoteSnapshotLineItem[];
  businessRules: Record<string, unknown>;
  roofMultiplier: number;
  clientMultiplier: number;
}

export interface QuoteData {
  id: number;
  createdAt: string;
  totalDa: number;
  hardwareSubtotalDa: number;
  installationSubtotalDa: number;
  marginSubtotalDa: number;
  taxSubtotalDa: number;
  panelCount: number;
  systemKw: number;
  status: string;
  sentAt?: string | null;
  calculationSnapshot?: QuoteCalculationSnapshot | null;
  request: QuoteRequestData;
  items: QuoteItemData[];
}
