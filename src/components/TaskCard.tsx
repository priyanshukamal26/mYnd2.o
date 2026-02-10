import { motion } from 'framer-motion';
import { Clock, Calendar, Zap, MoreHorizontal } from 'lucide-react';
import type { Task } from '@/types/task';
import { CATEGORY_EMOJIS } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onComplete: (task: Task) => void;
  onPostpone: (task: Task) => void;
  variant?: 'default' | 'focus' | 'compact';
  index?: number;
}

export default function TaskCard({ task, onComplete, onPostpone, variant = 'default', index = 0 }: TaskCardProps) {
  const energyClass = task.energyLevel === 'high' ? 'energy-border-high' : task.energyLevel === 'medium' ? 'energy-border-medium' : 'energy-border-low';
  const energyColor = task.energyLevel === 'high' ? 'text-energy-high' : task.energyLevel === 'medium' ? 'text-energy-medium' : 'text-energy-low';

  const daysUntilDeadline = Math.max(0, Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isUrgent = daysUntilDeadline <= 1;

  if (variant === 'focus') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`glass-card ${energyClass} p-8 relative overflow-hidden`}
        whileHover={{ y: -2 }}
        style={{ boxShadow: 'var(--shadow-glow)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{CATEGORY_EMOJIS[task.category]}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{task.category.replace('_', ' ')}</span>
            {isUrgent && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-semibold animate-pulse">
                Due {daysUntilDeadline === 0 ? 'Today' : 'Tomorrow'}
              </span>
            )}
          </div>

          <h2 className="font-display text-3xl font-bold text-foreground mb-4">{task.title}</h2>

          <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              <span>~{task.estimatedMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              <span>{new Date(task.deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${energyColor}`}>
              <Zap size={14} />
              <span className="capitalize">{task.energyLevel} energy</span>
            </div>
            {task.scheduledTime && (
              <div className="flex items-center gap-1.5">
                <span className="text-primary font-medium">{task.scheduledTime}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onComplete(task)}
              className="flex-1 py-3 px-6 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm transition-all hover:brightness-110"
            >
              Mark Complete ✓
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPostpone(task)}
              className="py-3 px-6 rounded-lg bg-secondary text-secondary-foreground font-display font-medium text-sm border border-border hover:bg-secondary/80"
            >
              Not Today
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`glass-card ${energyClass} p-4 group cursor-pointer`}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-card-hover)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span>{CATEGORY_EMOJIS[task.category]}</span>
            <h3 className="font-display font-semibold text-foreground truncate">{task.title}</h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock size={12} /> ~{task.estimatedMinutes}m</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span className={`flex items-center gap-1 ${energyColor}`}><Zap size={12} /> {task.energyLevel}</span>
            {task.scheduledTime && <span className="text-primary font-medium">{task.scheduledTime}</span>}
            {task.postponeCount > 0 && (
              <span className="text-warning text-xs">postponed ×{task.postponeCount}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onComplete(task); }}
            className="px-3 py-1.5 rounded-md bg-success/20 text-success text-xs font-medium hover:bg-success/30"
          >
            Done
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onPostpone(task); }}
            className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80"
          >
            Skip
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
