import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useGameState, type LocationData } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import PuzzleGrid from './PuzzleGrid';

interface LocationScreenProps {
  location: LocationData;
  pieceIndex: number;
  onClose: () => void;
  alreadyScanned?: boolean;
}

export default function LocationScreen({ location, pieceIndex, onClose, alreadyScanned = false }: LocationScreenProps) {
  const { language } = useGameState();
  const galleryItems = location.images.length > 0 ? location.images.slice(0, 4) : [null, null];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(10,8,6,0.94)]"
    >
      <div className="mx-auto min-h-screen max-w-3xl px-4 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(38,28,20,0.98),rgba(18,13,10,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              {alreadyScanned && (
                <div className="mb-2 inline-flex rounded-full border border-medieval-gold/20 bg-medieval-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-medieval-gold">
                  {t('alreadyScanned', language)}
                </div>
              )}
              <h2 className="font-heading text-2xl text-amber-50 sm:text-3xl">
                {location.name[language]}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-3 text-amber-50 transition-colors hover:bg-white/10"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {galleryItems.map((image, index) => (
              <div
                key={index}
                className="aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(92,69,45,0.88),rgba(39,28,20,0.98))]"
              >
                {image ? (
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center font-body text-sm text-amber-100/55">
                    Placeholder image
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="font-body text-[15px] leading-7 text-amber-100/88">
              {location.description[language]}
            </p>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-medieval-gold/80">
              {t('pieceUnlocked', language)}
            </p>
            <PuzzleGrid highlightPiece={pieceIndex} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
