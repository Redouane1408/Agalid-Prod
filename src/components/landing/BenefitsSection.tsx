import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';
import { CheckCircle, BarChart3 } from 'lucide-react';

export default function BenefitsSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="space-y-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
              <span>Insights en temps réel</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Increase your sales by analyzing data</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />Tableaux de bord lisibles</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />Recommandations intelligentes</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />Suivi des objectifs</li>
            </ul>
          </motion.div>
          <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Dashboard</div>
              <div className="text-sm text-gray-500">Live</div>
            </div>
            <div className="h-48 rounded-lg bg-gradient-to-b from-green-50 to-white border border-gray-200 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-[var(--color-primary)]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
