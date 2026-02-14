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
import { Zap, Sun, Battery, ArrowUpRight, ArrowDownRight, TrendingUp, Loader2, CloudSun, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

type ColorVariantKey = 'amber' | 'blue' | 'emerald' | 'purple' | 'cyan';

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

interface WeatherForecast {
  time: string;
  irradiance: number;
}

const colorVariants: Record<ColorVariantKey, { bg: string; text: string; icon: string }> = {
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-400' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: 'text-blue-400' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'text-emerald-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: 'text-purple-400' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', icon: 'text-cyan-400' },
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
  const [weather, setWeather] = useState<WeatherForecast[] | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        const [statsRes, historyRes, mixRes, weatherRes] = await Promise.all([
          api.get<DashboardStats>('/dashboard/stats'),
          api.get<ProductionPoint[]>('/dashboard/production'),
          api.get<EnergyMix>('/dashboard/mix'),
          api.get<WeatherForecast[]>('/dashboard/weather')
        ]);

        setStats(statsRes.data);
        setProductionData(historyRes.data);
        setEnergyMix(mixRes.data);
        setWeather(weatherRes.data);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401) {
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vue d'ensemble</h1>
          <p className="text-slate-500 dark:text-gray-400">Bienvenue sur votre tableau de bord énergétique</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => navigate('/dashboard/admin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <ShieldCheck className="w-4 h-4" />
              Panel Admin
            </button>
          )}
          <select className="bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            <option>Aujourd'hui</option>
            <option>Cette semaine</option>
            <option>Ce mois</option>
          </select>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
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
            source={stats.production.source}
          />
          <StatCard 
            title="Consommation" 
            value={stats.consumption.value} 
            unit={stats.consumption.unit} 
            trend={stats.consumption.trend} 
            icon={Zap} 
            color="blue" 
            source={stats.consumption.source}
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
      
      {/* Chart Area (Simplified for brevity, assuming existing AreaChart code is similar or I can just include it if I read it fully, which I did) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-6">Production vs Consommation</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} unit=" kW" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="prod" name="Production" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)" />
                <Area type="monotone" dataKey="cons" name="Consommation" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCons)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-6">Mix Énergétique</h2>
          {energyMix && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Solaire</span>
                  <span className="text-emerald-400 font-medium">{energyMix.solar}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${energyMix.solar}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Réseau (Sonelgaz)</span>
                  <span className="text-blue-400 font-medium">{energyMix.grid}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${energyMix.grid}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Batterie</span>
                  <span className="text-purple-400 font-medium">{energyMix.battery}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${energyMix.battery}%` }}
                    className="h-full bg-purple-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
