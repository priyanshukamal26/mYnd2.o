import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/api';
import type { Task, LearningData, UserSettings, DailyPlan, TaskCategory, PostponeReason, EnergyLevel } from '@/types/task';

const DEFAULT_SETTINGS: UserSettings = {
  workStartHour: 8,
  workEndHour: 22,
  lunchStartHour: 12,
  lunchDurationMinutes: 60,
};

// Map server task to client Task type
function mapTask(t: any): Task {
  return {
    id: t.id,
    title: t.title,
    category: t.category,
    estimatedMinutes: t.estimatedMinutes,
    actualMinutes: t.actualMinutes || undefined,
    deadline: t.deadline,
    energyLevel: t.energyLevel,
    status: t.status,
    scheduledTime: t.scheduledTime || undefined,
    createdAt: t.createdAt,
    completedAt: t.completedAt || undefined,
    postponeCount: t.postponeCount || 0,
    postponeReasons: t.postponeReasons || [],
    score: t.score,
  };
}

function mapLearning(l: any): LearningData {
  return {
    category: l.category,
    totalEstimated: l.totalEstimated,
    totalActual: l.totalActual,
    completedCount: l.completedCount,
    accuracy: l.accuracy,
    adjustmentFactor: l.adjustmentFactor,
  };
}

