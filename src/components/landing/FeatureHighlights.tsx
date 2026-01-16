import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Wifi, ShieldCheck, Sun } from 'lucide-react';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';

export default function FeatureHighlights() {
  const features = [
    {
      icon: Cpu,
      title: "Onduleurs Intelligents",
      desc: "Technologie de pointe pour une conversion d'énergie optimale et une longévité accrue."
    },
    {
      icon: Wifi,
      title: "Monitoring à Distance",
      desc: "Suivez votre production en temps réel depuis votre smartphone, où que vous soyez."
    },
    {
      icon: ShieldCheck,
      title: "Garantie Étendue",
      desc: "Tranquillité d'esprit avec une garantie de 25 ans sur la performance des panneaux."
    },
    {
      icon: Sun,
      title: "Panneaux Haut Rendement",
      desc: "Cellules monocristallines capturant le maximum de lumière, même par temps nuageux."
    }
  ];

  return (
    <section className="bg-[#0d1412] relative overflow-hidden py-24">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={fadeInVariants} 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Technologie de Pointe</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Nous utilisons uniquement des composants de tier-1 mondial pour garantir la meilleure performance pour votre investissement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={cardHoverVariants} 
              initial="initial" 
              whileHover="hover" 
              className="rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm hover:bg-white/10 transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                <feature.icon className="h-7 w-7 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
