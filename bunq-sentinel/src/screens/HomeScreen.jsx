import {
  WalletCards, PiggyBank, ShoppingBasket, Film,
  ArrowUp, ArrowDown, Plus, Sparkles, CreditCard,
  TrendingUp,
} from 'lucide-react';

const ACCOUNTS = [
  {
    label: 'Main Account',
    amount: '€ 4,200.00',
    sub: 'NL99 BUNQ 1234 5678 90',
    icon: <WalletCards className="w-5 h-5" />,
    iconBg: 'bg-orange-500/20 text-orange-400',
  },
  {
    label: 'Savings Goal',
    amount: '€ 8,250.00',
    sub: 'New Car',
    icon: <PiggyBank className="w-5 h-5" />,
    iconBg: 'bg-violet-500/20 text-violet-400',
  },
];

const VIRTUAL_CARDS = [
  { gradient: 'from-indigo-600 via-purple-600 to-violet-700', last4: '1234', type: 'Mastercard' },
  { gradient: 'from-orange-500 via-rose-500 to-pink-600',     last4: '5678', type: 'Visa'       },
  { gradient: 'from-emerald-500 via-teal-500 to-cyan-600',    last4: '9012', type: 'Mastercard' },
];

const TRANSACTIONS = [
  {
    icon: <ShoppingBasket className="w-5 h-5" />,
    bg: 'bg-orange-500/15 text-orange-400',
    name: 'Albert Heijn',
    cat: 'Groceries',
    amount: '- €34.50',
  },
  {
    icon: <Film className="w-5 h-5" />,
    bg: 'bg-rose-500/15 text-rose-400',
    name: 'Anthropic',
    cat: 'Subscriptions',
    amount: '- €19.99',
  },
];

const QUICK_ACTIONS = [
  { label: 'Pay',     icon: <ArrowUp   className="w-6 h-6" />, color: 'bg-orange-500 shadow-orange-500/30' },
  { label: 'Request', icon: <ArrowDown className="w-6 h-6" />, color: 'bg-blue-500 shadow-blue-500/30'    },
  { label: 'Add',     icon: <Plus      className="w-6 h-6" />, color: 'bg-violet-500 shadow-violet-500/30' },
];

  return (
    <div className="screen-enter pb-8">

      {/* ── Balance Hero ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-5">
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-[0.12em]">Total Balance</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-[40px] font-black text-white leading-none tracking-tight">€ 12,450</span>
            <span className="text-2xl font-black text-white/35 leading-none mb-0.5">.00</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">+2.4% this month</span>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ label, icon, color }, i) => (
            <button
              key={label}
              onClick={i === 0 ? onStartPayment : undefined}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-14 h-14 rounded-2xl ${color} shadow-lg grid place-items-center text-white transition hover:scale-105`}>
                {icon}
              </div>
              <span className="text-[11px] font-bold text-white/50">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Finn Sentinel ── */}
      <div className="px-5 mb-5">
        <button
          onClick={onForceAI}
          className="w-full rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-4 text-left hover:-translate-y-0.5 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-400 grid place-items-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-black text-white text-sm">Finn Sentinel</p>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  AI ON
                </span>
              </div>
              <p className="text-[11px] text-white/35 mt-0.5 leading-snug">
                Check any payment before you send money
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* ── Accounts ── */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white">Accounts</h3>
          <button className="text-[11px] font-bold text-white/35 hover:text-white/60 transition">See all</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ACCOUNTS.map(({ label, amount, sub, icon, iconBg }) => (
            <div key={label} className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] p-4">
              <div className={`w-9 h-9 rounded-xl ${iconBg} grid place-items-center mb-3`}>
                {icon}
              </div>
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-wide">{label}</p>
              <p className="font-black text-white mt-1 text-[15px]">{amount}</p>
              <p className="text-[10px] text-white/25 mt-1 font-mono truncate">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── My Cards ── */}
      <div className="mb-5">
        <div className="px-5 flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white">My Cards</h3>
          <button className="text-[11px] font-bold text-white/35 hover:text-white/60 transition">Manage</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
          {VIRTUAL_CARDS.map(({ gradient, last4, type }) => (
            <div
              key={last4}
              className={`shrink-0 w-[195px] h-[115px] rounded-3xl bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between shadow-xl relative overflow-hidden`}
            >
              {/* shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between relative">
                <CreditCard className="w-5 h-5 text-white/70" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">{type}</span>
              </div>
              <div className="relative">
                <p className="text-white font-black text-sm tracking-[0.18em]">•••• {last4}</p>
                <p className="text-[10px] text-white/50 mt-0.5 font-semibold uppercase tracking-widest">John Doe</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-white">Recent</h3>
          <button onClick={onForceAI} className="text-[11px] font-black bunq-text-gradient">
            Ask Finn
          </button>
        </div>
        <div className="rounded-3xl bg-[#1c1c1e] border border-white/[0.06] overflow-hidden">
          {TRANSACTIONS.map(({ icon, bg, name, cat, amount }, i) => (
            <div
              key={name}
              className={`flex justify-between items-center gap-3 px-4 py-3.5 ${i < TRANSACTIONS.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-2xl ${bg} grid place-items-center shrink-0`}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white truncate">{name}</p>
                  <p className="text-[11px] text-white/35 font-bold">{cat}</p>
                </div>
              </div>
              <span className="text-sm text-white font-black shrink-0">{amount}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
