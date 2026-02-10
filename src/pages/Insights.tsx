import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Zap, Target, Calendar, PieChart as PieIcon, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { useTasksContext } from '@/contexts/TasksContext';
import { CATEGORY_LABELS } from '@/types/task';
import { format, subDays, startOfDay, parseISO } from 'date-fns';

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#6366f1', '#14b8a6', '#f43f5e'];

export default function Insights() {
  const { learning, tasks, getOverallAccuracy } = useTasksContext();
  const overallAccuracy = getOverallAccuracy();

  // -- Data Preparation --

  // 1. Weekly Activity (Last 7 Days)
  const weeklyActivityData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayTasks = tasks.filter(t =>
        t.status === 'completed' &&
        t.completedAt &&
        t.completedAt.startsWith(dateStr)
      );

      const minutes = dayTasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

      days.push({
        name: format(date, 'EEE'), // Mon, Tue...
        fullDate: dateStr,
        minutes: minutes,
        tasks: dayTasks.length
      });
    }
    return days;
  }, [tasks]);

  const totalWeeklyMinutes = weeklyActivityData.reduce((acc, d) => acc + d.minutes, 0);
  const weeklyHours = Math.round(totalWeeklyMinutes / 60 * 10) / 10;

  // 2. Category Distribution
  const categoryData = useMemo(() => {
    return learning
      .filter(l => l.completedCount > 0)
      .map(l => ({
        name: CATEGORY_LABELS[l.category].split(' ').slice(1).join(' '), // Strip emoji for chart
        value: l.completedCount,
        category: l.category
      }))
      .sort((a, b) => b.value - a.value);
  }, [learning]);

  // 3. Estimation Accuracy (Recent 10 completed tasks)
  const accuracyData = useMemo(() => {
    return tasks
      .filter(t => t.status === 'completed' && t.actualMinutes && t.estimatedMinutes)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 10)
      .reverse()
      .map(t => ({
        name: t.title.length > 15 ? t.title.substring(0, 15) + '...' : t.title,
        estimated: t.estimatedMinutes,
        actual: t.actualMinutes,
        diff: (t.actualMinutes || 0) - t.estimatedMinutes
      }));
  }, [tasks]);

  // Overall Stats
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalEstimated = completedTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
  const totalActual = completedTasks.reduce((s, t) => s + (t.actualMinutes || 0), 0);
  const timeGapPct = totalEstimated > 0 ? Math.round(((totalActual - totalEstimated) / totalEstimated) * 100) : 0;

  // Custom Toolkit Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
          <p className="font-display font-semibold text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'minutes' || entry.name === 'estimated' || entry.name === 'actual' ? 'm' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground mt-1">Analyze your productivity patterns and master your time</p>
      </motion.div>

      {completedTasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">No data yet</h2>
          <p className="text-muted-foreground text-sm">Complete some tasks to unlock detailed analytics.</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={48} /></div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Target size={16} />
                <span className="text-xs font-display font-medium uppercase tracking-wider">Overall Accuracy</span>
              </div>
              <p className="font-display text-4xl font-bold text-foreground">{Math.round(overallAccuracy * 100)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Estimation precision</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={48} /></div>
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <Activity size={16} />
                <span className="text-xs font-display font-medium uppercase tracking-wider">This Week</span>
              </div>
              <p className="font-display text-4xl font-bold text-foreground">{weeklyHours}h</p>
              <p className="text-xs text-muted-foreground mt-1">Total focus time</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={48} /></div>
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Clock size={16} />
                <span className="text-xs font-display font-medium uppercase tracking-wider">Reality Gap</span>
              </div>
              <p className="font-display text-4xl font-bold text-foreground">
                {timeGapPct > 0 ? '+' : ''}{timeGapPct}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {timeGapPct > 0 ? 'Over-estimating time needed' : timeGapPct < 0 ? 'Under-estimating time needed' : 'Perfect estimation'}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <h2 className="font-display text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Weekly Focus Activity
              </h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}m`}
                    />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Category Distribution Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
              <h2 className="font-display text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                <PieIcon size={16} className="text-primary" />
                Task Distribution
              </h2>
              <div className="h-[250px] w-full flex items-center justify-center">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm">No categorical data yet</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Estimation vs Reality Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
            <h2 className="font-display text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Estimation vs. Reality (Last 10 Tasks)
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} barGap={0} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}m`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="estimated" name="Estimated Time" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Time" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Detailed Category Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
            <h2 className="font-display text-sm font-semibold text-foreground mb-4">Detailed Breakdown</h2>
            <div className="space-y-4">
              {learning.map(entry => {
                const accuracyPct = Math.round(entry.accuracy * 100);
                const avgEstimate = Math.round(entry.totalEstimated / Math.max(entry.completedCount, 1));
                const avgActual = Math.round(entry.totalActual / Math.max(entry.completedCount, 1));
                return (
                  <div key={entry.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{CATEGORY_LABELS[entry.category]}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Est: {avgEstimate}m</span>
                        <span>Real: {avgActual}m</span>
                        <span className={`font-semibold ${accuracyPct >= 70 ? 'text-green-500' : accuracyPct >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                          {accuracyPct}% Accuracy
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${accuracyPct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${accuracyPct >= 70 ? 'bg-green-500' : accuracyPct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
