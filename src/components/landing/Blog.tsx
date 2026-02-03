import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';

const posts = [
  { title: 'Guide complet: autoconsommation solaire', category: 'Guide' },
  { title: 'Optimiser votre toit pour le PV', category: 'Conseil' },
  { title: 'Financement vert: options en Algérie', category: 'Finance' }
];

export default function Blog() {
  return (
    <section id="blog" className="bg-white dark:bg-[#0d1412] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2 variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-3xl font-bold text-slate-900 dark:text-white">Nos Ressources</motion.h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Actualités et conseils pour réussir vos projets solaires.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {posts.map((p) => (
            <motion.div key={p.title} variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-2xl border border-slate-200 dark:border-white/10 p-6 bg-white dark:bg-white/5">
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full inline-block">{p.category}</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{p.title}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Découvrez les meilleures pratiques, des études de cas et des astuces concrètes.</p>
              <button className="mt-4 text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Lire l'article</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
