import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

const ADMIN_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === 'true';

export default function LoginPage() {
  const { language, login, signup } = useGameState(useShallow((s) => ({
    language: s.language,
    login: s.login,
    signup: s.signup,
  })));
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup && password !== confirmPassword) {
      setError(t('passwordsMismatch', language));
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }

      const isAdmin = useGameState.getState().isAdmin && ADMIN_ENABLED;
      navigate(isAdmin ? '/admin' : '/puzzle');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('authError', language));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-sm mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="parchment-bg stone-border rounded-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-medieval-gold/20 flex items-center justify-center mx-auto mb-4 animate-float">
            <Shield className="w-8 h-8 text-medieval-gold" />
          </div>
          <h1 className="font-heading text-2xl text-foreground">
            {isSignup ? t('signupTitle', language) : t('loginTitle', language)}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-body text-foreground">{t('email', language)}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50 border-medieval-stone/30 font-body focus:ring-2 focus:ring-medieval-gold/40 transition-all duration-200"
            />
          </div>
          <div>
            <Label className="font-body text-foreground">{t('password', language)}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50 border-medieval-stone/30 font-body focus:ring-2 focus:ring-medieval-gold/40 transition-all duration-200"
            />
          </div>
          {isSignup && (
            <div>
              <Label className="font-body text-foreground">{t('confirmPassword', language)}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-background/50 border-medieval-stone/30 font-body focus:ring-2 focus:ring-medieval-gold/40 transition-all duration-200"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-medieval-gold text-medieval-brown hover:bg-medieval-gold/90 font-heading hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150"
          >
            {isSubmitting ? '...' : isSignup ? t('signup', language) : t('login', language)}
          </Button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.p
              key={error}
              className="mt-4 text-center text-sm text-red-500"
              initial={{ x: 0 }}
              animate={{ x: [-4, 4, -3, 3, 0] }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-center mt-4 font-body text-sm text-muted-foreground">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-medieval-gold hover:underline"
          >
            {isSignup ? t('hasAccount', language) : t('noAccount', language)}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
