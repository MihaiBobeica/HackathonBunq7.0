import { motion } from 'framer-motion';
import { ShieldCheck, FileSearch, Send, Shield, WandSparkles } from 'lucide-react';

const FLAGGED_IBAN = 'NL99 BUNQ 0123 4567 89';
const spring = { type: 'spring', stiffness: 420, damping: 28 };

export default function PaymentScreen({
  iban, setIban,
  amount, setAmount,
  description, setDescription,
  onSend,
  onForceAI,
}) {
  function fillDemo() {
    setIban(FLAGGED_IBAN);
    setAmount('EUR 1,500.00');
    setDescription('Marketplace deposit');
  }

  const inputCls = 'mt-2 w-full p-5 rounded-3xl bg-white text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-pink-400 outline-none font-extrabold soft-shadow';

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="p-6 pb-10 bg-slate-50">
      <div className="rounded-[2rem] bg-white p-6 mb-6 soft-shadow-lg relative overflow-hidden">
        <div className="absolute -right-12 -top-14 h-36 w-36 rounded-full bg-gradient-to-br from-orange-300 via-pink-300 to-sky-300 blur-2xl opacity-60" />
        <div className="flex items-center justify-between gap-3 relative">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">bunqAI safety scan</p>
            <h2 className="text-2xl font-black text-slate-900 mt-1">New payment</h2>
          </div>
          <motion.button
            onClick={fillDemo}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            className="h-11 px-4 rounded-3xl bunq-gradient text-white text-xs font-black flex items-center gap-1.5 rainbow-shadow"
          >
            <WandSparkles className="w-4 h-4" />Demo
          </motion.button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-3xl bg-emerald-50 p-4 text-emerald-600">
            <ShieldCheck className="w-5 h-5 mb-2" />
            <p className="text-[11px] font-black leading-tight">IBAN reputation</p>
          </div>
          <div className="rounded-3xl bg-violet-50 p-4 text-violet-600">
            <FileSearch className="w-5 h-5 mb-2" />
            <p className="text-[11px] font-black leading-tight">Context check</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">To IBAN</span>
          <input type="text" value={iban} onChange={e => setIban(e.target.value)} placeholder="NL99 BUNQ 0000 0000 00" className={`${inputCls} text-sm`} />
        </label>
        <label className="block">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">Amount</span>
          <input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="EUR 0.00" className={`${inputCls} text-2xl tracking-normal`} />
        </label>
        <label className="block">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">Description</span>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Invoice, marketplace item, rent..." className={`${inputCls} text-sm`} />
        </label>
      </div>

      <div className="mt-8 space-y-3">
        <motion.button onClick={onSend} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full bunq-gradient text-white font-black py-5 rounded-3xl rainbow-shadow flex justify-center items-center gap-2">
          <Send className="w-5 h-5" />Send payment
        </motion.button>
        <motion.button onClick={onForceAI} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full bg-white text-slate-700 font-black py-5 rounded-3xl soft-shadow flex justify-center items-center gap-2">
          <Shield className="w-5 h-5" />Warden proactive check
        </motion.button>
      </div>
    </motion.div>
  );
}
