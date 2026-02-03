import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: {
    id: string;
    name: string;
    color: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  } | null;
  onConnect: (apiKey: string) => Promise<void>;
}

export default function ConnectModal({ isOpen, onClose, integration, onConnect }: ConnectModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const finalKey = integration?.id === 'meteo' ? 'public-access' : apiKey;
      await onConnect(finalKey);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setApiKey('');
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Une erreur est survenue lors de la connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !integration) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-[#0A1210] border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full relative overflow-hidden shadow-2xl"
        >
          {/* Background Glow */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none mix-blend-multiply dark:mix-blend-normal"
            style={{ backgroundColor: integration.color }}
          />

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                <integration.icon className="w-6 h-6" style={{ color: integration.color }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connecter {integration.name}</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">Synchronisez vos données en temps réel</p>
              </div>
            </div>

            {success ? (
              <div className="py-8 flex flex-col items-center justify-center text-emerald-500 dark:text-emerald-400">
                <CheckCircle className="w-16 h-16 mb-4 animate-bounce" />
                <p className="text-lg font-semibold">Connexion réussie !</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {integration.id === 'meteo' ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Ce service utilise les données publiques d'OpenMeteo pour prévoir votre production solaire. Aucune clé API n'est requise.
                    </p>
                    <input type="hidden" value="public-access" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                      Clé API / Token d'accès
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Entrez votre clé ${integration.name}...`}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                      Vos identifiants sont chiffrés et stockés de manière sécurisée.
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    integration.id === 'meteo' ? 'Activer le service' : 'Connecter le service'
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
