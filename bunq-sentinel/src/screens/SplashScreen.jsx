import { motion } from 'framer-motion';
import bunqLogo from '../assets/bunq-logo.png';

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="absolute inset-0 z-[999] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #2e9e4f 0%, #5cb85c 14%, #4aa8d8 28%, #1a6fbe 42%, #8b3a6b 56%, #cc2929 70%, #e05a1a 85%, #f0a500 100%)',
      }}
    >
      <motion.img
        src={bunqLogo}
        alt="bunq"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-48 h-48 rounded-[2.4rem]"
        draggable={false}
      />

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="absolute bottom-16 flex items-center gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
