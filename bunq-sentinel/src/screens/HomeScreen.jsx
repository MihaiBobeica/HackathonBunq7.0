import { ShoppingBasket, TrainFront, Film, WalletCards, PiggyBank, Send, CreditCard, Landmark, Leaf, Sparkles } from 'lucide-react';

export default function HomeScreen({ onStartPayment, onForceAI }) {
  return (
    <div className="screen-enter pb-24">
      <div className="bunq-gradient text-white px-5 pt-5 pb-16 rounded-b-[2.2rem] relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-bold opacity-90">
          <span>Easy Money Account</span>
          <span className="px-2.5 py-1 rounded-full bg-white/10">NL</span>
        </div>
        <p className="text-sm opacity-85 mt-6">Total Balance</p>
        <div className="flex items-end justify-between gap-3 mt-1">
          <h2 className="text-[39px] leading-none font-black tracking-normal">EUR 12,450</h2>
          <button
            onClick={onStartPayment}
            className="w-12 h-12 rounded-2xl bg-white text-slate-950 grid place-items-center shadow-lg hover:scale-[1.03] transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-10 space-y-4 relative z-10">
        <button
          onClick={onForceAI}
          className="w-full glass rounded-3xl p-4 soft-shadow border border-white/80 text-left hover:-translate-y-0.5 transition"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white grid place-items-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-black text-slate-950">Finn Sentinel</p>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">AI ON</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ask Finn to check a suspicious payment, invoice, or marketplace chat before you send money.
              </p>
            </div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 grid place-items-center mb-4">
              <WalletCards className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-slate-500 font-bold">Main Account</p>
            <p className="font-black text-slate-950 mt-1">EUR 4,200</p>
          </div>
          <div className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm">
            <div className="w-9 h-9 rounded-2xl bg-violet-50 text-violet-600 grid place-items-center mb-4">
              <PiggyBank className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-slate-500 font-bold">Savings Goal</p>
            <p className="font-black text-slate-950 mt-1">EUR 8,250</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-950">bunq shortcuts</h3>
            <span className="text-[11px] font-bold text-slate-400">Finn ready</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: <Send className="w-5 h-5" />, label: 'Pay', onClick: onStartPayment },
              { icon: <CreditCard className="w-5 h-5" />, label: 'Cards', onClick: null },
              { icon: <Landmark className="w-5 h-5" />, label: 'Save', onClick: null },
              { icon: <Leaf className="w-5 h-5" />, label: 'Green', onClick: null },
            ].map(({ icon, label, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="h-[70px] rounded-2xl bg-slate-50 hover:bg-slate-100 grid place-items-center text-slate-800 transition"
              >
                <span className="grid place-items-center gap-1 text-[11px] font-bold">
                  {icon}{label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-950">Recent</h3>
            <button onClick={onForceAI} className="text-[11px] font-black bunq-text-gradient">Ask Finn</button>
          </div>
          <div className="space-y-4">
            {[
              { icon: <ShoppingBasket className="w-5 h-5" />, bg: 'bg-orange-50 text-orange-600', name: 'Albert Heijn', cat: 'Groceries', amount: '- EUR 34.50' },
              { icon: <TrainFront className="w-5 h-5" />, bg: 'bg-sky-50 text-sky-600', name: 'NS International', cat: 'Travel', amount: '- EUR 22.10' },
              { icon: <Film className="w-5 h-5" />, bg: 'bg-rose-50 text-rose-600', name: 'Netflix', cat: 'Subscriptions', amount: '- EUR 15.99' },
            ].map(({ icon, bg, name, cat, amount }) => (
              <div key={name} className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl ${bg} grid place-items-center shrink-0`}>{icon}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{name}</p>
                    <p className="text-[11px] text-slate-400 font-bold">{cat}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-900 font-black">{amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
