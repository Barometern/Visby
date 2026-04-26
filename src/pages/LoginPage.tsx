import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import balleBaggeGlad from '@/assets/balleBagge/balleBagge-glad.png';

const ADMIN_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === 'true';

export default function LoginPage() {
  const { language, login, signup } = useGameState();
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
    <div className="min-h-screen flex items-center justify-center bg-[#F2E8D5] px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-[#FAF6EE] border-2 border-[#7A5230]/50 rounded-[16px] shadow-[4px_6px_0px_rgba(122,82,48,0.2)] p-8"
      >
        <div className="text-center mb-8">
          <img
            src={balleBaggeGlad}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="w-20 h-auto mx-auto mb-4"
          />
          <h1 className="font-heading text-2xl text-[#2C1A0E]">
            {isSignup ? t('signupTitle', language) : t('loginTitle', language)}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-body text-[#2C1A0E]">{t('email', language)}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/80 border border-[#7A5230]/50 rounded-[4px] text-[#2C1A0E] placeholder:text-[#2C1A0E]/40 focus:border-[#1C2E4A] focus-visible:ring-1 focus-visible:ring-[#1C2E4A]/30 font-body"
            />
          </div>
          <div>
            <Label className="font-body text-[#2C1A0E]">{t('password', language)}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/80 border border-[#7A5230]/50 rounded-[4px] text-[#2C1A0E] placeholder:text-[#2C1A0E]/40 focus:border-[#1C2E4A] focus-visible:ring-1 focus-visible:ring-[#1C2E4A]/30 font-body"
            />
          </div>
          {isSignup && (
            <div>
              <Label className="font-body text-[#2C1A0E]">{t('confirmPassword', language)}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/80 border border-[#7A5230]/50 rounded-[4px] text-[#2C1A0E] placeholder:text-[#2C1A0E]/40 focus:border-[#1C2E4A] focus-visible:ring-1 focus-visible:ring-[#1C2E4A]/30 font-body"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1C2E4A] text-[#F2E8D5] rounded-[6px] hover:bg-[#2A3F5F] font-heading transition-colors duration-200 shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)]"
          >
            {isSubmitting ? '...' : isSignup ? t('signup', language) : t('login', language)}
          </Button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.p
              key={error}
              className="mt-4 text-center text-sm text-[#8B1A1A]"
              initial={{ x: 0 }}
              animate={{ x: [-4, 4, -3, 3, 0] }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-center mt-4 font-body text-sm text-[#2C1A0E]/60">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            aria-label={isSignup ? t('hasAccount', language) : t('noAccount', language)}
            className="text-[#1C2E4A] underline hover:text-[#2A3F5F] transition-colors"
          >
            {isSignup ? t('hasAccount', language) : t('noAccount', language)}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
