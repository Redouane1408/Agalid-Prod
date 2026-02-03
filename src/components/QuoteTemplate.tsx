import React from 'react';
import { CalculatorForm, CalculatorResult, AIRecommendation, formatCurrency, generateQuoteId } from '../lib/utils';

interface QuoteTemplateProps {
  id: string;
  data: CalculatorForm & { name: string; email: string; phone: string; address: string };
  result: CalculatorResult;
  recommendation: AIRecommendation;
}

export const QuoteTemplate: React.FC<QuoteTemplateProps> = ({ id, data, result, recommendation }) => {
  const quoteId = React.useMemo(() => generateQuoteId(), []);
  const date = new Date().toLocaleDateString('fr-FR');
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');

  // Estimate breakdown based on total system cost
  const totalCost = result.systemCost;
  const items = [
    {
      name: `Panneaux Solaires (${recommendation.panelModel})`,
      description: `Module photovoltaïque haute performance, ${recommendation.systemType}`,
      quantity: result.panelCount,
      unitPrice: (totalCost * 0.45) / result.panelCount,
      total: totalCost * 0.45
    },
    {
      name: `Onduleur (${recommendation.inverterType})`,
      description: "Onduleur intelligent avec monitoring intégré",
      quantity: 1,
      unitPrice: totalCost * 0.20,
      total: totalCost * 0.20
    },
    {
      name: "Structure de Fixation",
      description: `Support aluminium pour ${data.roofType === 'flat' ? 'toit plat' : 'toit incliné'}`,
      quantity: 1,
      unitPrice: totalCost * 0.15,
      total: totalCost * 0.15
    },
    {
      name: "Câblage et Protections Électriques",
      description: "Coffrets DC/AC, câbles solaires, disjoncteurs",
      quantity: 1,
      unitPrice: totalCost * 0.10,
      total: totalCost * 0.10
    },
    {
      name: "Installation et Mise en Service",
      description: "Main d'œuvre qualifiée, configuration et tests",
      quantity: 1,
      unitPrice: totalCost * 0.10,
      total: totalCost * 0.10
    }
  ];

  return (
    <div id={id} className="w-[210mm] min-h-[297mm] bg-white text-black p-[15mm] mx-auto shadow-lg relative font-sans text-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="w-1/2">
          <img 
            src="/agalid%20last%20version-16.svg" 
            alt="Agalid Solar" 
            className="h-20 w-auto mb-4 object-contain"
          />
          <div className="text-gray-600 text-xs leading-relaxed">
            <p className="font-bold text-gray-800 text-sm">AGALID ÉNERGIE SOLAIRE</p>
            <p>123 Rue Didouche Mourad</p>
            <p>16000 Alger, Algérie</p>
            <p>+213 21 123 456</p>
            <p>contact@agalid.com</p>
            <p>www.agalid.com</p>
          </div>
        </div>
        <div className="w-1/2 text-right">
          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2 uppercase tracking-wide">DEVIS</h1>
          <div className="text-gray-600 space-y-1">
            <p><span className="font-semibold text-gray-800">N° Devis:</span> {quoteId}</p>
            <p><span className="font-semibold text-gray-800">Date:</span> {date}</p>
            <p><span className="font-semibold text-gray-800">Validité:</span> {validUntil}</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="flex justify-between mb-12 bg-gray-50 p-6 rounded-lg border border-gray-100">
        <div className="w-[48%]">
          <h3 className="text-[var(--color-primary)] font-bold uppercase text-xs tracking-wider mb-3 border-b border-gray-200 pb-1">Client</h3>
          <p className="font-bold text-lg mb-1">{data.name}</p>
          <p className="text-gray-600">{data.address}</p>
          <p className="text-gray-600">{data.location}</p>
          <div className="mt-3 text-gray-600">
            <p>{data.email}</p>
            <p>{data.phone}</p>
          </div>
        </div>
        <div className="w-[48%]">
          <h3 className="text-[var(--color-primary)] font-bold uppercase text-xs tracking-wider mb-3 border-b border-gray-200 pb-1">Projet</h3>
          <div className="grid grid-cols-2 gap-y-2 text-gray-600">
            <span className="font-medium text-gray-800">Type de toit:</span>
            <span>{data.roofType === 'flat' ? 'Plat' : data.roofType === 'sloped' ? 'Pente' : 'Mixte'}</span>
            
            <span className="font-medium text-gray-800">Surface:</span>
            <span>{data.roofArea} m²</span>
            
            <span className="font-medium text-gray-800">Conso. Mensuelle:</span>
            <span>{data.monthlyConsumption} kWh</span>
            
            <span className="font-medium text-gray-800">Puissance:</span>
            <span>{(result.panelCount * 0.4).toFixed(1)} kWc</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-primary)] text-white text-xs uppercase tracking-wider">
              <th className="p-3 rounded-tl-lg">Description</th>
              <th className="p-3 text-center">Qté</th>
              <th className="p-3 text-right">Prix Unitaire</th>
              <th className="p-3 text-right rounded-tr-lg">Total HT</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-3">
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </td>
                <td className="p-3 text-center font-medium">{item.quantity}</td>
                <td className="p-3 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                <td className="p-3 text-right font-bold tabular-nums text-gray-900">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-16">
        <div className="w-1/2 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <div className="flex justify-between mb-2 text-gray-600">
            <span>Total HT</span>
            <span className="font-medium tabular-nums">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-600">
            <span>TVA (20%)</span>
            <span className="font-medium tabular-nums">{formatCurrency(totalCost * 0.20)}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-200 text-xl font-bold text-[var(--color-secondary)]">
            <span>Total TTC</span>
            <span className="tabular-nums">{formatCurrency(totalCost * 1.20)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-right italic">
            * Ce devis est une estimation basée sur les données fournies.
          </p>
        </div>
      </div>

      {/* Performance & ROI */}
      <div className="grid grid-cols-3 gap-6 mb-12 border-t border-gray-100 pt-8">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
          <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Économies Annuelles</p>
          <p className="text-xl font-bold text-green-800">{formatCurrency(result.estimatedSavings)}</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">Retour sur Investissement</p>
          <p className="text-xl font-bold text-blue-800">{result.paybackPeriod.toFixed(1)} ans</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <p className="text-xs text-yellow-700 font-bold uppercase tracking-wider mb-1">Production Mensuelle</p>
          <p className="text-xl font-bold text-yellow-800">{result.monthlyProduction.toFixed(0)} kWh</p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[15mm] left-[15mm] right-[15mm] border-t border-gray-200 pt-6 text-center text-xs text-gray-500 leading-relaxed">
        <p className="font-bold text-gray-700 mb-2">Merci de votre confiance !</p>
        <p>Agalid Énergie Solaire S.A.R.L - RC: 12345 - ICE: 001234567000089 - IF: 12345678</p>
        <p>Banque Extérieure d'Algérie - RIB: 123 456 78901234567890 12</p>
      </div>
    </div>
  );
};