// Scoring logic (same as before, runs client-side)
function calcUrgency(deadline: string): number {
  const days = Math.max(0, (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, 100 - days * 10);
}

function calcTimeFit(estimated: number, available: number): number {
  return estimated <= available ? Math.floor(60 * (estimated / Math.max(available, 1))) : 0;
}

function calcEnergyMatch(energy: EnergyLevel, hour: number): number {
  const windows: Record<EnergyLevel, { optimal: [number, number]; acceptable: [number, number] }> = {
    high: { optimal: [8, 14], acceptable: [14, 17] },
    medium: { optimal: [12, 18], acceptable: [8, 12] },
    low: { optimal: [17, 22], acceptable: [12, 17] },
  };
  const w = windows[energy];
  if (hour >= w.optimal[0] && hour < w.optimal[1]) return 30;
  if (hour >= w.acceptable[0] && hour < w.acceptable[1]) return 15;
  return 5;
}

function scoreTask(task: Task, availableMinutes: number, currentHour: number): number {
  const urgency = calcUrgency(task.deadline);
  const priority = task.energyLevel === 'high' ? 30 : task.energyLevel === 'medium' ? 20 : 10;
  const timeFit = calcTimeFit(task.estimatedMinutes, availableMinutes);
  const energy = calcEnergyMatch(task.energyLevel, currentHour);
  return urgency * 0.4 + priority * 0.3 + timeFit * 0.2 + energy * 0.1;
}

import { useAuth } from '@/contexts/AuthContext';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [learning, setLearning] = useState<LearningData[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load all data from API when user changes
  useEffect(() => {
    if (!user) {
      // User logged out: clear data
      setTasks([]);
      setLearning([]);
      setSettings(DEFAULT_SETTINGS);
      setLoaded(false);
      return;
    }

    // User logged in: fetch data
    Promise.all([
      api.tasks.list().catch(() => []),
      api.learning.list().catch(() => []),
      api.settings.get().catch(() => null),
    ]).then(([tasksData, learningData, settingsData]) => {
      setTasks(tasksData.map(mapTask));
      setLearning(learningData.map(mapLearning));
      if (settingsData) {
        setSettings({
          workStartHour: settingsData.workStartHour,
          workEndHour: settingsData.workEndHour,
          lunchStartHour: settingsData.lunchStartHour,
          lunchDurationMinutes: settingsData.lunchDurationMinutes,
        });
      }
      setLoaded(true);
    });
  }, [user]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'postponeCount' | 'postponeReasons'>) => {
    // Apply learning adjustment
    const learningEntry = learning.find(l => l.category === task.category);
    const adjustedEstimate = learningEntry && learningEntry.completedCount >= 5
      ? Math.round(task.estimatedMinutes * learningEntry.adjustmentFactor)
      : task.estimatedMinutes;

    const created = await api.tasks.create({
      title: task.title,
      category: task.category,
      estimatedMinutes: adjustedEstimate,
      deadline: task.deadline,
      energyLevel: task.energyLevel,
    });

    const newTask = mapTask(created);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [learning]);

  const completeTask = useCallback(async (taskId: string, actualMinutes: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = await api.tasks.update(taskId, {
      status: 'completed',
      actualMinutes,
      completedAt: new Date().toISOString(),
    });
    setTasks(prev => prev.map(t => t.id === taskId ? mapTask(updated) : t));

    // Update learning data on server
    const existing = learning.find(l => l.category === task.category);
    if (existing) {
      const newTotal = existing.totalEstimated + task.estimatedMinutes;
      const newActual = existing.totalActual + actualMinutes;
      const newCount = existing.completedCount + 1;
      const updatedLearning = await api.learning.upsert(task.category, {
        totalEstimated: newTotal,
        totalActual: newActual,
        completedCount: newCount,
        accuracy: Math.min(newTotal / Math.max(newActual, 1), 1),
        adjustmentFactor: newActual / Math.max(newTotal, 1),
      });
      setLearning(prev => prev.map(l => l.category === task.category ? mapLearning(updatedLearning) : l));
    } else {
      const newLearning = await api.learning.upsert(task.category, {
        totalEstimated: task.estimatedMinutes,
        totalActual: actualMinutes,
        completedCount: 1,
        accuracy: Math.min(task.estimatedMinutes / Math.max(actualMinutes, 1), 1),
        adjustmentFactor: actualMinutes / Math.max(task.estimatedMinutes, 1),
      });
      setLearning(prev => [...prev, mapLearning(newLearning)]);
    }
  }, [tasks, learning]);

  const postponeTask = useCallback(async (taskId: string, reason: PostponeReason) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updated = await api.tasks.update(taskId, {
      status: 'postponed',
      postponeCount: task.postponeCount + 1,
      postponeReasons: [...task.postponeReasons, reason],
    });
    setTasks(prev => prev.map(t => t.id === taskId ? mapTask(updated) : t));

    // Adjust learning if took_longer
    if (reason === 'took_longer') {
      const existing = learning.find(l => l.category === task.category);
      if (existing) {
        await api.learning.upsert(task.category, {
          adjustmentFactor: existing.adjustmentFactor * 1.3,
        });
        setLearning(prev => prev.map(l => l.category === task.category
          ? { ...l, adjustmentFactor: l.adjustmentFactor * 1.3 }
          : l
        ));
      }
    }
  }, [tasks, learning]);

  const rescheduleTask = useCallback(async (taskId: string) => {
    const updated = await api.tasks.update(taskId, { status: 'scheduled' });
    setTasks(prev => prev.map(t => t.id === taskId ? mapTask(updated) : t));
  }, []);

  const archiveTask = useCallback(async (taskId: string) => {
    const updated = await api.tasks.update(taskId, { status: 'archived' });
    setTasks(prev => prev.map(t => t.id === taskId ? mapTask(updated) : t));
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    await api.tasks.delete(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    await api.settings.update(merged);
  }, [settings]);

  const getDailyPlan = useCallback((): DailyPlan => {
    const today = new Date().toISOString().split('T')[0];
    const availableHours = settings.workEndHour - settings.workStartHour - (settings.lunchDurationMinutes / 60);
    const availableMinutes = availableHours * 60;

    const pending = tasks.filter(t =>
      (t.status === 'scheduled' || t.status === 'postponed') &&
      t.deadline >= today
    );

    const currentHour = settings.workStartHour;
    const scored = pending.map(t => ({
      ...t,
      score: scoreTask(t, availableMinutes, currentHour),
    })).sort((a, b) => (b.score || 0) - (a.score || 0));

    let usedMinutes = 0;
    const scheduled: Task[] = [];
    const overflow: Task[] = [];

    for (const task of scored) {
      if (usedMinutes + task.estimatedMinutes + 10 <= availableMinutes) {
        const hours = Math.floor((settings.workStartHour * 60 + usedMinutes) / 60);
        const mins = (settings.workStartHour * 60 + usedMinutes) % 60;
        let scheduledHour = hours;
        if (scheduledHour >= settings.lunchStartHour && scheduledHour < settings.lunchStartHour + 1) {
          scheduledHour = settings.lunchStartHour + 1;
        }
        scheduled.push({
          ...task,
          scheduledTime: `${String(scheduledHour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
        });
        usedMinutes += task.estimatedMinutes + 10;
      } else {
        overflow.push(task);
      }
    }

    return { date: today, scheduledTasks: scheduled, overflowTasks: overflow, totalScheduledMinutes: usedMinutes, availableMinutes };
  }, [tasks, settings]);

  const getNextTask = useCallback((): Task | null => {
    const plan = getDailyPlan();
    return plan.scheduledTasks[0] || null;
  }, [getDailyPlan]);

  const getLearningForCategory = useCallback((category: TaskCategory): LearningData | null => {
    return learning.find(l => l.category === category) || null;
  }, [learning]);

  const getOverallAccuracy = useCallback((): number => {
    if (learning.length === 0) return 0;
    const totalEst = learning.reduce((s, l) => s + l.totalEstimated, 0);
    const totalAct = learning.reduce((s, l) => s + l.totalActual, 0);
    if (totalAct === 0) return 0;
    return Math.min(totalEst / totalAct, 1);
  }, [learning]);

  const getCompletedToday = useCallback((): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.status === 'completed' && t.completedAt?.startsWith(today));
  }, [tasks]);

  const getOverdueTasks = useCallback((): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t =>
      (t.status === 'scheduled' || t.status === 'postponed') && t.deadline < today
    );
  }, [tasks]);

  const resetLearning = useCallback(async () => {
    await api.learning.reset();
    setLearning([]);
  }, []);

  return {
    tasks, learning, settings, addTask, completeTask, postponeTask, rescheduleTask,
    archiveTask, deleteTask, updateSettings, getDailyPlan, getNextTask,
    getLearningForCategory, getOverallAccuracy, getCompletedToday, getOverdueTasks, resetLearning,
  };
}
