import { Dialog, DialogContent } from '@/components/ui/dialog';
import { t, type Language } from '@/lib/i18n';
import { MapPin, Clock } from 'lucide-react';

interface Props {
  open: boolean;
  language: Language;
  onSelect: (length: 10 | 15) => void;
}

export default function RouteSelectionModal({ open, language, onSelect }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-sm rounded-[8px] border-2 border-[#7A5230]/40 bg-[#F2E8D5] p-6 shadow-xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-center">
          <h2 className="font-display text-2xl text-[#2C1A0E] tracking-wide">
            {t('routeSelectTitle', language)}
          </h2>
          <p className="mt-1 font-body text-sm text-[#2C1A0E]/60">
            {t('routeSelectSubtitle', language)}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {([10, 15] as const).map((len) => (
            <button
              key={len}
              onClick={() => onSelect(len)}
              className="flex flex-col items-center gap-3 rounded-[6px] border-2 border-[#7A5230]/30 bg-white/60 px-3 py-5 transition-all hover:border-[#c9a84c] hover:bg-[#faf6ee] hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C2E4A]/10">
                <MapPin className="h-5 w-5 text-[#1C2E4A]" />
              </div>
              <div className="text-center">
                <div className="font-heading text-base font-semibold text-[#2C1A0E]">
                  {t(len === 10 ? 'routeShortLabel' : 'routeLongLabel', language)}
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 font-body text-xs text-[#2C1A0E]/55">
                  <Clock className="h-3 w-3" />
                  {t(len === 10 ? 'routeShortDesc' : 'routeLongDesc', language)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
