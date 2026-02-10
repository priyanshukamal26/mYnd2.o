import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Clock, Calendar, Lightbulb } from 'lucide-react';
import { useTasksContext } from '@/contexts/TasksContext';
import type { TaskCategory, EnergyLevel } from '@/types/task';
import { CATEGORY_LABELS } from '@/types/task';

const categories: TaskCategory[] = ['essay', 'problem_set', 'reading', 'project', 'lecture', 'lab', 'study', 'other'];
const energyLevels: { value: EnergyLevel; label: string; color: string }[] = [
  { value: 'high', label: 'High Focus', color: 'bg-energy-high/20 text-energy-high border-energy-high/30' },
  { value: 'medium', label: 'Medium', color: 'bg-energy-medium/20 text-energy-medium border-energy-medium/30' },
  { value: 'low', label: 'Low / Easy', color: 'bg-energy-low/20 text-energy-low border-energy-low/30' },
];

export default function AddTask() {
  const navigate = useNavigate();
  const { addTask, getLearningForCategory } = useTasksContext();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [deadline, setDeadline] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const learningData = getLearningForCategory(category);
  const hasLearning = learningData && learningData.completedCount >= 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), category, estimatedMinutes, energyLevel, deadline });
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Add Task</h1>
        <p className="text-muted-foreground text-sm mb-8">Be honest with your estimate. We'll learn together.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-display font-medium text-foreground mb-2">What do you need to do?</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Write intro paragraph for essay..."
            className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body text-sm"
            autoFocus
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-display font-medium text-foreground mb-2">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <motion.button
                type="button"
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  category === cat
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-secondary/50 border-border/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time Estimate */}
        <div>
          <label className="block text-sm font-display font-medium text-foreground mb-2">
            <Clock size={14} className="inline mr-1 text-primary" />
            How long do you think it'll take?
          </label>
          {hasLearning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 mb-3"
            >
              <Lightbulb size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-primary">
                Based on your history, {category.replace('_', ' ')} tasks take you about{' '}
                <strong>{Math.round(estimatedMinutes * learningData!.adjustmentFactor)} min</strong> on average.
                Your estimate will be adjusted automatically.
              </p>
            </motion.div>
          )}
          <div className="grid grid-cols-6 gap-2">
            {[15, 30, 60, 90, 120, 180].map(mins => (
              <motion.button
                type="button"
                key={mins}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEstimatedMinutes(mins)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  estimatedMinutes === mins
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-secondary/50 border-border/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {mins < 60 ? `${mins}m` : `${mins / 60}h`}
              </motion.button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Or enter custom minutes..."
            value={estimatedMinutes}
            onChange={e => setEstimatedMinutes(parseInt(e.target.value) || 0)}
            className="mt-2 w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Energy Level */}
        <div>
          <label className="block text-sm font-display font-medium text-foreground mb-2">
            <Zap size={14} className="inline mr-1 text-primary" />
            Energy needed
          </label>
          <div className="grid grid-cols-3 gap-2">
            {energyLevels.map(({ value, label, color }) => (
              <motion.button
                type="button"
                key={value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEnergyLevel(value)}
                className={`py-3 rounded-lg text-sm font-medium border transition-all ${
                  energyLevel === value ? color : 'bg-secondary/50 border-border/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-display font-medium text-foreground mb-2">
            <Calendar size={14} className="inline mr-1 text-primary" />
            Deadline
          </label>
          <input
            type="date"
            value={deadline}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDeadline(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={!title.trim()}
          className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add to Schedule →
        </motion.button>
      </motion.form>
    </div>
  );
}
