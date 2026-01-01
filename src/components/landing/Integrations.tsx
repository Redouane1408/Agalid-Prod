import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants } from '@/lib/animations';
import { Globe } from 'lucide-react';

export default function Integrations() {
  const apps = ['Slack', 'Drive', 'Dropbox', 'Figma', 'GitHub'];
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
          <button className="px-6 py-3 rounded-full bg-[var(--color-primary)] hover:brightness-110 text-white font-semibold">Get Started</button>
          <h3 className="text-3xl font-bold text-gray-900 mt-6">Seamless integration with your favorite apps</h3>
        </motion.div>
        <div className="relative mt-10 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full bg-gray-100 flex items-center justify-center">
            <Globe className="h-10 w-10 text-gray-500" />
          </div>
          {apps.map((a, i) => (
            <motion.div key={a} variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} style={{ position: 'absolute', transform: `rotate(${i * (360 / apps.length)}deg) translate(180px) rotate(-${i * (360 / apps.length)}deg)` }} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center border">
              <span className="text-xs font-medium">{a[0]}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
