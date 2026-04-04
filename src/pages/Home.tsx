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
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import ConsultationForm from '@/components/ConsultationForm';
import { QuoteTemplate } from '@/components/QuoteTemplate';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';
import { calculateSolarOutput, type CalculatorForm, type AIRecommendation, formatCurrency, formatNumber } from '@/lib/utils';
import { aiService } from '@/lib/ai-service';
import { pdfService } from '@/lib/pdf-service';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { QuoteData } from '@/types/quote';

type ClientData = CalculatorForm & { name: string; email: string; phone: string; address: string; clientType: 'Particulier' | 'Entreprise' | 'Industrie' | 'Administration' };

const getQuoteReference = (quoteId: number) => `AGL-${quoteId.toString().padStart(6, '0')}`;

const getAnnualProduction = (quote: QuoteData) => {
  return Math.round(quote.systemKw * Math.max(quote.request.peakSunHours || 0, 1) * 0.85 * 365);
};

const blobToBase64 = async (blob: Blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);

  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
};

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<ClientData | null>(null);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [quoteId, setQuoteId] = useState<number | null>(null);
  const [quote, setQuote] = useState<QuoteData | null>(null);
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
      const res = await api.post('/requests', data);
      const created = res.data;
      
      if (!created?.id) throw new Error('Invalid response from server');

      const qRes = await api.post(`/quotes/${created.id}/create`);
      const qData = qRes.data as QuoteData;
      setQuoteId(qData.id);
      setQuote(qData);

      const result = calculateSolarOutput(data);
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
    if (!quoteId || !quote) return;
    try {
      const pdfBlob = await pdfService.generateBlobFromElement('quote-template');
      const pdfBase64 = await blobToBase64(pdfBlob);
      await api.post(`/quotes/${quoteId}/send-email`, {
        pdfBase64,
        filename: `devis-agalid-${getQuoteReference(quote.id)}.pdf`,
        mimeType: 'application/pdf'
      });
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
    if (!quote) return;
    try {
      await pdfService.downloadFromElement('quote-template', `devis-agalid-${getQuoteReference(quote.id)}`);
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
      <FeaturedProducts />

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
            className="grid grid-cols-1 gap-6"
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

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {quote && (
                <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="xl:col-span-8 bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Aperçu du Devis</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {getQuoteReference(quote.id)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 dark:text-gray-300">
                    <div>Nombre de panneaux</div><div className="text-right font-medium">{quote.panelCount}</div>
                    <div>Puissance système</div><div className="text-right font-medium">{quote.systemKw.toFixed(1)} kWc</div>
                    <div>Production estimée</div><div className="text-right font-medium">{formatNumber(getAnnualProduction(quote))} kWh/an</div>
                    <div>Total global</div><div className="text-right font-medium">{formatCurrency(quote.totalDa)}</div>
                    <div>Localisation</div><div className="text-right font-medium">{quote.request.location}</div>
                    <div>Consommation</div><div className="text-right font-medium">{formatNumber(quote.request.monthlyConsumption)} kWh/mois</div>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-black/10 p-4">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Produits du devis</div>
                    <div className="space-y-3">
                      {quote.items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-100">{item.product.name}</div>
                            <div className="text-slate-500 dark:text-slate-400">{item.product.description}</div>
                          </div>
                          <div className="font-semibold text-slate-700 dark:text-slate-200">x{item.quantity}</div>
                        </div>
                      ))}
                    </div>
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

              <motion.div className="xl:col-span-4 bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-lg p-6">
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
                    <div className="h-3 bg-slate-200/70 dark:bg-white/10 rounded w-3/4" />
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Hidden Quote Template for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {quote && (
          <QuoteTemplate 
            id="quote-template" 
            quote={quote}
          />
        )}
      </div>

    </Layout>
  );
}
