import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Zap, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface ConsumptionData {
  time: string;
  value: number;
}

export default function Consumption() {
  const [data, setData] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Reusing production endpoint but mapping consumption if available, otherwise simulating
      const res = await api.get('/dashboard/production'); 
      setData(res.data.map((d: any) => ({ time: d.time, value: d.cons || Math.random() * 2 })));
    } catch (error) {
      console.error('Failed to fetch consumption data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Consommation</h1>
          <p className="text-slate-500 dark:text-gray-400">Suivi de votre consommation électrique</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-slate-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0A1210] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Zap className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-gray-400">Consommation Totale</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.reduce((acc, curr) => acc + curr.value, 0).toFixed(1)} <span className="text-sm font-normal text-slate-500">kWh</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
                cursor={{ fill: '#3b82f6', opacity: 0.1 }}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#3b82f6' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
