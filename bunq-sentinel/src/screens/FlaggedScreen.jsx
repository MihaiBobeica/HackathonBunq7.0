import { motion } from 'framer-motion';
import { OctagonAlert, Sparkles, UploadCloud } from 'lucide-react';

const spring = { type: 'spring', stiffness: 420, damping: 28 };

export default function FlaggedScreen({ onUpload, onCancel, onIgnore }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="absolute inset-0 bg-slate-50 p-6 pb-7 z-20 overflow-y-auto no-scrollbar">
      <div className="rounded-[2rem] bg-white p-6 soft-shadow-lg">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 text-white grid place-items-center mb-5 shadow-2xl shadow-rose-200">
          <OctagonAlert className="w-8 h-8" />
        </div>
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.12em]">Warden alert</p>
        <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">Wait a moment</h2>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed font-semibold">
          This IBAN matches signals in the bunq fraud network and has no trusted history with your account.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white p-5 soft-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Risk signal</p>
          <p className="text-sm font-black text-slate-900 mt-1">New beneficiary</p>
        </div>
        <div className="rounded-3xl bg-white p-5 soft-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Amount</p>
          <p className="text-sm font-black text-slate-900 mt-1">High for first payment</p>
        </div>
      </div>

      <div className="mt-4 rounded-[2rem] bg-white p-6 soft-shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-3xl bunq-gradient text-white grid place-items-center shrink-0 rainbow-shadow">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900">Let Warden double-check</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
              Add screenshots, invoices, or chat messages related to this transfer.
            </p>
          </div>
        </div>
        <motion.button onClick={onUpload} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="mt-6 w-full bunq-gradient text-white py-5 rounded-3xl text-sm font-black flex justify-center items-center gap-2 rainbow-shadow">
          <UploadCloud className="w-5 h-5" />Upload context
        </motion.button>
      </div>

      <div className="mt-6 space-y-3">
        <motion.button onClick={onCancel} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full bg-white text-slate-900 font-black py-5 rounded-3xl soft-shadow">
          Cancel payment
        </motion.button>
        <button onClick={onIgnore} className="w-full text-sm text-slate-400 font-black py-3 hover:text-slate-700 transition">
          Ignore and continue
        </button>
      </div>
    </motion.div>
  );
}
