import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { fadeInVariants } from '@/lib/animations';

const faqs = [
  {
    question: "Comment fonctionne l'autoconsommation solaire ?",
    answer: "L'autoconsommation consiste à consommer directement l'électricité produite par vos panneaux solaires. Vos appareils utilisent en priorité cette énergie verte. Si vous produisez plus que vous ne consommez, le surplus peut être stocké dans une batterie virtuelle ou revendu au réseau."
  },
  {
    question: "Quelle est la durée de vie des panneaux Agalid ?",
    answer: "Nos panneaux solaires sont conçus pour durer. Ils bénéficient d'une garantie de performance de 25 ans. En réalité, ils continuent de produire de l'électricité au-delà de 30 ou 40 ans, avec une baisse de rendement très progressive."
  },
  {
    question: "Agalid est-il compatible avec ma domotique existante ?",
    answer: "Absolument. Agalid s'intègre nativement avec les principaux écosystèmes (Home Assistant, Google Home, Apple HomeKit) ainsi qu'avec les compteurs Linky et les onduleurs Enphase/SolarEdge. Notre dashboard centralise tout."
  },
  {
    question: "Quelles sont les aides de l'État disponibles ?",
    answer: "L'État propose plusieurs aides : la prime à l'autoconsommation (versée sur 5 ans), l'obligation d'achat du surplus par EDF OA, et une TVA réduite à 10% (pour les installations < 3kWc). Notre simulateur intègre automatiquement ces calculs."
  },
  {
    question: "Combien puis-je économiser sur ma facture ?",
    answer: "En moyenne, nos clients réduisent leur facture d'électricité de 40% à 70% dès la première année. Avec l'ajout d'une batterie virtuelle ou physique, l'autonomie peut atteindre 90% durant les mois d'été."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={fadeInVariants} 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>Support & Questions</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Questions <span className="text-emerald-600">Fréquentes</span>
          </h2>
          <p className="text-xl text-gray-600">
            Tout ce que vous devez savoir pour passer au solaire en toute confiance.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50 hover:bg-white transition-colors duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className={`text-lg font-semibold transition-colors ${openIndex === index ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {faq.question}
                </span>
                <span className={`p-2 rounded-full transition-colors ${openIndex === index ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
