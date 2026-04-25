import { motion } from 'framer-motion';
import { OctagonAlert, Sparkles, UploadCloud } from 'lucide-react';

const spring = { type: 'spring', stiffness: 420, damping: 28 };

export default function FlaggedScreen({ onUpload, onCancel, onIgnore }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="absolute inset-0 bg-black p-6 pb-7 z-20 overflow-y-auto no-scrollbar">
      <div className="rounded-[2rem] bg-[#1c1c1e] border border-white/[0.06] p-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 text-white grid place-items-center mb-5 shadow-2xl shadow-rose-500/20">
          <OctagonAlert className="w-8 h-8" />
        </div>
        <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.12em]">Warden alert</p>
        <h2 className="text-3xl font-black text-white mt-1 tracking-tight">Wait a moment</h2>
        <p className="text-sm text-white/50 mt-3 leading-relaxed font-semibold">
          This IBAN matches signals in the bunq fraud network and has no trusted history with your account.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-5">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-wide">Risk signal</p>
          <p className="text-sm font-black text-white mt-1">New beneficiary</p>
        </div>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-5">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-wide">Amount</p>
          <p className="text-sm font-black text-white mt-1">High for first payment</p>
        </div>
      </div>

      <div className="mt-4 rounded-[2rem] bg-[#1c1c1e] border border-white/[0.06] p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-3xl bg-emerald-500/20 grid place-items-center shrink-0">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-black text-white">Let Warden double-check</h3>
            <p className="text-xs text-white/50 mt-1 leading-relaxed font-semibold">
              Add screenshots, invoices, or chat messages related to this transfer.
            </p>
          </div>
        </div>
        <motion.button onClick={onUpload} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="mt-6 w-full bunq-cta-green py-5 rounded-3xl text-sm font-black flex justify-center items-center gap-2">
          <UploadCloud className="w-5 h-5" />Upload context
        </motion.button>
      </div>

      <div className="mt-6 space-y-3">
        <motion.button onClick={onCancel} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full bg-[#1c1c1e] border border-white/[0.06] text-white font-black py-5 rounded-3xl">
          Cancel payment
        </motion.button>
        <button onClick={onIgnore} className="w-full text-sm text-white/40 font-black py-3 hover:text-white/70 transition">
          Ignore and continue
        </button>
      </div>
    </motion.div>
  );
}
