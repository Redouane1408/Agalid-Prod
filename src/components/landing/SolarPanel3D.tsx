import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Sun, Battery, Zap, TrendingUp } from 'lucide-react';

export default function SolarPanel3D() {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="w-full max-w-[500px] mx-auto" style={{ perspective: "1000px" }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full aspect-[4/5] transition-all duration-200 ease-out"
      >
        {/* Back Glow */}
      <div 
        className="absolute inset-4 bg-[var(--color-primary)] rounded-3xl blur-[60px] opacity-40 -z-10" 
        style={{ transform: "translateZ(-50px)" }}
      />

      {/* Main Image Card */}
      <div 
        className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl"
        style={{ transform: "translateZ(0px)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img 
          src="/solar_pane.png" 
          alt="Installation Solaire Agalid" 
          className="w-full h-full object-cover"
        />
        
        {/* Card Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-emerald-400 font-medium tracking-wider text-sm uppercase">Système Actif</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Smart Solar Panel</h3>
          <p className="text-slate-300 text-sm">Technologie monocristalline haute efficacité pour une production maximale en Algérie.</p>
        </div>
      </div>

      {/* Floating Stat 1: Production */}
      <motion.div 
        style={{ transform: "translateZ(75px)" }}
        className="absolute -right-6 top-12 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl w-48"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
            <Sun className="w-4 h-4" />
          </div>
          <span className="text-slate-200 text-xs font-medium">Production</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">4.2</span>
          <span className="text-slate-400 text-sm">kWc</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1 mt-3">
          <div className="bg-orange-500 w-[85%] h-full rounded-full" />
        </div>
      </motion.div>

      {/* Floating Stat 2: Savings */}
      <motion.div 
        style={{ transform: "translateZ(50px)" }}
        className="absolute -left-6 bottom-32 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl w-48"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-slate-200 text-xs font-medium">Économies</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">12,500</span>
          <span className="text-slate-400 text-sm">DZD</span>
        </div>
        <p className="text-emerald-400 text-xs mt-1">+15% ce mois</p>
      </motion.div>

      {/* Floating Stat 3: Battery */}
      <motion.div 
        style={{ transform: "translateZ(25px)" }}
        className="absolute right-8 bottom-[-20px] p-3 rounded-xl bg-[#0d1412] border border-slate-800 shadow-xl flex items-center gap-3"
      >
        <div className="relative">
          <Battery className="w-5 h-5 text-blue-400" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <div>
          <div className="text-white text-xs font-bold">Stockage</div>
          <div className="text-slate-400 text-[10px]">98% Chargé</div>
        </div>
      </motion.div>

    </motion.div>
    </div>
  );
}
