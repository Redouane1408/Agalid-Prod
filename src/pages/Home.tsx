import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import Hero from '@/components/landing/Hero';
import PromoSection from '@/components/landing/PromoSection';
import SmartSolutionsSlider from '@/components/landing/SmartSolutionsSlider';
import ProcessFlow from '@/components/landing/ProcessFlow';
import FeatureHighlights from '@/components/landing/FeatureHighlights';
import BenefitsSection from '@/components/landing/BenefitsSection';
import GrowthStats from '@/components/landing/GrowthStats';
import Integrations from '@/components/landing/Integrations';
import DashboardPreview from '@/components/landing/DashboardPreview';
import Blog from '@/components/landing/Blog';
import FAQ from '@/components/landing/FAQ';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import ConsultationForm from '@/components/ConsultationForm';
import { QuoteTemplate } from '@/components/QuoteTemplate';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';
import { calculateSolarOutput, type CalculatorForm, type CalculatorResult, type AIRecommendation, formatCurrency, formatNumber } from '@/lib/utils';
import { aiService } from '@/lib/ai-service';
import { pdfService } from '@/lib/pdf-service';

type ClientData = CalculatorForm & { name: string; email: string; phone: string; address: string; clientType: 'Particulier' | 'Entreprise' | 'Industrie' | 'Administration' };

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<ClientData | null>(null);
  const [calcResult, setCalcResult] = useState<CalculatorResult | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [quoteId, setQuoteId] = useState<number | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const quoteRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const section = searchParams.get('section');
    if (section === 'integrations') {
      setTimeout(() => {
        const element = document.getElementById('integrations');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [searchParams]);

  const handleGetStarted = () => {
    document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' });
    setFormOpen(true);
  };

  const handleComplete = async (data: ClientData) => {
    setFormData(data);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('Request creation failed', err);
        alert('La création de la demande a échoué. Veuillez vérifier les champs.');
        return;
      }
      const created = await res.json();
      if (!created?.id) {
        console.error('Invalid response: missing id', created);
        alert('Réponse invalide du serveur.');
        return;
      }
      const qRes = await fetch(`/api/quotes/${created.id}/create`, { method: 'POST' });
      if (!qRes.ok) {
        const qErr = await qRes.text();
        console.error('Quote creation failed', qErr);
        alert('La création du devis a échoué.');
        return;
      }
      const qData = await qRes.json();
      setQuoteId(qData.id);
    } catch (e) {
      console.error('Failed to save request', e);
    }
    const result = calculateSolarOutput(data);
    setCalcResult(result);
    const reco = await aiService.generateRecommendation(data, result);
    setRecommendation(reco);
    setFormOpen(false);
    document.querySelector('#results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendEmail = async () => {
    if (!quoteId) return;
    try {
      await fetch(`/api/quotes/${quoteId}/send-email`, { method: 'POST' });
      alert('Email envoyé');
    } catch (e) {
      console.error('Email failed', e);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!quoteId) return;
    try {
      await fetch(`/api/quotes/${quoteId}/send-whatsapp`, { method: 'POST' });
      alert('WhatsApp envoyé');
    } catch (e) {
      console.error('WhatsApp failed', e);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    const response = await aiService.generateCustomResponse(aiQuestion, {
      formData: formData ?? undefined,
      calculationResult: calcResult ?? undefined
    });
    setAiAnswer(response);
  };

  const handleSavePDF = async () => {
    if (!formData || !calcResult || !recommendation) return;
    try {
      await pdfService.generateFromElement('quote-template', `devis-agalid-${Date.now()}`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Erreur lors de la génération du PDF.');
    }
  };

  return (
    <Layout>
      <Hero onPrimary={handleGetStarted} onSecondary={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })} />
      <PromoSection />
      <SmartSolutionsSlider />
      <ProcessFlow />
      <FeatureHighlights />
      <BenefitsSection />
      <GrowthStats />
      <Integrations />
      <DashboardPreview />
      <Blog />
      <Testimonials />
      <FAQ />
      <Pricing />

      {/* Calculator Section */}
      <section id="calculator" className="py-20 bg-white dark:bg-[#0A1210] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Calculateur Solaire Intelligent</h2>
              <p className="text-gray-600 dark:text-gray-400">Remplissez le formulaire pour obtenir un devis et des recommandations personnalisées.</p>
            </div>
            {!formOpen && (
              <button
                onClick={() => setFormOpen(true)}
                className="bg-[var(--color-secondary)] hover:brightness-110 text-black px-6 py-3 rounded-lg font-semibold shadow"
              >
                Ouvrir le formulaire
              </button>
            )}
          </div>

          {formOpen && (
            <motion.div variants={fadeInVariants} initial="initial" animate="animate" className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl shadow-lg p-6">
              <ConsultationForm onComplete={handleComplete} onClose={() => setFormOpen(false)} />
            </motion.div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-20 bg-gradient-to-br from-[color:var(--color-secondary)]/10 to-white dark:from-[#0A1210] dark:to-[#0d1412] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Résultats et Devis</h2>

          {formData && calcResult && recommendation ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" ref={quoteRef}>
              {/* Summary Card */}
              <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Résumé Client</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>Nom: {formData.name}</p>
                  <p>Email: {formData.email}</p>
                  <p>Téléphone: {formData.phone}</p>
                  <p>Adresse: {formData.address}</p>
                </div>
                <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>Consommation: {formatNumber(formData.monthlyConsumption)} kWh/mois</p>
                  <p>Heures d'ensoleillement: {formData.peakSunHours} h/jour</p>
                  <p>Surface du toit: {formatNumber(formData.roofArea)} m²</p>
                  <p>Budget: {formatCurrency(formData.budget)}</p>
                </div>
              </motion.div>

              {/* Calculation Card */}
              <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Calcul du Système</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>Nombre de panneaux: {calcResult.panelCount}</p>
                  <p>Puissance système: {(calcResult.panelCount * 400 / 1000).toFixed(1)} kW</p>
                  <p>Tension recommandée: {calcResult.recommendedVoltage} V</p>
                  <p>Surface d'installation: {calcResult.installationArea.toFixed(1)} m²</p>
                  <p>Production mensuelle: {formatNumber(calcResult.monthlyProduction)} kWh</p>
                </div>
                <div className="mt-6 text-sm text-gray-800 dark:text-gray-300 space-y-2">
                  <p>Coût estimé: {formatCurrency(calcResult.systemCost)}</p>
                  <p>Économies annuelles: {formatCurrency(calcResult.estimatedSavings)}</p>
                  <p>Période de retour: {calcResult.paybackPeriod.toFixed(1)} ans</p>
                  <p>Réduction CO2: {formatNumber(calcResult.co2Reduction)} kg/an</p>
                </div>
              </motion.div>

              {/* Recommendation Card */}
              <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Recommandation AI</h3>
                <div className="text-sm text-gray-700 dark:text-gray-400 space-y-2">
                  <p>Type de système: {recommendation.systemType}</p>
                  <p>Panneaux: {recommendation.panelModel}</p>
                  <p>Onduleur: {recommendation.inverterType}</p>
                  {recommendation.batteryRecommendation && <p>Batterie: {recommendation.batteryRecommendation}</p>}
                </div>
                <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSavePDF}
            className="w-full bg-[var(--color-secondary)] hover:brightness-110 text-black px-6 py-3 rounded-lg font-semibold shadow"
          >
            Enregistrer le devis en PDF
          </button>
          <button
            onClick={handleSendEmail}
            className="w-full bg-[var(--color-primary)] hover:brightness-110 text-white px-6 py-3 rounded-lg font-semibold shadow"
          >
            Envoyer par Email
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="w-full bg-black hover:brightness-110 text-white px-6 py-3 rounded-lg font-semibold shadow"
          >
            Envoyer sur WhatsApp
          </button>
        </div>
      </motion.div>
            </div>
          ) : (
            <p className="text-gray-600">Veuillez remplir le formulaire pour voir les résultats.</p>
          )}
        </div>
      </section>

      {/* Hidden Quote Template for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {formData && calcResult && recommendation && (
          <QuoteTemplate 
            id="quote-template" 
            data={formData} 
            result={calcResult} 
            recommendation={recommendation} 
          />
        )}
      </div>

    </Layout>
  );
}
