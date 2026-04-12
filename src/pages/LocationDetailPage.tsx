import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import PuzzleGrid from '@/components/PuzzleGrid';
import MascotGuide from '@/components/MascotGuide';
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
          <p className="font-body text-[#2C1A0E]/60">{t('loadingLocations', language)}</p>
        </div>
      );
    }
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-body text-[#2C1A0E]/60">{t('locationNotFound', language)}</p>
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
        className="rounded-[16px] border-2 border-[#7A5230]/50 bg-[#F2E8D5] p-4 shadow-[4px_6px_0px_rgba(122,82,48,0.25)] sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="font-heading text-2xl text-[#2C1A0E] sm:text-3xl">
            {location.name[language]}
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-[4px] border border-[#7A5230]/40 bg-[#FAF6EE] px-4 py-2 text-sm font-heading text-[#2C1A0E] transition-all duration-200 hover:bg-[#F2E8D5] hover:gap-3"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('back', language)}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {galleryItems.map((image, index) => (
            <div
              key={index}
              className="aspect-[4/3] overflow-hidden rounded-[12px] border border-[#7A5230]/30 bg-[#e8d9c0] hover:scale-[1.02] transition-transform duration-300"
            >
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover hover:brightness-110 transition-all duration-300" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center font-body text-sm text-[#2C1A0E]/50">
                  {t('placeholderImage', language)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[12px] border border-[#7A5230]/30 bg-[#FAF6EE] p-4 sm:p-5 transition-all duration-300">
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

        {pieceIndex >= 0 && (
          <div className="mt-5 rounded-[12px] border border-[#7A5230]/30 bg-[#FAF6EE] p-4 sm:p-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#1C2E4A]">
              {t('pieceUnlocked', language)}
            </p>
            <PuzzleGrid highlightPiece={pieceIndex} interactive={false} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
