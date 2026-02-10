import { motion } from 'framer-motion';
import { ArrowRight, Clock, Brain, TrendingUp, Zap, Target, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: Brain, title: 'Learns From Reality', desc: 'After 5 tasks, mYnd adjusts your estimates based on how long things actually take.' },
  { icon: Clock, title: 'Honest Scheduling', desc: 'Scores tasks by urgency, energy, and time fit — never overloads your day.' },
  { icon: TrendingUp, title: 'Accuracy Insights', desc: 'See exactly where you underestimate. Essays? Problem sets? Now you know.' },
  { icon: Target, title: 'Focus Mode', desc: 'One task at a time. No overwhelm. Just the next thing to do.' },
  { icon: Zap, title: 'Energy-Aware', desc: 'High-focus work in the morning, low-energy tasks in the evening. Automatically.' },
  { icon: BarChart3, title: 'Weekly Capacity', desc: "Discover your real weekly output — not the 30 hours you think you work." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">
            <span className="text-gradient">mYnd</span>
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/auth?mode=signup')}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-display font-semibold hover:brightness-110 transition-all"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-display font-medium mb-6 border border-primary/20">
              Built for students who chronically underestimate
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
              Stop lying about
              <br />
              <span className="text-gradient">how long things take</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              mYnd learns from your actual task durations and corrects your future estimates.
              No more all-nighters from "it'll only take an hour."
            </p>
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth?mode=signup')}
                className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base flex items-center gap-2 hover:brightness-110 transition-all"
                style={{ boxShadow: 'var(--shadow-glow)' }}
              >
                Start for free <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">The core loop</h2>
            <p className="text-muted-foreground">Estimate → Work → Learn → Improve. Repeat.</p>
          </motion.div>

          <div className="grid grid-cols-4 gap-4">
            {['You estimate', 'You work', 'Reality captured', 'Next plan smarter'].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center relative"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-display font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <p className="font-display font-semibold text-foreground text-sm">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">What makes mYnd different</h2>
            <p className="text-muted-foreground">The productivity tool that doesn't let you lie to yourself.</p>
          </motion.div>
          <div className="grid grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 group hover:border-primary/30 transition-colors"
              >
                <Icon size={20} className="text-primary mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ready to get honest?</h2>
          <p className="text-muted-foreground mb-8">Join students who've stopped lying to themselves about time.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base flex items-center gap-2 mx-auto hover:brightness-110"
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            Get started free <ArrowRight size={16} />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-display font-semibold text-gradient">mYnd</span>
          <span>Stop lying about time.</span>
        </div>
      </footer>
    </div>
  );
}
