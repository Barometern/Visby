import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, ChevronLeft } from 'lucide-react';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import wallTexture from '@/assets/wall-texture.jpg';

export default function ClaimRewardPage() {
  const { language } = useGameState();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4 pb-24"
      style={{
        backgroundImage: `url(${wallTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md text-center rounded-[1.75rem] p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(245,238,220,0.95), rgba(235,225,200,0.95))',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '2px solid rgba(201,168,76,0.4)',
        }}
      >
        <div className="w-20 h-20 rounded-full bg-medieval-gold/20 flex items-center justify-center mx-auto mb-4 gold-glow animate-glow-pulse">
          <Award className="w-10 h-10 text-medieval-gold" />
        </div>
        <h1 className="font-heading text-2xl text-medieval-gold medieval-shadow mb-2">
          {t('claimReward', language)}
        </h1>
        <p className="font-body text-muted-foreground mb-6">
          {t('rewardText', language)}
        </p>
        <Button
          variant="outline"
          className="font-heading border-medieval-gold/40 text-medieval-gold hover:bg-medieval-gold/10"
          onClick={() => navigate('/puzzle')}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('back', language)}
        </Button>
      </motion.div>
    </div>
  );
}
