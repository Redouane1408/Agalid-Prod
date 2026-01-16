import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Wrench, Zap, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Analyse Gratuite",
    description: "Étude personnalisée de votre consommation et de votre toit.",
    icon: ClipboardCheck
  },
  {
    id: 2,
    title: "Installation Pro",
    description: "Pose rapide par nos équipes certifiées en moins de 48h.",
    icon: Wrench
  },
  {
    id: 3,
    title: "Mise en Service",
    description: "Connexion au réseau et activation du monitoring intelligent.",
    icon: Zap
  },
  {
    id: 4,
    title: "Suivi & Garantie",
    description: "Maintenance incluse et garantie de performance sur 25 ans.",
    icon: CheckCircle2
  }
];

export default function ProcessFlow() {
  return (
    <section className="py-24 bg-[#0d1412] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Comment ça <span className="text-[var(--color-secondary)]">Marche ?</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0">
            <motion.div 
              className="h-full bg-[var(--color-primary)] origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="group relative"
              >
                <div className="bg-[#1a2321] border border-white/5 rounded-2xl p-8 hover:border-[var(--color-primary)]/50 transition-all duration-300 hover:-translate-y-2 text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                    <step.icon className="h-8 w-8 text-[var(--color-primary)]" />
                  </div>
                  
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0d1412] border-2 border-[var(--color-primary)] flex items-center justify-center font-bold text-white text-sm">
                    {step.id}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
