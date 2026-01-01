import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';

const posts = [
  { title: 'Guide complet: autoconsommation solaire', category: 'Guide' },
  { title: 'Optimiser votre toit pour le PV', category: 'Conseil' },
  { title: 'Financement vert: options au Maroc', category: 'Finance' }
];

export default function Blog() {
  return (
    <section id="blog" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2 variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-3xl font-bold text-gray-900">Our Blog</motion.h2>
        <p className="text-gray-600 mt-2">Actualités et conseils pour réussir vos projets solaires.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {posts.map((p) => (
            <motion.div key={p.title} variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 mb-2">{p.category}</div>
              <div className="text-lg font-semibold text-gray-900">{p.title}</div>
              <p className="text-sm text-gray-600 mt-2">Découvrez les meilleures pratiques, des études de cas et des astuces concrètes.</p>
              <button className="mt-4 text-[var(--color-primary)] font-medium">Read more</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
