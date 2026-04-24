import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const spring = { type: 'spring', stiffness: 420, damping: 28 };

export default function SuccessScreen({ amount, recipient, trusted, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={spring} className="absolute inset-0 bg-slate-50 z-[60] flex flex-col items-center justify-center p-8 text-center">
      <motion.div initial={{ scale: 0.72 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-400 via-cyan-500 to-sky-500 grid place-items-center mb-7 shadow-2xl shadow-cyan-200">
        <CheckCircle className="w-12 h-12 text-white" strokeWidth={1.8} />
      </motion.div>

      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Payment confirmed</p>
      <h2 className="text-4xl font-black text-slate-900 tracking-tight">{amount || 'Sent'}</h2>

      {recipient && (
        <p className="text-sm text-slate-500 mt-3 font-bold">{recipient}</p>
      )}

      {trusted && (
        <span className="mt-5 text-[11px] font-black text-violet-600 bg-violet-50 px-4 py-2 rounded-full">
          IBAN marked as trusted
        </span>
      )}

      <motion.button onClick={onDone} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="mt-11 w-full bunq-gradient text-white font-black py-5 rounded-3xl rainbow-shadow">
        Done
      </motion.button>

      <div className="mt-6 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bunq-gradient rounded-full" style={{ animation: 'progress-bar 2.8s linear forwards' }} />
      </div>

      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </motion.div>
  );
}
