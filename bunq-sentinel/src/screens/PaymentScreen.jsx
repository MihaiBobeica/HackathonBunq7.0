import { motion } from 'framer-motion';
import { ShieldCheck, FileSearch, Send, Shield, Loader2 } from 'lucide-react';

const DEMO_IBAN = 'NL99 BUNQ 0123 4567 89';
const spring = { type: 'spring', stiffness: 420, damping: 28 };

export default function PaymentScreen({
  iban, setIban,
  amount, setAmount,
  description, setDescription,
  onSend,
  onForceAI,
  sending = false,
}) {
  function fillDemo() {
    setIban(DEMO_IBAN);
    setAmount('1500,00');
    setDescription('Marketplace deposit');
  }

  const labelCls = 'text-[10px] font-black uppercase tracking-[0.12em]';
  const inputCls = 'mt-2 w-full p-5 rounded-3xl bg-[#1c1c1e] text-white placeholder-white/30 border border-white/[0.06] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/30 outline-none font-extrabold transition';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="p-6 pb-10 bg-black min-h-full"
    >
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <p className={`${labelCls} text-white/40`}>bunq AI safety scan</p>
          <h2 className="text-3xl font-black text-white mt-1 tracking-tight">New payment</h2>
        </div>
        <button
          onClick={fillDemo}
          className="text-[11px] font-black text-white/50 hover:text-white/80 transition px-3 py-2 rounded-full"
        >
          Demo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-4">
          <ShieldCheck className="w-5 h-5 mb-2 text-emerald-400" />
          <p className="text-[11px] font-black leading-tight text-emerald-400">IBAN reputation</p>
        </div>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-4">
          <FileSearch className="w-5 h-5 mb-2 text-emerald-400" />
          <p className="text-[11px] font-black leading-tight text-emerald-400">Context check</p>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className={`${labelCls} text-white/40`}>To IBAN</span>
          <input
            type="text"
            value={iban}
            onChange={e => setIban(e.target.value)}
            placeholder="NL99 BUNQ 0000 0000 00"
            className={`${inputCls} text-sm`}
          />
        </label>
        <label className="block">
          <span className={`${labelCls} text-white/40`}>Amount</span>
          <input
            type="text"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0,00"
            className={`${inputCls} text-2xl tracking-normal`}
          />
        </label>
        <label className="block">
          <span className={`${labelCls} text-white/40`}>Description</span>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Invoice, marketplace item, rent..."
            className={`${inputCls} text-sm`}
          />
        </label>
      </div>

      <div className="mt-8 space-y-3">
        <motion.button
          onClick={onSend}
          disabled={sending}
          whileHover={!sending ? { y: -3 } : undefined}
          whileTap={!sending ? { scale: 0.98 } : undefined}
          transition={spring}
          className={`w-full bunq-pay-pill text-white font-black py-5 rounded-3xl flex justify-center items-center gap-2 ${sending ? 'opacity-70' : ''}`}
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {sending ? 'Checking...' : 'Send payment'}
        </motion.button>
        <motion.button
          onClick={onForceAI}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          className="w-full bg-[#1c1c1e] border border-white/[0.06] text-white font-black py-5 rounded-3xl flex justify-center items-center gap-2"
        >
          <Shield className="w-5 h-5" />Warden proactive check
        </motion.button>
      </div>
    </motion.div>
  );
}
