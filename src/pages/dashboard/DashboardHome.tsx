import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Zap, Sun, Battery, ArrowUpRight, ArrowDownRight, TrendingUp, Loader2 } from 'lucide-react';
import axios from 'axios';

type ColorVariantKey = 'amber' | 'blue' | 'emerald' | 'purple';

interface StatBlock {
  value: number;
  unit: string;
  trend?: number;
  source?: string;
}

interface DashboardStats {
  production: StatBlock;
  consumption: StatBlock;
  autonomy: StatBlock;
  savings: StatBlock;
}

interface ProductionPoint {
  time: string;
  prod: number;
  cons: number;
}

interface EnergyMix {
  solar: number;
  grid: number;
  battery: number;
}

const colorVariants: Record<ColorVariantKey, { bg: string; text: string; icon: string }> = {
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-400' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: 'text-blue-400' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'text-emerald-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: 'text-purple-400' },
};

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: ColorVariantKey;
  source?: string;
}

const StatCard = ({ title, value, unit, trend, icon: Icon, color, source }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorVariants[color].bg}`}>
        <Icon className={`w-6 h-6 ${colorVariants[color].icon}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
          {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="text-gray-400 text-sm">{title}</div>
        {source && <div className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">{source}</div>}
      </div>
      <div className="text-2xl font-bold text-white">
        {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
      </div>
    </div>
  </motion.div>
);

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productionData, setProductionData] = useState<ProductionPoint[]>([]);
  const [energyMix, setEnergyMix] = useState<EnergyMix | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const [statsRes, historyRes, mixRes] = await Promise.all([
          axios.get<DashboardStats>('/api/dashboard/stats', config),
          axios.get<ProductionPoint[]>('/api/dashboard/production', config),
          axios.get<EnergyMix>('/api/dashboard/mix', config)
        ]);

        setStats(statsRes.data);
        setProductionData(historyRes.data);
        setEnergyMix(mixRes.data);
      } catch (error: unknown) {
        console.error('Error fetching dashboard data:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/signin';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vue d'ensemble</h1>
          <p className="text-gray-400">Bienvenue sur votre tableau de bord énergétique</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            <option>Aujourd'hui</option>
            <option>Cette semaine</option>
            <option>Ce mois</option>
          </select>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Rapport complet
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Production Solaire" 
            value={stats.production.value} 
            unit={stats.production.unit} 
            trend={stats.production.trend} 
            icon={Sun} 
            color="amber" 
          />
          <StatCard 
            title="Consommation" 
            value={stats.consumption.value} 
            unit={stats.consumption.unit} 
            trend={stats.consumption.trend} 
            icon={Zap} 
            color="blue" 
          />
          <StatCard 
            title="Autoconsommation" 
            value={stats.autonomy.value} 
            unit={stats.autonomy.unit} 
            trend={stats.autonomy.trend} 
            icon={Battery} 
            color="emerald" 
          />
          <StatCard 
            title="Économies (est.)" 
            value={stats.savings.value} 
            unit={stats.savings.unit} 
            trend={stats.savings.trend} 
            icon={TrendingUp} 
            color="purple" 
          />
        </div>
      )}

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Production vs Consommation</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                Production
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Consommation
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="colorProdMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConsMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  unit=" kW"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="prod" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorProdMain)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="cons" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorConsMain)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Energy Mix */}
        {energyMix && (
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm h-full"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Sources d'énergie</h3>
              <div className="space-y-6">
                {[
                  { label: 'Solaire', val: energyMix.solar, color: 'bg-emerald-500' },
                  { label: 'Réseau', val: energyMix.grid, color: 'bg-blue-500' },
                  { label: 'Batterie', val: energyMix.battery, color: 'bg-purple-500' }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-medium">{item.val}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${item.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm font-medium text-emerald-400">Excellent !</div>
                    <div className="text-xs text-emerald-500/80">Vous êtes à {stats.autonomy.value}% d'autonomie aujourd'hui.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
