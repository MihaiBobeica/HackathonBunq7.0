import { AudioLines, ShieldCheck, PhoneCall, FileSearch, Send, Shield, WandSparkles } from 'lucide-react';

const FLAGGED_IBAN = 'NL99 BUNQ 0123 4567 89';

export default function PaymentScreen({
  iban, setIban,
  amount, setAmount,
  description, setDescription,
  isAudioListening,
  onSend,
  onForceAI,
}) {
  function fillDemo() {
    setIban(FLAGGED_IBAN);
    setAmount('EUR 1,500.00');
    setDescription('Marketplace deposit');
  }

  return (
    <div className="screen-enter p-5 pb-24">
      {isAudioListening && (
        <div className="mb-4 rounded-3xl bg-emerald-50 border border-emerald-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white grid place-items-center">
              <AudioLines className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-emerald-950">Finn Sentinel active</p>
              <p className="text-xs text-emerald-800 mt-0.5">Ambient call pressure is being checked.</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase">bunqAI safety scan</p>
            <h2 className="text-xl font-black text-slate-950 mt-1">New payment</h2>
          </div>
          <button
            onClick={fillDemo}
            className="h-10 px-3 rounded-2xl bg-slate-950 text-white text-xs font-black flex items-center gap-1.5 hover:bg-slate-800 transition"
          >
            <WandSparkles className="w-4 h-4" />Demo
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">
            <ShieldCheck className="w-4 h-4 mb-2" />
            <p className="text-[10px] font-black leading-tight">IBAN reputation</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-800">
            <PhoneCall className="w-4 h-4 mb-2" />
            <p className="text-[10px] font-black leading-tight">Call pressure</p>
          </div>
          <div className="rounded-2xl bg-violet-50 p-3 text-violet-800">
            <FileSearch className="w-4 h-4 mb-2" />
            <p className="text-[10px] font-black leading-tight">Context check</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-[11px] font-black text-slate-500 uppercase">To IBAN</span>
          <input
            type="text"
            value={iban}
            onChange={e => setIban(e.target.value)}
            placeholder="NL99 BUNQ 0000 0000 00"
            className="mt-1 w-full p-4 rounded-3xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-black text-slate-500 uppercase">Amount</span>
          <input
            type="text"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="EUR 0.00"
            className="mt-1 w-full p-4 rounded-3xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-pink-500 outline-none text-2xl font-black tracking-normal"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-black text-slate-500 uppercase">Description</span>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Invoice, marketplace item, rent..."
            className="mt-1 w-full p-4 rounded-3xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold"
          />
        </label>
      </div>

      <div className="mt-7 space-y-3">
        <button
          onClick={onSend}
          className="w-full bunq-gradient text-white font-black py-4 rounded-3xl shadow-lg hover:opacity-95 transition flex justify-center items-center gap-2"
        >
          <Send className="w-5 h-5" />Send payment
        </button>
        <button
          onClick={onForceAI}
          className="w-full bg-white border border-slate-200 text-slate-800 font-black py-4 rounded-3xl hover:bg-slate-50 transition flex justify-center items-center gap-2 shadow-sm"
        >
          <Shield className="w-5 h-5" />Finn proactive check
        </button>
      </div>
    </div>
  );
}
