import { motion } from 'framer-motion';
import {
  Signal, Wifi,
  Home, CreditCard, PiggyBank, BarChart3, Shield,
} from 'lucide-react';
import './index.css';

import HomeScreen           from './screens/HomeScreen';

const spring = { type: 'spring', stiffness: 420, damping: 28 };

export default function App() {
  return (
    <div className="app-bg min-h-screen flex items-center justify-center p-4">
      <main className="relative w-full max-w-[402px] h-[840px] rounded-[2.7rem] bg-neutral-950 p-[3px] shadow-[0_36px_100px_rgba(0,0,0,0.75)]">
        <div className="h-full rounded-[2.4rem] overflow-hidden bg-black flex flex-col relative">
          <div className="relative h-11 bg-black text-white px-9 flex items-center justify-between text-[18px] font-semibold shrink-0">
            <span className="font-extrabold">9:41</span>
            <div className="flex items-center gap-1.5 text-white">
              <Signal className="w-4 h-4" />
              <Wifi className="w-4 h-4" />
              <div className="h-5 min-w-8 rounded-md bg-yellow-400 px-1 text-[12px] font-black leading-5 text-black">41</div>
            </div>
          </div>

          <section className="flex-1 min-h-0 overflow-y-auto relative no-scrollbar">
            <HomeScreen />
          </section>

          <nav className="shrink-0 bg-[#171717]/95 backdrop-blur-xl px-4 pb-5 pt-3 shadow-[0_-22px_44px_rgba(0,0,0,0.8)]">
            <div className="grid grid-cols-5 gap-1 text-[11px] font-bold">
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-[#0a9dff]">
                <Home className="w-6 h-6 fill-current" />
                <span>Home</span>
              </motion.button>
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition">
                <CreditCard className="w-6 h-6" />
                <span>Cards</span>
              </motion.button>
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition">
                <PiggyBank className="w-6 h-6 fill-current" />
                <span>Savings</span>
              </motion.button>
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={spring} className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition">
                <BarChart3 className="w-6 h-6" />
                <span>Stocks</span>
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
                className="h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 transition"
                type="button"
              >
                <Shield className="w-6 h-6 fill-current" />
                <span>Crypto</span>
              </motion.button>
            </div>
          </nav>
        </div>
      </main>
    </div>
  );
}
