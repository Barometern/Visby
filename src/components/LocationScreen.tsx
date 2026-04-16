import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useGameState, type LocationData } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import PuzzleGrid from './PuzzleGrid';
import MascotGuide from './MascotGuide';

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
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(10,8,6,0.88)]"
    >
      <div className="mx-auto min-h-screen max-w-3xl px-4 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[16px] border-2 border-[#7A5230]/50 bg-[#F2E8D5] p-4 shadow-[4px_6px_0px_rgba(122,82,48,0.25)] sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              {alreadyScanned && (
                <div className="mb-2 inline-flex rounded-[4px] border border-[#1C2E4A]/30 bg-[#1C2E4A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1C2E4A] animate-fade-in">
                  {t('alreadyScanned', language)}
                </div>
              )}
              <h2 className="font-heading text-2xl text-[#2C1A0E] sm:text-3xl">
                {location.name[language]}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t('close', language)}
              className="rounded-[8px] border border-[#7A5230]/40 bg-[#FAF6EE] p-3 text-[#2C1A0E] transition-transform duration-200 hover:scale-110 hover:rotate-6 hover:bg-[#F2E8D5]"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {galleryItems.map((image, index) => (
              <div
                key={index}
                className="aspect-[4/3] overflow-hidden rounded-[12px] border border-[#7A5230]/30 bg-[#e8d9c0] hover:scale-[1.02] transition-transform duration-300"
              >
                {image ? (
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center font-body text-sm text-[#2C1A0E]/50">
                    {t('placeholderImage', language)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[12px] border border-[#7A5230]/30 bg-[#FAF6EE] p-4 sm:p-5">
            <p className="font-body text-[15px] leading-7 text-[#2C1A0E]">
              {location.description[language]}
            </p>
          </div>

          <div className="mt-5">
            <MascotGuide
              pose="map"
              position="inline"
              text="Here is where history lived."
              lambSuffix={true}
              variant="parchment"
            />
          </div>

          <div className="mt-5 rounded-[12px] border border-[#7A5230]/30 bg-[#FAF6EE] p-4 sm:p-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#1C2E4A]">
              {t('pieceUnlocked', language)}
            </p>
            <PuzzleGrid highlightPiece={pieceIndex} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
