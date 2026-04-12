import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import MascotGuide from '@/components/MascotGuide';

export default function ClaimRewardPage() {
  const { language, questCompletedAt } = useGameState();
  const navigate = useNavigate();

  const completedDate = questCompletedAt
    ? new Intl.DateTimeFormat(
        language === 'sv' ? 'sv-SE' : language === 'de' ? 'de-DE' : 'en-GB',
        { year: 'numeric', month: 'long', day: 'numeric' }
      ).format(new Date(questCompletedAt))
    : '';

  return (
    <div className="min-h-screen bg-[#F2E8D5] flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md flex flex-col items-center gap-8"
      >
        {/* Mascot with speech bubble */}
        <MascotGuide
          pose="welcome"
          position="center"
          text="You've done it! Show this page at the café to claim your reward, lamb."
          variant="parchment"
        />

        {/* Certificate card */}
        <div className="relative w-full bg-[#FAF6EE] border-2 border-[#7A5230]/50 rounded-[16px] shadow-[4px_6px_0px_rgba(122,82,48,0.25)] px-8 py-10 text-center overflow-hidden">
          {/* Decorative double-line top border */}
          <div className="absolute top-3 left-5 right-5 h-px bg-[#7A5230]/35" />
          <div className="absolute top-5 left-5 right-5 h-px bg-[#7A5230]/20" />

          {/* Quest Complete heading */}
          <h1 className="font-display text-4xl text-[#2C1A0E] mt-2 mb-1">
            {t('puzzleComplete', language)}
          </h1>

          {/* Eyebrow label */}
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7A5230] mt-3">
            {t('claimReward', language)}
          </p>

          {/* Completion date */}
          {completedDate && (
            <p className="mt-2 font-body text-sm text-[#7A5230]/80">
              {completedDate}
            </p>
          )}

          {/* Wax seal */}
          <motion.div
            className="mx-auto mt-6 relative"
            style={{ width: 80, height: 80 }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: '#6B1414',
                boxShadow: '0 4px 14px rgba(139,26,26,0.45)',
              }}
            />
            {/* Inner disc */}
            <div
              className="absolute inset-[4px] rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 38% 34%, #A52020, #8B1A1A 55%, #6B1414)',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.25)',
              }}
            >
              <span className="font-display text-lg text-[#FAF6EE] select-none" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                VQ
              </span>
            </div>
            {/* Decorative ring dots */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
              const r = 34;
              const cx = 40 + r * Math.cos(angle);
              const cy = 40 + r * Math.sin(angle);
              return (
                <div
                  key={i}
                  className="absolute rounded-full bg-[#FAF6EE]/40"
                  style={{ width: 3, height: 3, left: cx - 1.5, top: cy - 1.5 }}
                />
              );
            })}
          </motion.div>

          {/* Reward instructions */}
          <p className="mt-6 font-body text-sm leading-6 text-[#2C1A0E]/70">
            {t('rewardText', language)}
          </p>

          {/* Decorative double-line bottom border */}
          <div className="absolute bottom-5 left-5 right-5 h-px bg-[#7A5230]/20" />
          <div className="absolute bottom-3 left-5 right-5 h-px bg-[#7A5230]/35" />
        </div>

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/puzzle')}
          className="font-body text-sm text-[#7A5230] border border-[#7A5230]/40 rounded-[4px] px-5 py-2 hover:bg-[#7A5230]/5 transition-colors duration-200"
        >
          ← {t('back', language)}
        </button>
      </motion.div>
    </div>
  );
}
