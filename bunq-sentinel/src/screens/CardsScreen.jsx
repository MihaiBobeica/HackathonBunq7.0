import { CreditCard, Lock, Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Zap, Car } from 'lucide-react';
import { useState } from 'react';

const CARDS = [
  { gradient: 'from-indigo-600 via-purple-600 to-violet-700', last4: '1234', type: 'Mastercard', label: 'Main', limit: '€ 5,000', spent: '€ 1,240', frozen: false },
  { gradient: 'from-orange-500 via-rose-500 to-pink-600',     last4: '5678', type: 'Visa',       label: 'Shopping', limit: '€ 1,000', spent: '€ 340', frozen: false },
  { gradient: 'from-emerald-500 via-teal-500 to-cyan-600',    last4: '9012', type: 'Mastercard', label: 'Travel',   limit: '€ 3,000', spent: '€ 0',   frozen: true  },
];

const CARD_TXS = [
  { icon: <ShoppingBag className="w-4 h-4" />, bg: 'bg-violet-500/15 text-violet-400', name: 'Zara',          sub: 'Shopping',    amount: '- €89.95',  time: '2h ago'  },
  { icon: <Coffee       className="w-4 h-4" />, bg: 'bg-amber-500/15 text-amber-400',  name: 'Starbucks',     sub: 'Food & drink', amount: '- €6.40',   time: '5h ago'  },
  { icon: <Zap          className="w-4 h-4" />, bg: 'bg-cyan-500/15 text-cyan-400',    name: 'Vattenfall',    sub: 'Utilities',   amount: '- €112.00', time: 'Yesterday' },
  { icon: <Car          className="w-4 h-4" />, bg: 'bg-blue-500/15 text-blue-400',    name: 'Shell',         sub: 'Transport',   amount: '- €65.00',  time: '2 days'  },
  { icon: <ShoppingBag  className="w-4 h-4" />, bg: 'bg-rose-500/15 text-rose-400',    name: 'H&M',           sub: 'Shopping',    amount: '- €44.99',  time: '3 days'  },
];

export default function CardsScreen() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hidden, setHidden] = useState(true);
  const card = CARDS[activeIdx];
  const barPct = Math.round((parseFloat(card.spent.replace(/[^0-9]/g, '')) / parseFloat(card.limit.replace(/[^0-9]/g, ''))) * 100) || 0;

  return (
    <div className="screen-enter pb-8">
      {/* Card carousel */}
      <div className="pt-5 px-5 mb-5">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {CARDS.map(({ gradient, last4, type, label, frozen }, i) => (
            <button
              key={last4}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`shrink-0 w-[230px] h-[135px] rounded-3xl bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between shadow-xl relative overflow-hidden transition ${activeIdx === i ? 'ring-2 ring-white/40 scale-[1.02]' : 'opacity-70'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between relative">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</span>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">{type}</span>
              </div>
              <div className="relative">
                {frozen && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 bg-black/40 rounded-xl px-3 py-1.5">
                      <Lock className="w-3.5 h-3.5 text-white" />
                      <span className="text-[10px] font-black text-white">Frozen</span>
                    </div>
                  </div>
                )}
                <CreditCard className="w-5 h-5 text-white/50 mb-1" />
                <p className="text-white font-black text-sm tracking-[0.18em]">•••• {last4}</p>
                <p className="text-[10px] text-white/50 mt-0.5 font-semibold uppercase tracking-widest">John Doe · 09/28</p>
              </div>
            </button>
          ))}
          <button className="shrink-0 w-[100px] h-[135px] rounded-3xl border border-dashed border-white/15 flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/50 hover:border-white/25 transition">
            <Plus className="w-6 h-6" />
            <span className="text-[10px] font-bold">New card</span>
          </button>
        </div>
      </div>

      {/* Card details */}
      <div className="px-5 mb-5">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white/35 uppercase tracking-[0.12em]">Spent this month</p>
              <p className="text-2xl font-black text-white mt-1">{hidden ? '• • • • •' : card.spent}</p>
            </div>
            <button
              type="button"
              onClick={() => setHidden(h => !h)}
              className="w-10 h-10 rounded-2xl bg-white/[0.06] text-white/50 grid place-items-center hover:bg-white/10 transition"
            >
              {hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-bold text-white/35 mb-1.5">
              <span>Limit: {card.limit}</span>
              <span>{barPct}% used</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                style={{ width: `${barPct}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-3 rounded-2xl bg-white/[0.06] text-white font-black text-[12px] hover:bg-white/10 transition flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> {card.frozen ? 'Unfreeze' : 'Freeze'}
            </button>
            <button className="py-3 rounded-2xl bg-white/[0.06] text-white font-black text-[12px] hover:bg-white/10 transition flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" /> Details
            </button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5">
        <h3 className="text-sm font-black text-white mb-3">Card transactions</h3>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] overflow-hidden">
          {CARD_TXS.map(({ icon, bg, name, sub, amount, time }, i) => (
            <div key={name} className={`flex items-center gap-3 px-4 py-3.5 ${i < CARD_TXS.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl ${bg} grid place-items-center shrink-0`}>{icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white">{name}</p>
                <p className="text-[11px] text-white/35 font-bold">{sub}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-white">{amount}</p>
                <p className="text-[10px] text-white/35 font-bold mt-0.5">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
