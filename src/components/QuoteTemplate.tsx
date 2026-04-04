import React from 'react';
import { formatCurrency } from '../lib/utils';
import type { QuoteData } from '../types/quote';

interface QuoteTemplateProps {
  id: string;
  quote: QuoteData;
}

export const QuoteTemplate: React.FC<QuoteTemplateProps> = ({ id, quote }) => {
  const quoteReference = React.useMemo(() => `AGL-${quote.id.toString().padStart(6, '0')}`, [quote.id]);
  const snapshot = quote.calculationSnapshot;
  const date = React.useMemo(() => new Date(quote.createdAt).toLocaleDateString('fr-FR'), [quote.createdAt]);
  const validUntil = React.useMemo(() => {
    const baseDate = new Date(quote.createdAt);
    return new Date(baseDate.getTime() + (snapshot?.quoteValidityDays || 30) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');
  }, [quote.createdAt, snapshot?.quoteValidityDays]);
  const annualProduction = React.useMemo(() => {
    return snapshot?.annualProductionKwh || Math.round(quote.systemKw * Math.max(quote.request.peakSunHours || 0, 1) * 0.85 * 365);
  }, [quote, snapshot?.annualProductionKwh]);
  const roofTypeLabel = quote.request.roofType === 'flat' ? 'Plat' : quote.request.roofType === 'sloped' ? 'Pente' : quote.request.roofType === 'mixed' ? 'Mixte' : quote.request.roofType;
  const serviceLines = snapshot?.lineItems?.filter((item) => item.type === 'service' && item.totalDa > 0) || [];

  return (
    <div id={id} className="w-[210mm] h-[297mm] overflow-hidden bg-white text-black p-[12mm] mx-auto shadow-lg relative font-sans text-[12px]">
      <div className="flex justify-between items-start mb-8">
        <div className="w-full">
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
          <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-1 uppercase tracking-wide">DEVIS</h1>
          <div className="text-gray-600 space-y-1">
            <p><span className="font-semibold text-gray-800">N° Devis:</span> {quoteReference}</p>
            <p><span className="font-semibold text-gray-800">Date:</span> {date}</p>
            <p><span className="font-semibold text-gray-800">Validité:</span> {validUntil}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="w-[48%]">
          <h3 className="text-[var(--color-primary)] font-bold uppercase text-xs tracking-wider mb-3 border-b border-gray-200 pb-1">Client</h3>
          <p className="font-bold text-base mb-1">{quote.request.name}</p>
          <p className="text-gray-600">{quote.request.address}</p>
          <p className="text-gray-600">{quote.request.location}</p>
          <div className="mt-3 text-gray-600">
            <p>{quote.request.email}</p>
            <p>{quote.request.phone}</p>
          </div>
        </div>
        <div className="w-[48%]">
          <h3 className="text-[var(--color-primary)] font-bold uppercase text-xs tracking-wider mb-3 border-b border-gray-200 pb-1">Projet</h3>
          <div className="grid grid-cols-2 gap-y-1.5 text-gray-600">
            <span className="font-medium text-gray-800">Type de toit:</span>
            <span>{roofTypeLabel}</span>
            
            <span className="font-medium text-gray-800">Surface:</span>
            <span>{quote.request.roofArea} m²</span>
            
            <span className="font-medium text-gray-800">Conso. Mensuelle:</span>
            <span>{quote.request.monthlyConsumption} kWh</span>
            
            <span className="font-medium text-gray-800">Puissance:</span>
            <span>{quote.systemKw.toFixed(1)} kWc</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-primary)] text-white text-[11px] uppercase tracking-wider">
              <th className="p-2 rounded-tl-lg rounded-bl-lg w-[46%]">Description</th>
              <th className="p-2 text-center w-[12%]">Qté</th>
              <th className="p-2 text-right w-[20%]">PU</th>
              <th className="p-2 text-right rounded-tr-lg rounded-br-lg w-[22%]">Total</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-[11.5px]">
            {quote.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-2">
                  <p className="font-semibold text-gray-900">{item.product.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.product.description}</p>
                </td>
                <td className="p-2 text-center font-medium">{item.quantity}</td>
                <td className="p-2 text-right font-medium">{formatCurrency(item.unitPrice)}</td>
                <td className="p-2 text-right font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</td>
              </tr>
            ))}
            {serviceLines.map((item) => (
              <tr key={item.label} className="border-b border-gray-100 last:border-0 bg-gray-50/80">
                <td className="p-2">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Paramètre administrateur intégré au calcul du devis</p>
                </td>
                <td className="p-2 text-center font-medium">{item.quantity}</td>
                <td className="p-2 text-right font-medium">{formatCurrency(item.unitPriceDa)}</td>
                <td className="p-2 text-right font-semibold">{formatCurrency(item.totalDa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-[48%] bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Matériel</span>
              <span>{formatCurrency(quote.hardwareSubtotalDa)}</span>
            </div>
            <div className="flex justify-between">
              <span>Installation</span>
              <span>{formatCurrency(quote.installationSubtotalDa)}</span>
            </div>
            <div className="flex justify-between">
              <span>Marge</span>
              <span>{formatCurrency(quote.marginSubtotalDa)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>{formatCurrency(quote.taxSubtotalDa)}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Production estimée</span>
            <span>{annualProduction.toLocaleString('fr-FR')} kWh/an</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200 text-lg font-bold text-[var(--color-secondary)]">
            <span>Total Global (HT)</span>
            <span className="tabular-nums">{formatCurrency(quote.totalDa)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-right italic">
            * Ce devis est une estimation basée sur les données fournies.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[12mm] left-[12mm] right-[12mm] border-t border-gray-200 pt-4 text-center text-xs text-gray-500 leading-relaxed">
        <img 
            src="/logo-footer-17-17.png" 
            alt="Agalid Solar" 
            crossOrigin="anonymous"
            className="h-8 w-auto"
          />
        <p className="font-bold text-gray-700 mb-2">Merci de votre confiance !</p>
        <p>Agalid Énergie Solaire S.A.R.L - RC: 12345 - ICE: 001234567000089 - IF: 12345678</p>
        <p>Banque Extérieure d'Algérie - RIB: 123 456 78901234567890 12</p>
      </div>
    </div>
  );
};
