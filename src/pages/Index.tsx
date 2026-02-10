import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Coffee, ArrowRight } from 'lucide-react';
import { useTasksContext } from '@/contexts/TasksContext';
import { useAuth } from '@/contexts/AuthContext';
import TaskCard from '@/components/TaskCard';
import CompletionModal from '@/components/CompletionModal';
import PostponeModal from '@/components/PostponeModal';
import type { Task } from '@/types/task';

export default function Dashboard() {
  const { getNextTask, getDailyPlan, completeTask, postponeTask, getCompletedToday, getOverdueTasks, rescheduleTask, archiveTask } = useTasksContext();
  const { profile } = useAuth();
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [postponingTask, setPostponingTask] = useState<Task | null>(null);

  const nextTask = getNextTask();
  const plan = getDailyPlan();
  const completedToday = getCompletedToday();
  const overdue = getOverdueTasks();
  const isPanic = plan.totalScheduledMinutes > plan.availableMinutes * 1.3;

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

  const currentHour = new Date().getHours();
  const firstName = profile?.firstName || '';
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-foreground">{greeting}{firstName ? `, ${firstName}` : ''}</h1>
        <p className="text-muted-foreground mt-1">
          {completedToday.length > 0
            ? `${completedToday.length} task${completedToday.length > 1 ? 's' : ''} done today. Keep going!`
            : "Let's get started on today's plan."}
        </p>
      </motion.div>

      {/* Panic state */}
      {isPanic && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          <div className="flex items-center gap-2 text-destructive font-display font-semibold text-sm">
            <span className="animate-pulse">🔥</span> Day overloaded!
            <span className="text-xs font-normal text-destructive/80 ml-1">
              ({Math.round(plan.totalScheduledMinutes / 60)}h planned for {Math.round(plan.availableMinutes / 60)}h available)
            </span>
          </div>
        </motion.div>
      )}

      {/* Overdue tasks */}
      {overdue.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h2 className="font-display text-sm font-semibold text-warning mb-3 flex items-center gap-2">
            ⚠️ Overdue ({overdue.length})
          </h2>
          <div className="space-y-2">
            {overdue.map(task => (
              <div key={task.id} className="glass-card p-3 flex items-center justify-between">
                <span className="text-sm text-foreground">{task.title}</span>
                <div className="flex gap-2">
                  <button onClick={() => rescheduleTask(task.id)} className="text-xs text-primary hover:underline">Reschedule</button>
                  <button onClick={() => archiveTask(task.id)} className="text-xs text-muted-foreground hover:underline">Archive</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Next Task (Focus) */}
      {nextTask ? (
        <div className="mb-8">
          <h2 className="font-display text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Target size={14} className="text-primary" /> NEXT UP
          </h2>
          <TaskCard
            task={nextTask}
            variant="focus"
            onComplete={t => setCompletingTask(t)}
            onPostpone={t => setPostponingTask(t)}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center mb-8"
        >
          <div className="text-5xl mb-4 animate-float">
            {completedToday.length > 0 ? '🎉' : '☕'}
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            {completedToday.length > 0 ? "You're all done!" : "No tasks scheduled"}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {completedToday.length > 0
              ? `Amazing work! You completed ${completedToday.length} task${completedToday.length > 1 ? 's' : ''} today.`
              : 'Add a task to get started with your day.'}
          </p>
          {completedToday.length === 0 && (
            <a
              href="/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display font-medium text-sm hover:brightness-110 transition-all"
            >
              Add your first task <ArrowRight size={14} />
            </a>
          )}
        </motion.div>
      )}

      {/* Up next */}
      {plan.scheduledTasks.length > 1 && (
        <div>
          <h2 className="font-display text-sm font-semibold text-muted-foreground mb-3">LATER TODAY</h2>
          <div className="space-y-2">
            {plan.scheduledTasks.slice(1, 4).map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onComplete={t => setCompletingTask(t)}
                onPostpone={t => setPostponingTask(t)}
              />
            ))}
            {plan.scheduledTasks.length > 4 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                +{plan.scheduledTasks.length - 4} more tasks today
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {completingTask && (
        <CompletionModal task={completingTask} onSubmit={handleComplete} onClose={() => setCompletingTask(null)} />
      )}
      {postponingTask && (
        <PostponeModal task={postponingTask} onSubmit={handlePostpone} onClose={() => setPostponingTask(null)} />
      )}
    </div>
  );
}

function Target(props: any) {
  return <Sparkles {...props} />;
}
