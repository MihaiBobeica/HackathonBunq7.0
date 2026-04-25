import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { motion } from 'framer-motion';
import { TriangleAlert, ShieldAlert, Ban } from 'lucide-react';

ChartJS.register(ArcElement);

const spring = { type: 'spring', stiffness: 420, damping: 28 };

function riskLevel(score) {
  if (score >= 85) return { label: 'Critical', color: '#fb7185', bg: 'bg-rose-500/10',    text: 'text-rose-400',    arc: '#fb7185' };
  if (score >= 60) return { label: 'High',     color: '#fb923c', bg: 'bg-orange-500/10',  text: 'text-orange-400',  arc: '#fb923c' };
  if (score >= 35) return { label: 'Medium',   color: '#fbbf24', bg: 'bg-amber-500/10',   text: 'text-amber-400',   arc: '#fbbf24' };
  return               { label: 'Low',         color: '#34d399', bg: 'bg-emerald-500/10', text: 'text-emerald-400', arc: '#34d399' };
}

export default function AnalysisResultScreen({ score, reasons, onStop, onContinue }) {
  const level = riskLevel(score);

  const chartData = {
    datasets: [{
      data: [score, 100 - score],
      backgroundColor: [level.arc, 'rgba(255,255,255,0.08)'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    circumference: 280,
    rotation: 220,
    plugins: { tooltip: { enabled: false } },
    animation: { animateScale: true, duration: 650 },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="absolute inset-0 bg-black p-6 z-40 overflow-y-auto no-scrollbar">
      <div className="rounded-[2rem] bg-[#1c1c1e] border border-white/[0.06] p-6 text-center">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.12em]">bunq AI Warden</p>
        <h2 className="text-3xl font-black mt-1 bunq-text-gradient tracking-tight">Scam risk found</h2>
        <div className="relative w-[176px] h-[176px] mx-auto mt-6">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
            <span className={`text-4xl font-black ${level.text}`}>{level.label}</span>
            <span className="text-[10px] font-black text-white/40 uppercase mt-1">risk level</span>
          </div>
        </div>
      </div>

      <div className={`mt-5 rounded-[2rem] p-6 ${level.bg} border border-white/[0.06]`}>
        <div className="flex items-center gap-2 mb-4">
          <TriangleAlert className={`w-5 h-5 ${level.text}`} />
          <h3 className={`text-sm font-black ${level.text}`}>Warden findings</h3>
        </div>
        <ul className="space-y-3">
          {reasons.map((r, i) => (
            <li key={i} className="flex gap-3 text-xs text-white/80 font-bold leading-relaxed">
              <span className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: level.color }} />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-[2rem] bg-[#1c1c1e] border border-white/[0.06] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-wide">Recommendation</p>
            <p className="font-black text-white mt-1">Do not proceed with this payment</p>
          </div>
          <div className="w-12 h-12 rounded-3xl bg-rose-500/20 grid place-items-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 pb-2">
        <motion.button onClick={onStop} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full bg-gradient-to-br from-rose-500 to-orange-500 text-white font-black py-5 rounded-3xl shadow-2xl shadow-rose-500/20 flex justify-center items-center gap-2">
          <Ban className="w-5 h-5" />Stop payment
        </motion.button>
        <motion.button onClick={onContinue} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full bg-[#1c1c1e] border border-white/[0.06] text-white/60 font-black py-5 rounded-3xl text-sm">
          Continue at own risk
        </motion.button>
      </div>
    </motion.div>
  );
}
