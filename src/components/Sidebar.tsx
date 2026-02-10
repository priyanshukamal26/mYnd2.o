import { NavLink, useLocation } from 'react-router-dom';
import { Target, Plus, Calendar, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTasksContext } from '@/contexts/TasksContext';

const navItems = [
  { to: '/dashboard', icon: Target, label: 'Next Task' },
  { to: '/add', icon: Plus, label: 'Add Task' },
  { to: '/today', icon: Calendar, label: "Today's Plan" },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { getOverallAccuracy, getCompletedToday } = useTasksContext();
  const accuracy = getOverallAccuracy();
  const completedToday = getCompletedToday();

  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname === to;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 pb-4">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          <span className="text-gradient">mYnd</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Stop lying about time.</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <NavLink key={to} to={to} className="block">
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                }`}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon size={18} className={active ? 'text-primary' : ''} />
                {label}
                {to === '/add' && (
                  <span className="ml-auto w-5 h-5 rounded-md bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">+</span>
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Stats footer */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-secondary/50 border border-border/50">
        <div className="text-xs text-muted-foreground mb-2">Today's Progress</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-display font-semibold text-foreground">{completedToday.length} done</span>
          <span className="text-xs text-primary font-medium">
            {accuracy > 0 ? `${Math.round(accuracy * 100)}% accurate` : 'No data yet'}
          </span>
        </div>
        {accuracy > 0 && (
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(accuracy * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
