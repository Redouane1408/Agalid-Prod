import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { Sun, Calendar, Download, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface ProductionData {
  time: string;
  value: number;
}

export default function Production() {
  const [data, setData] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('day'); // day, week, month

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real scenario, you'd pass the period to the API
      // const res = await api.get(`/dashboard/production?period=${period}`);
      const res = await api.get('/dashboard/production'); 
      setData(res.data.map((d: any) => ({ time: d.time, value: d.prod })));
    } catch (error) {
      console.error('Failed to fetch production data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Production Solaire</h1>
          <p className="text-slate-500 dark:text-gray-400">Analyse détaillée de votre production énergétique</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white dark:bg-white/5 rounded-lg p-1 border border-slate-200 dark:border-white/10">
            {['day', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === p 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchData}
            className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-slate-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0A1210] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Sun className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-gray-400">Production Totale</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.reduce((acc, curr) => acc + curr.value, 0).toFixed(1)} <span className="text-sm font-normal text-slate-500">kWh</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value} kW`} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#f59e0b' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#f59e0b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorProd)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
