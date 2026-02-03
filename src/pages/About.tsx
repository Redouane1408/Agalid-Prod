import React from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Sun, Award, Users, Globe, ArrowRight, ShieldCheck, Zap, Leaf } from 'lucide-react';

const About = () => {
  const { isDark } = useTheme();

  const stats = [
    { label: 'Projets Réalisés', value: '500+', icon: Sun },
    { label: 'Années d\'Expérience', value: '10+', icon: Award },
    { label: 'Clients Satisfaits', value: '100%', icon: Users },
    { label: 'Villes Couvertes', value: '25+', icon: Globe },
  ];

  const values = [
    {
      title: 'Innovation Durable',
      description: 'Nous intégrons les dernières technologies photovoltaïques pour maximiser votre production énergétique tout en préservant l\'environnement.',
      icon: Leaf,
      color: 'bg-emerald-500'
    },
    {
      title: 'Expertise Technique',
      description: 'Notre équipe d\'ingénieurs certifiés garantit une installation conforme aux normes internationales et une maintenance proactive.',
      icon: ShieldCheck,
      color: 'bg-blue-500'
    },
    {
      title: 'Performance Garantie',
      description: 'Nous nous engageons sur les résultats avec des équipements haut de gamme et un suivi en temps réel de votre production.',
      icon: Zap,
      color: 'bg-amber-500'
    }
  ];

  return (
    <Layout>
      <div className={cn("min-h-screen pt-24 pb-12 transition-colors duration-300", 
        isDark ? "bg-[#0d1412]" : "bg-slate-50")}>
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-semibold mb-4">
              Notre Histoire
            </span>
            <h1 className={cn("text-4xl md:text-5xl font-bold mb-6", 
              isDark ? "text-white" : "text-slate-900")}>
              Pionniers de l'Énergie Solaire en Algérie
            </h1>
            <p className={cn("text-lg leading-relaxed", 
              isDark ? "text-slate-400" : "text-slate-600")}>
              Fondée avec une vision claire : démocratiser l'accès à l'énergie solaire pour tous les Algériens. 
              Agalid est née de la conviction que l'avenir énergétique de notre pays réside dans l'exploitation 
              intelligente de notre ressource la plus abondante : le soleil.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={cn("p-6 rounded-2xl border text-center group hover:-translate-y-1 transition-transform duration-300",
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm")}
                >
                  <div className={cn("w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 transition-colors",
                    isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={cn("text-3xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>
                    {stat.value}
                  </div>
                  <div className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Image Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop" 
              alt="Installation solaire Agalid" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 max-w-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">Une Expertise Reconnue</h2>
              <p className="text-slate-200 text-lg">
                De l'étude de faisabilité à l'installation finale, nos équipes vous accompagnent à chaque étape 
                pour garantir une transition énergétique sereine et rentable.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className={cn("text-3xl font-bold mb-4", isDark ? "text-white" : "text-slate-900")}>
              Nos Valeurs Fondamentales
            </h2>
            <p className={cn("max-w-2xl mx-auto", isDark ? "text-slate-400" : "text-slate-600")}>
              Ce qui nous guide au quotidien pour vous offrir le meilleur service possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={cn("p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl",
                    isDark 
                      ? "bg-white/5 border-white/10 hover:bg-white/10" 
                      : "bg-white border-slate-200 hover:border-emerald-200")}
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg", value.color)}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className={cn("text-xl font-bold mb-3", isDark ? "text-white" : "text-slate-900")}>
                    {value.title}
                  </h3>
                  <p className={cn("leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-emerald-600 px-6 py-16 md:px-16 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Prêt à passer au solaire ?
              </h2>
              <p className="text-emerald-100 text-lg mb-8">
                Rejoignez les milliers de foyers marocains qui font confiance à Agalid pour leur indépendance énergétique.
              </p>
              <button className="bg-white text-emerald-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-emerald-50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2">
                Commencer mon projet
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default About;
