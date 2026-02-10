import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import type { Task, PostponeReason } from '@/types/task';

interface PostponeModalProps {
  task: Task;
  onSubmit: (reason: PostponeReason) => void;
  onClose: () => void;
}

const reasons: { value: PostponeReason; label: string; emoji: string }[] = [
  { value: 'took_longer', label: 'Previous task took longer', emoji: '⏰' },
  { value: 'interrupted', label: 'Got interrupted', emoji: '🔔' },
  { value: 'not_in_mood', label: 'Not in the mood', emoji: '😴' },
  { value: 'forgot', label: 'Forgot about it', emoji: '🤦' },
  { value: 'other', label: 'Other reason', emoji: '💬' },
];

export default function PostponeModal({ task, onSubmit, onClose }: PostponeModalProps) {
  const showWarning = task.postponeCount >= 2;

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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-8 max-w-md w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Why postpone?</h3>
              <p className="text-sm text-muted-foreground mt-1">This helps us learn your patterns</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
              <X size={18} />
            </button>
          </div>

          {showWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20 mb-4"
            >
              <AlertTriangle size={16} className="text-warning mt-0.5 flex-shrink-0" />
              <div className="text-xs text-warning">
                <p className="font-semibold">This task has been postponed {task.postponeCount} times.</p>
                <p className="mt-1 text-warning/80">Consider breaking it into smaller pieces or adjusting your estimate.</p>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            {reasons.map(({ value, label, emoji }) => (
              <motion.button
                key={value}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSubmit(value)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground text-sm font-medium border border-border/30 transition-colors text-left"
              >
                <span className="text-lg">{emoji}</span>
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
