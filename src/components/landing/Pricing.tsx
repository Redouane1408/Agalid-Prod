import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';
import { Check } from 'lucide-react';

const plans = [
  {
    title: 'Starter',
    price: 'DZD 0',
    features: ['Calculateur de base', 'PDF Devis', 'Support email']
  },
  {
    title: 'Pro',
    price: 'DZD 199/mois',
    features: ['AI Recommandations', 'Intégrations', 'Support prioritaire']
  },
  {
    title: 'Enterprise',
    price: 'Contactez-nous',
    features: ['Projets sur mesure', 'SLA 99%', 'Intégrations avancées']
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white dark:bg-[#0d1412] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2 variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-3xl font-bold text-slate-900 dark:text-white text-center">Choose The Best Plan For You</motion.h2>
        <p className="text-slate-600 dark:text-white/60 text-center mt-2">It is suitable for SaaS companies and agencies</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {plans.map((p) => (
            <motion.div key={p.title} variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6">
              <div className="text-slate-900 dark:text-white text-lg font-semibold mb-2">{p.title}</div>
              <div className="text-[var(--color-primary)] text-2xl font-bold mb-4">{p.price}</div>
              <ul className="space-y-2">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-white/80">
                    <Check className="h-5 w-5 text-[var(--color-primary)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full bg-[var(--color-primary)] hover:brightness-110 text-white py-2 rounded-lg font-semibold">Get Started</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
