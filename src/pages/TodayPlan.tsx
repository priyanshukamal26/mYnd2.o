import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { useTasksContext } from '@/contexts/TasksContext';
import TaskCard from '@/components/TaskCard';
import CompletionModal from '@/components/CompletionModal';
import PostponeModal from '@/components/PostponeModal';
import type { Task } from '@/types/task';

export default function TodayPlan() {
  const { getDailyPlan, completeTask, postponeTask } = useTasksContext();
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [postponingTask, setPostponingTask] = useState<Task | null>(null);

  const plan = getDailyPlan();
  const isPanic = plan.totalScheduledMinutes > plan.availableMinutes * 1.3;
  const utilization = Math.round((plan.totalScheduledMinutes / Math.max(plan.availableMinutes, 1)) * 100);

  const handleComplete = (actualMinutes: number) => {
    if (completingTask) {
      completeTask(completingTask.id, actualMinutes);
      setCompletingTask(null);
    }
  };

  const handlePostpone = (reason: any) => {
    if (postponingTask) {
      postponeTask(postponingTask.id, reason);
      setPostponingTask(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Today's Plan</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Capacity bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-display font-medium text-foreground flex items-center gap-1.5">
            <Clock size={14} className="text-primary" />
            Day Capacity
          </span>
          <span className={`text-sm font-medium ${isPanic ? 'text-destructive' : utilization > 80 ? 'text-warning' : 'text-success'}`}>
            {utilization}% filled
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(utilization, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${isPanic ? 'bg-destructive' : utilization > 80 ? 'bg-warning' : 'bg-success'}`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>{Math.round(plan.totalScheduledMinutes / 60)}h planned</span>
          <span>{Math.round(plan.availableMinutes / 60)}h available</span>
        </div>

        {isPanic && (
          <div className="flex items-center gap-2 mt-3 text-destructive text-xs">
            <AlertTriangle size={12} /> Day overloaded. Consider postponing non-urgent tasks.
          </div>
        )}
      </motion.div>

      {/* Scheduled tasks */}
      {plan.scheduledTasks.length > 0 ? (
        <div className="space-y-2 mb-8">
          <h2 className="font-display text-sm font-semibold text-muted-foreground mb-3">SCHEDULED ({plan.scheduledTasks.length})</h2>
          {plan.scheduledTasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={i}
              onComplete={t => setCompletingTask(t)}
              onPostpone={t => setPostponingTask(t)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center mb-8">
          <p className="text-muted-foreground text-sm">No tasks scheduled for today.</p>
          <a href="/add" className="text-primary text-sm hover:underline mt-2 inline-block">Add a task →</a>
        </div>
      )}

      {/* Overflow */}
      {plan.overflowTasks.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-display text-sm font-semibold text-warning mb-3 flex items-center gap-2">
            <AlertTriangle size={14} />
            OVERFLOW — Won't fit today ({plan.overflowTasks.length})
          </h2>
          {plan.overflowTasks.map((task, i) => (
            <div key={task.id} className="glass-card p-3 opacity-60">
              <span className="text-sm text-foreground">{task.title}</span>
              <span className="text-xs text-muted-foreground ml-2">~{task.estimatedMinutes}m</span>
            </div>
          ))}
        </div>
      )}

      {completingTask && <CompletionModal task={completingTask} onSubmit={handleComplete} onClose={() => setCompletingTask(null)} />}
      {postponingTask && <PostponeModal task={postponingTask} onSubmit={handlePostpone} onClose={() => setPostponingTask(null)} />}
    </div>
  );
}
