import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';

export default function Testimonials() {
  return (
    <section className="bg-white dark:bg-[#0d1412] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h3 variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-center text-slate-600 dark:text-slate-400">What clients say</motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[1,2,3].map((i) => (
            <motion.div key={i} variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-2xl border border-slate-200 dark:border-white/10 p-6 bg-slate-50 dark:bg-white/5">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300">Service excellent et résultats mesurables. L'équipe est réactive et professionnelle.</p>
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-500">Client — PME industrielle</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
