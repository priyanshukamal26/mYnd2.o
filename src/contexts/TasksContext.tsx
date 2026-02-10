import React, { createContext, useContext } from 'react';
import { useTasks } from '@/hooks/useTasks';

type TasksContextType = ReturnType<typeof useTasks>;

const TasksContext = createContext<TasksContextType | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const tasksState = useTasks();
  return <TasksContext.Provider value={tasksState}>{children}</TasksContext.Provider>;
}

export function useTasksContext() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasksContext must be used within TasksProvider');
  return ctx;
}
