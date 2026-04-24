import { motion } from 'framer-motion';
import {
  ArrowDown, ArrowUp, Building2, ChevronRight, Gift, Landmark, Plus,
  QrCode, Search, ShieldCheck, Sparkles, UserRound,
} from 'lucide-react';

const spring = { type: 'spring', stiffness: 420, damping: 28 };

const QUICK_ACTIONS = [
  {
    label: 'Pay',
    icon: <ArrowUp className="h-4 w-4" />,
    className: 'border-orange-500 bg-orange-950/80 text-white shadow-[0_0_22px_rgba(249,115,22,0.22)]',
  },
  {
    label: 'Request',
    icon: <ArrowDown className="h-4 w-4" />,
    className: 'border-[#0a9dff] bg-sky-950/80 text-white shadow-[0_0_22px_rgba(14,165,233,0.22)]',
  },
  {
    label: 'Add Money',
    shortLabel: 'Add',
    icon: <Plus className="h-4 w-4" />,
    className: 'border-fuchsia-500 bg-fuchsia-950/80 text-white shadow-[0_0_22px_rgba(217,70,239,0.22)]',
  },
];

function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[20px] font-black tracking-tight text-white">{children}</h2>
      {action}
    </div>
  );
}

export default function HomeScreen({ onStartPayment, onForceAI }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="min-h-full bg-black px-5 pb-8 pt-5 text-white"
    >
      <div className="mb-7 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          className="grid h-11 w-11 place-items-center rounded-full bg-[#1c1c1e] text-white shadow-[0_14px_28px_rgba(0,0,0,0.35)]"
        >
          <UserRound className="h-6 w-6" />
        </motion.button>

        <div className="flex items-center gap-5 text-white">
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="grid h-10 w-10 place-items-center rounded-full text-2xl leading-none">
            ✱
          </motion.button>
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="grid h-10 w-10 place-items-center rounded-full">
            <QrCode className="h-6 w-6" />
          </motion.button>
        </div>
      </div>

      <h1 className="mb-5 text-[46px] font-black leading-none tracking-tight text-white">Home</h1>

      <motion.div
        whileHover={{ y: -3 }}
        transition={spring}
        className="mb-4 rounded-[1.75rem] bg-[#125a38] p-5 text-center shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
      >
        <h2 className="text-[25px] font-black leading-tight text-[#48e59c]">
          Add 15 EUR to start using your account
        </h2>
        <p className="mx-auto mt-2 max-w-[280px] text-[17px] font-semibold leading-snug text-[#48e59c]/90">
          Instantly fund your account to start banking today.
        </p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onStartPayment}
          className="mt-6 h-13 w-full rounded-2xl bg-gradient-to-b from-[#56eaa7] to-[#29c987] py-3.5 text-[18px] font-black text-white"
        >
          Add Money
        </motion.button>
      </motion.div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        {QUICK_ACTIONS.map(({ label, shortLabel, icon, className }, i) => (
          <motion.button
            key={label}
            onClick={i === 0 ? onStartPayment : undefined}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            className={`flex h-[56px] min-w-0 items-center justify-center gap-1.5 rounded-[1.35rem] border-2 px-2 text-[14px] font-black leading-none ${className}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 [&_svg]:block">
              {icon}
            </span>
            <span className="min-w-0 truncate whitespace-nowrap">{shortLabel || label}</span>
          </motion.button>
        ))}
      </div>

      <section className="mb-8">
        <SectionTitle>Action Needed</SectionTitle>
        <motion.div
          whileHover={{ y: -3 }}
          transition={spring}
          className="w-full rounded-[1.65rem] bg-[#1c1c1e] p-5 text-left shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
        >
          <div className="flex items-center gap-4">
            <div className="relative grid h-[58px] w-[58px] shrink-0 place-items-center rounded-2xl bg-[#0a9dff] text-white">
              <Building2 className="h-8 w-8" />
              <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 ring-2 ring-black" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[20px] font-semibold text-white">Tax Information Needed</p>
              <p className="text-[15px] font-semibold text-zinc-500">Awaiting</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mb-8">
        <SectionTitle>Bank Accounts</SectionTitle>
        <motion.div whileHover={{ y: -3 }} transition={spring} className="rounded-[1.65rem] bg-[#1c1c1e] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-[#129dff] to-[#0067c8] text-white shadow-[0_12px_26px_rgba(10,157,255,0.22)]">
                <Landmark className="h-8 w-8" />
              </div>
              <p className="truncate text-[21px] font-semibold text-white">Bank Account</p>
            </div>
            <p className="shrink-0 text-[23px] font-black text-white">0,00 EUR</p>
          </div>
          <div className="my-5 h-px bg-white/10" />
          <button className="text-left text-[20px] font-medium text-[#0a9dff]">
            Add an Extra Bank Account
          </button>
        </motion.div>
      </section>

      <section className="mb-8">
        <SectionTitle
          action={(
            <button className="grid h-11 w-11 place-items-center rounded-full bg-[#1c1c1e] text-white">
              <Search className="h-6 w-6" />
            </button>
          )}
        >
          Recent Transactions
        </SectionTitle>
        <div className="relative rounded-[1.65rem] bg-[#1c1c1e] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.28)]">
          {[0, 1, 2].map((row) => (
            <div key={row} className={`flex items-center justify-between py-3 ${row < 2 ? 'border-b border-white/10' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="h-[58px] w-[58px] rounded-full bg-zinc-600" />
                <div className="space-y-3">
                  <div className="h-3 w-36 rounded-full bg-zinc-600" />
                  <div className="h-3 w-32 rounded-full bg-zinc-600" />
                </div>
              </div>
              <div className="h-3 w-16 rounded-full bg-zinc-600" />
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-[#2b2b2d] px-5 py-4 text-center shadow-2xl">
            <p className="text-[16px] font-black text-white">No Transactions Yet</p>
            <p className="mt-1 text-[14px] font-medium text-zinc-200">Your transactions will appear here</p>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <SectionTitle>Extras</SectionTitle>
        <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full rounded-[1.65rem] bg-[#1c1c1e] p-5 text-left shadow-[0_16px_34px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-4">
            <div className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-2xl bg-emerald-900/70">
              <Gift className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[20px] font-black leading-tight text-white">Get EUR 100 when you invite a friend</p>
              <p className="mt-1 text-[15px] font-medium leading-snug text-zinc-500">
                Invite a friend to bunq. Once they switch from another bank, you both get EUR 100.
              </p>
              <p className="mt-1 text-[14px] font-semibold text-yellow-400">1 left this month</p>
            </div>
            <ChevronRight className="h-8 w-8 shrink-0 text-zinc-500" />
          </div>
        </motion.button>
      </section>

      <section className="pb-2">
        <motion.button
          onClick={onForceAI}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          className="w-full rounded-[1.65rem] bg-[#1c1c1e] p-5 text-left shadow-[0_16px_34px_rgba(0,0,0,0.28)]"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-[56px] w-[56px] shrink-0 place-items-center rounded-2xl bg-fuchsia-950 text-fuchsia-300">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-[20px] font-black text-white">Warden</p>
              <p className="text-[14px] font-semibold text-zinc-500">
                Check suspicious payments before you send money.
              </p>
            </div>
            <ShieldCheck className="ml-auto h-7 w-7 text-emerald-400" />
          </div>
        </motion.button>
      </section>
    </motion.div>
  );
}
