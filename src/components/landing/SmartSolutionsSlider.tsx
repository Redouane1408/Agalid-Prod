import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Battery, Cpu, Home, Factory, ChevronLeft, ChevronRight } from 'lucide-react';

const solutions = [
  {
    id: 1,
    title: "Résidentiel Intelligent",
    description: "Systèmes solaires optimisés pour les maisons modernes avec gestion intelligente de l'énergie.",
    icon: Home,
    color: "from-blue-500 to-cyan-400",
    stats: ["Jusqu'à 70% d'économie", "Suivi via App Mobile", "Installation en 2 jours"]
  },
  {
    id: 2,
    title: "Industrie Verte",
    description: "Solutions haute capacité pour les usines et grands complexes industriels.",
    icon: Factory,
    color: "from-orange-500 to-yellow-400",
    stats: ["ROI en 3-5 ans", "Maintenance Prédictive", "Monitoring 24/7"]
  },
  {
    id: 3,
    title: "Stockage Avancé",
    description: "Batteries de dernière génération pour une autonomie totale jour et nuit.",
    icon: Battery,
    color: "from-purple-500 to-pink-400",
    stats: ["Durée de vie 15 ans", "Backup Instantané", "Technologie LiFePO4"]
  },
  {
    id: 4,
    title: "Gestion IA",
    description: "Algorithmes d'intelligence artificielle pour optimiser votre consommation.",
    icon: Cpu,
    color: "from-emerald-500 to-teal-400",
    stats: ["Apprentissage Auto", "Prévisions Météo", "Alertes Smart"]
  }
];

export default function SmartSolutionsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % solutions.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + solutions.length) % solutions.length);
  };

  return (
    <section className="py-24 bg-[#0d1412] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Solutions <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Intelligentes</span>
          </motion.h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Découvrez notre gamme complète de technologies solaires adaptées à chaque besoin.
          </p>
        </div>

        <div className="relative">
          <div className="flex justify-center items-center gap-8">
            <button 
              onClick={prevSlide}
              className="hidden md:flex p-4 rounded-full border border-white/10 hover:bg-white/5 text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="w-full max-w-4xl overflow-hidden">
              <motion.div 
                className="flex"
                animate={{ x: `-${currentIndex * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {solutions.map((solution) => (
                  <div key={solution.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-[var(--color-primary)]/50 transition-colors duration-500">
                      <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${solution.color} flex items-center justify-center`}>
                            <solution.icon className="h-8 w-8 text-white" />
                          </div>
                          
                          <h3 className="text-3xl font-bold text-white">{solution.title}</h3>
                          <p className="text-slate-300 text-lg leading-relaxed">
                            {solution.description}
                          </p>
                          
                          <ul className="space-y-3 pt-4">
                            {solution.stats.map((stat, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-slate-300">
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${solution.color}`} />
                                {stat}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="relative h-64 md:h-full rounded-2xl overflow-hidden bg-black/20 border border-white/5">
                          {/* Placeholder visual for each solution */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-20`} />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <solution.icon className="h-32 w-32 text-white/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <button 
              onClick={nextSlide}
              className="hidden md:flex p-4 rounded-full border border-white/10 hover:bg-white/5 text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="flex justify-center gap-3 mt-8">
            {solutions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-[var(--color-primary)] w-8' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
