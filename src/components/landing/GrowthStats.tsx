import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants } from '@/lib/animations';

export default function GrowthStats() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <div className="h-64 rounded-2xl bg-gray-100" />
          </motion.div>
          <motion.div variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="rounded-2xl p-8 bg-[var(--color-primary)] text-white">
            <div className="text-xl font-semibold mb-4">Croissance continue</div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-5xl font-bold">34%</div>
                <div className="text-white/80">Taux d'augmentation</div>
              </div>
              <div>
                <div className="text-5xl font-bold">60K</div>
                <div className="text-white/80">Utilisateurs actifs</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
