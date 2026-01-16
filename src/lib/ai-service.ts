import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { CalculatorForm, CalculatorResult, AIRecommendation } from './utils';

const recommendationSchema = z.object({
  systemType: z.string(),
  panelModel: z.string(),
  inverterType: z.string(),
  batteryRecommendation: z.string(),
  installationNotes: z.string(),
  maintenanceSchedule: z.string(),
  governmentIncentives: z.array(z.string()),
  financingOptions: z.array(z.string())
});

export class AIService {
  private static instance: AIService;
  
  private constructor() {}
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateRecommendation(
    formData: CalculatorForm, 
    calculationResult: CalculatorResult
  ): Promise<AIRecommendation> {
    try {
      const apiKey = import.meta.env?.VITE_OPENAI_API_KEY as string | undefined;
      if (!apiKey) {
        return this.getFallbackRecommendation(formData, calculationResult);
      }
      const openai = createOpenAI({ apiKey });
      const prompt = `
        You are a solar energy expert at Agalid, a leading solar energy company in Morocco.
        Based on the following client information, provide a detailed recommendation:
        
        Client Profile:
        - Location: ${formData.location}
        - Monthly Consumption: ${formData.monthlyConsumption} kWh
        - Household Size: ${formData.householdSize} people
        - Budget: ${formData.budget} MAD
        - Energy Usage Pattern: ${formData.energyUsagePattern}
        - Roof Area: ${formData.roofArea} m²
        - Roof Type: ${formData.roofType}
        - Has Shading: ${formData.hasShading ? 'Yes' : 'No'}
        - Appliances: ${(formData.appliances || []).join(', ')}
        
        Calculated System Requirements:
        - System Size: ${calculationResult.panelCount} panels (${(calculationResult.panelCount * 400 / 1000).toFixed(1)} kW)
        - Estimated Cost: ${calculationResult.systemCost.toLocaleString('fr-MA')} MAD
        - Annual Savings: ${calculationResult.estimatedSavings.toLocaleString('fr-MA')} MAD
        - Payback Period: ${calculationResult.paybackPeriod.toFixed(1)} years
        - CO2 Reduction: ${calculationResult.co2Reduction.toFixed(0)} kg/year
        
        Provide specific recommendations for:
        1. Best panel model for this client's needs
        2. Optimal inverter type and size
        3. Battery storage recommendation (if applicable)
        4. Installation considerations specific to Morocco
        5. Maintenance schedule
        6. Available government incentives in Morocco
        7. Financing options available
        
        Be professional, detailed, and provide actionable advice.
      `;

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: recommendationSchema,
        prompt,
        temperature: 0.7,
        maxOutputTokens: 1000
      });

      return result.object;
    } catch (error) {
      console.error('AI recommendation generation failed:', error);
      // Fallback recommendation
      return this.getFallbackRecommendation(formData, calculationResult);
    }
  }

  private getFallbackRecommendation(
    formData: CalculatorForm, 
    calculationResult: CalculatorResult
  ): AIRecommendation {
    const systemKW = (calculationResult.panelCount * 400) / 1000;
    
    return {
      systemType: systemKW <= 3 ? 'Système Résidentiel Petit' : systemKW <= 7 ? 'Système Résidentiel Moyen' : 'Système Commercial',
      panelModel: 'Agalid Premium 400W - Panneaux haute efficacité (21.2%)',
      inverterType: systemKW <= 5 ? 'Onduleur String Monophasé 5kW' : 'Onduleur String Triphasé 10kW',
      batteryRecommendation: calculationResult.panelCount > 10 ? 'Batterie LiFePO4 10kWh recommandée pour l\'autoconsommation' : 'Batterie LiFePO4 5kWh suffisante pour les besoins actuels',
      installationNotes: `Installation sur toit ${formData.roofType}. ${formData.hasShading ? 'Analyse d\'ombre nécessaire pour optimiser le placement.' : 'Pas de problème d\'ombrage détecté.'} Surface requise: ${calculationResult.installationArea.toFixed(1)} m²`,
      maintenanceSchedule: 'Nettoyage trimestriel, inspection annuelle complète, maintenance préventive tous les 5 ans',
      governmentIncentives: [
        'Exonération de la TVA sur les équipements solaires',
        'Réduction d\'impôt de 30% sur les systèmes résidentiels',
        'Programme d\'autoconsommation industrielle',
        'Financement bancaire préférentiel via les banques partenaires'
      ],
      financingOptions: [
        'Paiement comptant avec remise 5%',
        'Financement bancaire jusqu\'à 7 ans',
        'Location avec option d\'achat (LOA)',
        'Crédit-bail pour les entreprises'
      ]
    };
  }

  async generateCustomResponse(
    question: string, 
    context: { formData?: CalculatorForm; calculationResult?: CalculatorResult }
  ): Promise<string> {
    try {
      const apiKey = import.meta.env?.VITE_OPENAI_API_KEY as string | undefined;
      if (!apiKey) {
        const base =
          "Je suis un assistant Agalid. Voici une réponse basée sur vos informations: ";
        const ctx = context.formData
          ? `Localisation: ${context.formData.location}, Consommation: ${context.formData.monthlyConsumption} kWh, Budget: ${context.formData.budget} MAD. `
          : '';
        return `${base}${ctx}Pour un devis précis, une visite technique est recommandée. Notre équipe peut vous accompagner pour choisir panneaux, onduleur et, si nécessaire, batterie.`;
      }
      const openai = createOpenAI({ apiKey });
      const prompt = `
        You are a solar energy expert at Agalid, Morocco's leading solar company.
        Answer this client question professionally and accurately:
        
        Question: ${question}
        
        ${context.formData ? `Client Context:
        - Location: ${context.formData.location}
        - Monthly Consumption: ${context.formData.monthlyConsumption} kWh
        - Budget: ${context.formData.budget} MAD
        - System Size: ${context.calculationResult?.panelCount} panels
        ` : ''}
        
        Provide a clear, helpful response in French or Arabic as appropriate for Moroccan clients.
        If the question is about pricing, mention that final quotes require a site visit.
        If technical, provide specific details about Agalid's solutions.
      `;

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({ response: z.string() }),
        prompt,
        temperature: 0.7,
        maxOutputTokens: 500
      });

      return result.object.response;
    } catch (error) {
      console.error('AI custom response generation failed:', error);
      return "Je suis désolé, je ne peux pas répondre à cette question pour le moment. Veuillez contacter notre équipe commerciale pour une assistance personnalisée.";
    }
  }
}

export const aiService = AIService.getInstance();
