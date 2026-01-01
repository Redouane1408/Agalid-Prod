import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';

export default function PromoSection() {
  const badges = [
    { label: 'Email', color: 'bg-blue-100 text-blue-700' },
    { label: 'SEO', color: 'bg-purple-100 text-purple-700' },
    { label: 'Ads', color: 'bg-pink-100 text-pink-700' },
    { label: 'Social Media', color: 'bg-cyan-100 text-cyan-700' },
    { label: 'Influencer', color: 'bg-green-100 text-green-700' }
  ];

  const cards = [
    'bg-teal-50',
    'bg-purple-50',
    'bg-blue-50',
    'bg-rose-50'
  ];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">Home — Agency</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Promotional Tool For Making Campaigns More Successful</h2>
            <p className="text-gray-600 mb-6">Gérez les canaux marketing avec des badges clairs et suivez la performance via des cartes simples et lisibles. Idéal pour les équipes et les agences.</p>
            <div className="flex flex-wrap gap-3">
              {badges.map(b => (
                <span key={b.label} className={`px-3 py-1 rounded-full text-sm font-medium ${b.color}`}>{b.label}</span>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
            {cards.map((c, i) => (
              <motion.div key={i} variants={cardHoverVariants} initial="initial" whileHover="hover" className={`rounded-2xl border border-gray-200 p-6 ${c}`}>
                <div className="h-24 rounded-lg bg-white/60" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
