import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [constraints, setConstraints] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setBio(profile.bio || '');
      setConstraints(profile.constraints || '');
      setUniversity(profile.university || '');
      setMajor(profile.major || '');
      setYearOfStudy(profile.yearOfStudy || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.auth.updateProfile({
        firstName,
        lastName,
        bio,
        constraints,
        university,
        major,
        yearOfStudy,
      });
      await refreshProfile();
      toast({ title: 'Profile saved', description: 'Your details have been updated.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const initials = `${(firstName || '?')[0]}${(lastName || '')[0] || ''}`.toUpperCase();

  return (
    <div className="max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Help mYnd understand you better</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Avatar */}
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatarUrl || ''} />
              <AvatarFallback className="bg-primary/20 text-primary font-display text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="font-display font-semibold text-foreground text-lg">{firstName || 'Your Name'} {lastName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground">Personal Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">First name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Last name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">University</label>
            <input value={university} onChange={e => setUniversity(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="MIT, Stanford..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Major</label>
              <input value={major} onChange={e => setMajor(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Year</label>
              <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Select</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Grad Student">Grad Student</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bio & Constraints */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground">About You</h2>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Bio — Tell us about yourself</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="I'm a CS major who procrastinates on essays but crushes problem sets..."
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Constraints & schedule notes</label>
            <textarea
              value={constraints}
              onChange={e => setConstraints(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Part-time job Mon/Wed evenings. Can't focus after 9pm. Need breaks every 90 min..."
            />
            <p className="text-[10px] text-muted-foreground mt-1">This helps our AI understand your routine and make better scheduling decisions.</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
        </motion.button>
      </motion.div>
    </div>
  );
}
