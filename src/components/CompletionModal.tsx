import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import type { Task } from '@/types/task';
import confetti from 'canvas-confetti';

interface CompletionModalProps {
  task: Task;
  onSubmit: (actualMinutes: number) => void;
  onClose: () => void;
}

const quickTimes = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '2 hr', value: 120 },
  { label: '3 hr', value: 180 },
  { label: '4+ hr', value: 240 },
];

export default function CompletionModal({ task, onSubmit, onClose }: CompletionModalProps) {
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleSubmit = (minutes: number) => {
    // Fire confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#22d3ee', '#34d399', '#60a5fa'],
    });
    onSubmit(minutes);
  };

  const deviation = (minutes: number) => {
    const diff = ((minutes - task.estimatedMinutes) / task.estimatedMinutes) * 100;
    if (Math.abs(diff) < 20) return null;
    return diff > 0 ? `+${Math.round(diff)}% longer` : `${Math.round(diff)}% shorter`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card p-8 max-w-md w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl font-bold text-success">Task Complete! 🎉</h3>
              <p className="text-sm text-muted-foreground mt-1">How long did it actually take?</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
              <X size={18} />
            </button>
          </div>

          <div className="glass-card p-3 mb-6">
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock size={12} /> Your estimate: {task.estimatedMinutes} min
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {quickTimes.map(({ label, value }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubmit(value)}
                className="py-3 px-2 rounded-lg bg-secondary hover:bg-accent text-foreground font-display font-medium text-sm border border-border/50 transition-colors relative"
              >
                {label}
                {deviation(value) && (
                  <span className={`block text-[10px] mt-0.5 ${value > task.estimatedMinutes ? 'text-warning' : 'text-success'}`}>
                    {deviation(value)}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {!showCustom ? (
            <button onClick={() => setShowCustom(true)} className="w-full text-sm text-primary hover:underline py-2">
              Enter custom time
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Minutes..."
                value={customMinutes}
                onChange={e => setCustomMinutes(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => customMinutes && handleSubmit(parseInt(customMinutes))}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
              >
                Done
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
