import React from 'react';
import { motion } from 'framer-motion';
import { Server, Headset } from 'lucide-react';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';

export default function FeatureHighlights() {
  return (
    <section className="bg-[var(--color-black)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2 variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-3xl font-bold text-white mb-8">Check the features, useful to use</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Server className="h-6 w-6 text-white/80" />
              <div className="text-lg font-semibold text-white">99% Uptime</div>
            </div>
            <p className="text-white/60">Infrastructure fiable avec surveillance en temps réel et redondance multi-zones.</p>
          </motion.div>
          <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Headset className="h-6 w-6 text-white/80" />
              <div className="text-lg font-semibold text-white">24/7 Free Support</div>
            </div>
            <p className="text-white/60">Assistance dédiée pour vos projets solaires et vos intégrations.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
