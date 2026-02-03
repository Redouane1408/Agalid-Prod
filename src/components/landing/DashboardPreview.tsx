import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Sun, Battery, Zap, Home, Bell, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const data = [
  { time: '06:00', prod: 0, cons: 20 },
  { time: '08:00', prod: 15, cons: 40 },
  { time: '10:00', prod: 45, cons: 35 },
  { time: '12:00', prod: 85, cons: 30 },
  { time: '14:00', prod: 75, cons: 25 },
  { time: '16:00', prod: 50, cons: 35 },
  { time: '18:00', prod: 20, cons: 55 },
  { time: '20:00', prod: 0, cons: 60 },
];

export default function DashboardPreview() {
  return (
    <section className="bg-white dark:bg-[#050b09] py-24 relative overflow-hidden transition-colors duration-500">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Interface de Pilotage</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Le contrôle total <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">au bout des doigts</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Visualisez votre production, surveillez votre consommation et optimisez votre indépendance énergétique en temps réel.
          </motion.p>
        </div>

        {/* Dashboard Mockup Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-5xl"
          style={{ perspective: '1000px' }}
        >
          <div className="bg-white/90 dark:bg-[#0A1210]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 transform transition-transform duration-500 hover:scale-[1.01]">
            {/* Header Mockup */}
            <div className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2" />
                <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Agalid Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                <Search className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                <Bell className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
              </div>
            </div>

            {/* Main Content Mockup */}
            <div className="flex h-[500px]">
              {/* Sidebar */}
              <div className="w-20 border-r border-slate-200 dark:border-white/5 flex flex-col items-center py-6 gap-8 bg-slate-50 dark:bg-white/2">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <Home className="w-5 h-5" />
                </div>
                <div className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-gray-500 transition-colors">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-gray-500 transition-colors">
                  <Battery className="w-5 h-5" />
                </div>
                <div className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-gray-500 transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="flex-1 p-8 overflow-hidden bg-slate-50 dark:bg-[#0A1210]">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {/* Stat Card 1 */}
                  <div className="bg-white dark:bg-[#0f1915] p-5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-colors group shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sun className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> +12%
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">24.5 kWh</div>
                    <div className="text-xs text-slate-500 dark:text-gray-500">Production du jour</div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="bg-white dark:bg-[#0f1915] p-5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 transition-colors group shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Battery className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" /> 98%
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">13.2 kWh</div>
                    <div className="text-xs text-slate-500 dark:text-gray-500">Stocké (Batterie)</div>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="bg-white dark:bg-[#0f1915] p-5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-orange-500/30 transition-colors group shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        <Home className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" /> -5%
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">8.4 kWh</div>
                    <div className="text-xs text-slate-500 dark:text-gray-500">Consommation Réseau</div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-white dark:bg-[#0f1915] p-6 rounded-xl border border-slate-200 dark:border-white/5 h-[280px] shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-900 dark:text-white font-medium">Performance Temps Réel</h3>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> Production
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-cyan-500/30" /> Consommation
                      </div>
                    </div>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a2321', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="prod" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProd)" />
                        <Area type="monotone" dataKey="cons" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorCons)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements for Depth */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-12 top-20 bg-white/90 dark:bg-[#1a2c26] p-4 rounded-xl border border-slate-200 dark:border-emerald-500/20 shadow-xl backdrop-blur-md hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-gray-400">Économie (7j)</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">45.20 €</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-12 bottom-32 bg-white/90 dark:bg-[#1a2c26] p-4 rounded-xl border border-slate-200 dark:border-cyan-500/20 shadow-xl backdrop-blur-md hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Battery className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-gray-400">Autonomie</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">12h 30m</div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
