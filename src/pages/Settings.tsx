import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw } from 'lucide-react';
import { useTasksContext } from '@/contexts/TasksContext';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { settings, updateSettings, resetLearning } = useTasksContext();
  const [workStart, setWorkStart] = useState(settings.workStartHour);
  const [workEnd, setWorkEnd] = useState(settings.workEndHour);
  const [lunchStart, setLunchStart] = useState(settings.lunchStartHour);
  const [lunchDuration, setLunchDuration] = useState(settings.lunchDurationMinutes);

  const handleSave = () => {
    updateSettings({ workStartHour: workStart, workEndHour: workEnd, lunchStartHour: lunchStart, lunchDurationMinutes: lunchDuration });
    toast({ title: 'Settings saved', description: 'Your schedule preferences have been updated.' });
  };

  const handleReset = () => {
    if (window.confirm('Reset all learning data? This cannot be undone.')) {
      resetLearning();
      toast({ title: 'Learning reset', description: 'All estimation data has been cleared.' });
    }
  };

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

  return (
    <div className="max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your work schedule</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <h2 className="font-display text-sm font-semibold text-foreground">Work Hours</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Start time</label>
              <select value={workStart} onChange={e => setWorkStart(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm">
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{formatHour(i)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">End time</label>
              <select value={workEnd} onChange={e => setWorkEnd(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm">
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{formatHour(i)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Lunch at</label>
              <select value={lunchStart} onChange={e => setLunchStart(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm">
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{formatHour(i)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Lunch duration</label>
              <select value={lunchDuration} onChange={e => setLunchDuration(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm">
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110"
          >
            <Save size={14} /> Save Settings
          </motion.button>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display text-sm font-semibold text-foreground mb-2">Learning Data</h2>
          <p className="text-xs text-muted-foreground mb-4">Reset all estimation learning. Your tasks will be kept but future estimates won't be adjusted.</p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="py-2.5 px-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium flex items-center gap-2 hover:bg-destructive/20"
          >
            <RotateCcw size={14} /> Reset Learning Data
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
