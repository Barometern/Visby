import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import PuzzleGrid from '@/components/PuzzleGrid';
import { Button } from '@/components/ui/button';

export default function LocationDetailPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { language, locations, locationsStatus } = useGameState();

  const location = locations.find((item) => item.id === locationId);
  const pieceIndex = locations.findIndex((item) => item.id === locationId);

  if (!location) {
    if (locationsStatus === 'idle' || locationsStatus === 'loading') {
      return (
        <div className="container mx-auto max-w-md px-4 py-16 text-center">
          <p className="font-body text-muted-foreground">{t('loadingLocations', language)}</p>
        </div>
      );
    }
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-body text-muted-foreground">{t('locationNotFound', language)}</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
          <ChevronLeft className="mr-1 h-4 w-4" /> {t('back', language)}
        </Button>
      </div>
    );
  }

  const galleryItems = location.images.length > 0 ? location.images.slice(0, 4) : [null, null];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 pb-24 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(38,28,20,0.98),rgba(18,13,10,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.34)] sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="font-heading text-2xl text-amber-50 sm:text-3xl">
            {location.name[language]}
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-heading text-amber-50 transition-all duration-200 hover:bg-white/10 hover:gap-3"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('back', language)}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {galleryItems.map((image, index) => (
            <div
              key={index}
              className="aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(92,69,45,0.88),rgba(39,28,20,0.98))] hover:scale-[1.02] transition-transform duration-300"
            >
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover hover:brightness-110 transition-all duration-300" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center font-body text-sm text-amber-100/55">
                  {t('placeholderImage', language)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:p-5 transition-all duration-300">
          <p className="font-body text-[15px] leading-7 text-amber-100/88">
            {location.description[language]}
          </p>
        </div>

        {pieceIndex >= 0 && (
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-medieval-gold/80">
              {t('pieceUnlocked', language)}
            </p>
            <PuzzleGrid highlightPiece={pieceIndex} interactive={false} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
