import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Home, Info, Phone, LogIn, ShoppingBag, ArrowRight, ChevronRight, User as UserIcon, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '@/hooks/useTheme';
import Footer from './Footer';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  type User = { name?: string; role?: string } | null;
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check auth
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Invalid user data', e);
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const navigationItems = [
    { name: 'Accueil', href: '/', icon: Home, type: 'link' },
    { name: 'Produits', href: '/products', icon: ShoppingBag, type: 'link' },
    { name: 'À propos', href: '/about', icon: Info, type: 'link' },
    { name: 'Contact', href: '/#contact', icon: Phone, type: 'hash' }
  ];

  const handleNavClick = (item: { href: string; type: string }) => {
    if (item.type === 'hash') {
      if (location.pathname !== '/') {
        navigate(item.href);
      } else {
        const element = document.querySelector(item.href.replace('/', ''));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(item.href);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className={cn('min-h-screen transition-colors duration-300', isDark ? 'bg-[#0d1412] text-white' : 'bg-slate-50 text-gray-900')}>
      <Toaster position="top-center" richColors theme={isDark ? 'dark' : 'light'} />
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled 
            ? 'py-3 bg-white/80 dark:bg-[#0d1412]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 shadow-sm' 
            : 'py-5 bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src="/agalid last version-15.svg" alt="Agalid" className="h-10 relative z-10 dark:hidden" />
                <img src="/agalid jdid-13.svg" alt="Agalid" className="h-10 relative z-10 hidden dark:block" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-white/50 dark:bg-white/5 backdrop-blur-sm px-2 py-1.5 rounded-full border border-slate-200/50 dark:border-white/5 shadow-sm">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href || (item.type === 'hash' && location.hash === item.href.replace('/', ''));
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item)}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                      isActive 
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" 
                        : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5px]")} />
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />

              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-white dark:bg-[#0A1210] flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {user.name?.split(' ')[0] || 'Compte'}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/signin"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2"
                >
                  Connexion
                </Link>
              )}

              <button 
                onClick={() => {
                  if (location.pathname !== '/') navigate('/');
                  setTimeout(() => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }} 
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Devis Gratuit
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white dark:bg-[#0d1412] z-50 md:hidden shadow-2xl border-l border-slate-200 dark:border-white/10"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Menu</span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavClick(item)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                          isActive
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Apparence</span>
                    <button 
                      onClick={toggleTheme}
                      className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white"
                    >
                      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  <Link 
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </Link>

                  <button 
                    onClick={() => {
                      if (location.pathname !== '/') navigate('/');
                      setTimeout(() => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' }), 100);
                      setIsMenuOpen(false);
                    }} 
                    className="w-full py-3 rounded-xl bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                  >
                    Devis Gratuit
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
