import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Home, Info, FileText, Phone, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { slideInVariants, fadeInVariants } from '../lib/animations';
import { useTheme } from '@/hooks/useTheme';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'home', href: '#home', icon: Home },
    { name: 'blog', href: '#blog', icon: FileText },
    { name: 'about us', href: '#about', icon: Info },
    { name: 'contact', href: '#contact', icon: Phone }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-[var(--color-black)] text-white' : 'bg-white text-gray-900')}>
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          'bg-[#0d1412]/95 backdrop-blur-sm border-b border-white/10'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              className="flex items-center space-x-2"
            >
              <img src="/agalid jdid-13.svg" alt="Agalid" className="h-8 dark:hidden" />
              <img src="/agalid last version-15.svg" alt="Agalid" className="h-8 hidden dark:block" />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.name}
                    variants={slideInVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.1 }}
                    onClick={() => scrollToSection(item.href)}
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </motion.button>
                );
              })}
              <button className="text-white/80 hover:text-white font-medium flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </button>
              <button onClick={() => scrollToSection('#home')} className="bg-[var(--color-secondary)] hover:brightness-110 text-black px-5 py-2 rounded-full font-semibold">
                Get Started
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-full border border-white/10 text-white/80 hover:text-white">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-[#0d1412]/95 backdrop-blur-lg border-t border-white/10"
            >
              <div className="px-4 pt-2 pb-3 space-y-1">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.name}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => scrollToSection(item.href)}
                      className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </motion.button>
                  );
                })}
                <div className="flex items-center gap-3 px-3 py-2">
                  <button className="text-white/80 hover:text-white font-medium flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </button>
                  <button onClick={toggleTheme} className="p-2 rounded-full border border-white/10 text-white/80 hover:text-white">
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-[var(--color-black)] text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-[var(--color-primary)] p-2 rounded-full">
                  <Sun className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Agalid</span>
              </div>
              <p className="text-white/60 text-sm">
                Votre partenaire de confiance pour l'énergie solaire au Maroc. 
                Des solutions sur mesure pour un avenir durable.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>Installation Résidentielle</li>
                <li>Solutions Commerciales</li>
                <li>Maintenance & Support</li>
                <li>Financement</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>Casablanca, Maroc</li>
                <li>+212 522 123 456</li>
                <li>contact@agalid.com</li>
                <li>Lun-Ven: 8h-18h</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">Suivez-nous</h3>
              <div className="flex space-x-4">
                {['Facebook', 'LinkedIn', 'Instagram'].map((social) => (
                  <motion.div
                    key={social}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--color-primary)] transition-colors"
                  >
                    <span className="text-xs font-semibold">{social[0]}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-white/10 mt-8 pt-8 text-center text-white/60 text-sm"
          >
            <p>&copy; 2024 Agalid Énergie Solaire. Tous droits réservés.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Layout;
