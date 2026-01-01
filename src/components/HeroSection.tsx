import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Zap, Shield, ArrowRight } from 'lucide-react';
import { heroVariants, floatAnimation, particleAnimation, fadeInVariants } from '../lib/animations';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#032b43] via-[#0a3f5f] to-[var(--color-secondary)]">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[var(--color-secondary)] rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            variants={particleAnimation}
            initial="initial"
            animate="animate"
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Floating solar panel icons */}
      <motion.div
        className="absolute top-20 left-10"
        variants={floatAnimation}
        animate="animate"
      >
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full">
          <Sun className="h-8 w-8 text-[var(--color-secondary)]" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-10"
        variants={floatAnimation}
        animate="animate"
        transition={{ delay: 1 }}
      >
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full">
          <Zap className="h-8 w-8 text-[var(--color-secondary)]" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-20"
        variants={floatAnimation}
        animate="animate"
        transition={{ delay: 2 }}
      >
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full">
          <Shield className="h-8 w-8 text-[var(--color-secondary)]" />
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={heroVariants}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Main heading */}
          <motion.div variants={fadeInVariants} className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              <motion.span
                className="block bg-gradient-to-r from-[color:var(--color-secondary)] to-[#f7b500] bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Énergie Solaire
              </motion.span>
              <motion.span
                className="block text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Intelligente pour
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-[color:var(--color-secondary)] to-[#f7b500] bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Votre Avenir
              </motion.span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Découvrez des solutions solaires sur mesure avec notre calculateur intelligent. 
            Obtenez des recommandations personnalisées et des devis détaillés en quelques clics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              onClick={onGetStarted}
              className="bg-[var(--color-secondary)] text-black px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2 shadow-lg hover:brightness-110 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Commencer Maintenant</span>
              <ArrowRight className="h-5 w-5" />
            </motion.button>

            <motion.button
              onClick={() => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Calculateur Solaire
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            {[
              { number: "500+", label: "Clients Satisfaits", icon: Sun },
              { number: "2.5MW", label: "Puissance Installée", icon: Zap },
              { number: "25%", label: "Économie Moyenne", icon: Shield },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-2">
                  <stat.icon className="h-8 w-8 text-[var(--color-secondary)] mx-auto" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
