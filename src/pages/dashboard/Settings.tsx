import React from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
        <p className="text-slate-500 dark:text-gray-400">Gérez vos préférences et votre compte</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0A1210] border border-slate-200 dark:border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <User className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profil</h2>
          </div>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom complet</label>
              <input 
                type="text" 
                defaultValue={user.name || 'Utilisateur'} 
                disabled
                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                defaultValue={user.email || 'email@example.com'} 
                disabled
                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#0A1210] border border-slate-200 dark:border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Moon className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Apparence</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Mode sombre</div>
              <div className="text-sm text-slate-500 dark:text-gray-400">Basculer entre le thème clair et sombre</div>
            </div>
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
