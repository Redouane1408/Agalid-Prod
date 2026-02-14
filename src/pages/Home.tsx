import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import Hero from '@/components/landing/Hero';
import PromoSection from '@/components/landing/PromoSection';
import SmartSolutionsSlider from '@/components/landing/SmartSolutionsSlider';
import ProcessFlow from '@/components/landing/ProcessFlow';
import BenefitsSection from '@/components/landing/BenefitsSection';
import GrowthStats from '@/components/landing/GrowthStats';
import Integrations from '@/components/landing/Integrations';
import DashboardPreview from '@/components/landing/DashboardPreview';
import FAQ from '@/components/landing/FAQ';
import Pricing from '@/components/landing/Pricing';
import ConsultationForm from '@/components/ConsultationForm';
import { QuoteTemplate } from '@/components/QuoteTemplate';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';
import { calculateSolarOutput, type CalculatorForm, type CalculatorResult, type AIRecommendation, formatCurrency, formatNumber } from '@/lib/utils';
import { aiService } from '@/lib/ai-service';
import { pdfService } from '@/lib/pdf-service';
import api from '@/lib/api';
import { toast } from 'sonner';

type ClientData = CalculatorForm & { name: string; email: string; phone: string; address: string; clientType: 'Particulier' | 'Entreprise' | 'Industrie' | 'Administration' };

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<ClientData | null>(null);
  const [calcResult, setCalcResult] = useState<CalculatorResult | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [quoteId, setQuoteId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();

  const derivedCalcResult = React.useMemo(() => {
    if (formData) return calculateSolarOutput(formData);
    return calcResult;
  }, [formData, calcResult]);

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
      const res = await api.post('/requests', data);
      const created = res.data;
      
      if (!created?.id) throw new Error('Invalid response from server');

      const qRes = await api.post(`/quotes/${created.id}/create`);
      const qData = qRes.data;
      setQuoteId(qData.id);

      const result = calculateSolarOutput(data);
      setCalcResult(result);
      const reco = await aiService.generateRecommendation(data, result);
      setRecommendation(reco);
      setFormOpen(false);

      toast.success('Demande reçue ! Calcul en cours...', { duration: 3000 });
      setTimeout(() => {
        document.querySelector('#results')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (e) {
      console.error('Submission failed', e);
      toast.error('Erreur lors de la soumission. Veuillez réessayer.');
    }
  };

  const handleSendEmail = async () => {
    if (!quoteId) return;
    try {
      await api.post(`/quotes/${quoteId}/send-email`);
      toast.success('Email envoyé avec succès !');
    } catch (e) {
      console.error('Email failed', e);
      toast.error("Échec de l'envoi de l'email.");
    }
  };

  const handleSendWhatsApp = async () => {
    if (!quoteId) return;
    try {
      await api.post(`/quotes/${quoteId}/send-whatsapp`);
      toast.success('WhatsApp envoyé !');
    } catch (e) {
      console.error('WhatsApp failed', e);
      toast.error("Échec de l'envoi WhatsApp. Vérifiez la configuration.");
    }
  };

  const handleSavePDF = async () => {
    if (!formData || !calcResult || !recommendation) return;
    try {
      await pdfService.generateFromElement('quote-template', `devis-agalid-${Date.now()}`);
      toast.success('PDF téléchargé !');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Erreur lors de la génération du PDF.');
    }
  };

  return (
    <Layout>
      <Hero onPrimary={handleGetStarted} onSecondary={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })} />
      <PromoSection />
      <SmartSolutionsSlider />
      <ProcessFlow />
      <BenefitsSection />
      <GrowthStats />
      <Integrations />
      <DashboardPreview />
      <FAQ />
      <Pricing />

      {/* Calculator Section */}
      <section id="calculator" className="py-24 bg-gradient-to-b from-white to-emerald-50/40 dark:from-[#0A1210] dark:to-[#0d1412] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Calcul en temps réel
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Obtenez votre devis en quelques secondes
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Remplissez le formulaire et découvrez instantanément le système idéal et les économies estimées.
            </p>
          </motion.div>

          <motion.div 
            variants={fadeInVariants} 
            initial="initial" 
            animate="animate" 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Formulaire</h3>
                {!formOpen && (
                  <button
                    onClick={() => setFormOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
                  >
                    Ouvrir
                  </button>
                )}
              </div>
              <div>
                {formOpen ? (
                  <ConsultationForm onComplete={handleComplete} onClose={() => setFormOpen(false)} />
                ) : (
                  <div className="text-sm text-slate-600 dark:text-gray-400">
                    Cliquez sur “Ouvrir” pour saisir vos informations et obtenir un devis personnalisé.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <motion.div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recommandation AI</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Généré</span>
                </div>
                {recommendation ? (
                  <div className="text-sm text-slate-700 dark:text-gray-300 space-y-2">
                    <p>Type de système: {recommendation.systemType}</p>
                    <p>Panneaux: {recommendation.panelModel}</p>
                    <p>Onduleur: {recommendation.inverterType}</p>
                    {recommendation.batteryRecommendation && <p>Batterie: {recommendation.batteryRecommendation}</p>}
                  </div>
                ) : (
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-slate-200/70 dark:bg-white/10 rounded w-2/3" />
                    <div className="h-3 bg-slate-200/70 dark:bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-slate-200/70 dark:bg白/10 rounded w-3/4" />
                  </div>
                )}
              </motion.div>

              {formData && derivedCalcResult && (
                <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-lg p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Aperçu du Système</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 dark:text-gray-300">
                    <div>Nombre de panneaux</div><div className="text-right font-medium">{derivedCalcResult.panelCount}</div>
                    <div>Puissance système</div><div className="text-right font-medium">{(derivedCalcResult.panelCount * 400 / 1000).toFixed(1)} kW</div>
                    <div>Production mensuelle</div><div className="text-right font-medium">{formatNumber(derivedCalcResult.monthlyProduction)} kWh</div>
                    <div>Coût estimé</div><div className="text-right font-medium">{formatCurrency(derivedCalcResult.systemCost)}</div>
                    <div>Économies annuelles</div><div className="text-right font-medium">{formatCurrency(derivedCalcResult.estimatedSavings)}</div>
                    <div>Retour sur investissement</div><div className="text-right font-medium">{derivedCalcResult.paybackPeriod.toFixed(1)} ans</div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <button
                      onClick={handleSavePDF}
                      className="px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-black font-semibold hover:brightness-110 shadow"
                    >
                      Télécharger le PDF
                    </button>
                    <button
                      onClick={handleSendEmail}
                      className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:brightness-110 shadow"
                    >
                      Envoyer Email
                    </button>
                    <button
                      onClick={handleSendWhatsApp}
                      className="px-4 py-2 rounded-lg bg-black text-white font-semibold hover:brightness-110 shadow"
                    >
                      WhatsApp
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      {/* Hidden Quote Template for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {formData && calcResult && recommendation && (
          <QuoteTemplate 
            id="quote-template" 
            data={formData} 
            recommendation={recommendation} 
          />
        )}
      </div>

    </Layout>
  );
}
