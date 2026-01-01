import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants } from '@/lib/animations';

export default function CTABand() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="rounded-3xl bg-[var(--color-black)] text-white p-10 text-center">
          <div className="text-2xl md:text-3xl font-bold">Join Thousands of Businesses Switching to Smart Solar</div>
          <p className="text-white/70 mt-2">Commencez avec une évaluation gratuite et un devis instantané.</p>
          <button className="mt-6 px-8 py-3 rounded-full bg-[var(--color-primary)] hover:brightness-110 text-white font-semibold">Start Free Trial</button>
        </motion.div>
      </div>
    </section>
  );
}
