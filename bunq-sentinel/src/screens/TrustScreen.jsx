import { motion } from 'framer-motion';
import { ShieldAlert, BookmarkCheck, Clock3 } from 'lucide-react';

const spring = { type: 'spring', stiffness: 420, damping: 28 };

export default function TrustScreen({ onTrust, onOnce, onBack }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="absolute inset-0 bg-slate-50 p-6 z-50 flex flex-col justify-center">
      <div className="text-center mb-7 shrink-0">
        <div className="w-18 h-18 rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white grid place-items-center mx-auto mb-5 shadow-2xl shadow-orange-200">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">Final confirmation</p>
        <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">Proceed anyway?</h2>
        <p className="text-sm text-slate-500 mt-2 font-semibold">Warden will remember your choice for this beneficiary.</p>
      </div>

      <div className="space-y-4 shrink-0">
        <motion.button onClick={onTrust} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full bg-white text-slate-900 p-6 rounded-[2rem] text-left soft-shadow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-3xl bunq-gradient text-white grid place-items-center shrink-0 rainbow-shadow">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-lg text-slate-900">Trust IBAN</div>
              <div className="text-xs mt-1 text-slate-500 font-semibold">Save account and reduce future warnings.</div>
            </div>
          </div>
        </motion.button>

        <motion.button onClick={onOnce} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full bg-white text-slate-900 p-6 rounded-[2rem] text-left soft-shadow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-3xl bg-slate-100 text-slate-600 grid place-items-center shrink-0 shadow-xl shadow-slate-200">
              <Clock3 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-lg text-slate-900">Continue once</div>
              <div className="text-xs mt-1 text-slate-500 font-semibold">Keep Warden warnings for later payments.</div>
            </div>
          </div>
        </motion.button>

        <button onClick={onBack} className="w-full text-slate-400 font-black py-3 hover:text-slate-700 transition">
          Go back
        </button>
      </div>
    </motion.div>
  );
}
