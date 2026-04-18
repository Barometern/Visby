import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import balleBaggeFraga from '@/assets/balleBagge/balleBagge-fraga.png';
import { Loader2, MapPin, TriangleAlert } from 'lucide-react';

interface FailsafeModalProps {
  open: boolean;
  onClose: () => void;
  targetLocationId: string | null;
  onUnlock: (locationId: string) => void;
}

type GpsStatus = 'idle' | 'loading' | 'error_far' | 'error_denied' | 'error_general';
type ReportStatus = 'idle' | 'loading' | 'error';

export default function FailsafeModal({ open, onClose, targetLocationId, onUnlock }: FailsafeModalProps) {
  const { language, manualCodeUnlock, gpsUnlock, reportDamaged } = useGameState();

  const [manualCode, setManualCode] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<'invalid' | 'not_found' | null>(null);

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [reportStatus, setReportStatus] = useState<ReportStatus>('idle');

  const inputRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setManualCode('');
    setManualLoading(false);
    setManualError(null);
    setGpsStatus('idle');
    setReportStatus('idle');
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onClose();
      resetState();
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim() || manualLoading) return;
    setManualError(null);
    setManualLoading(true);
    try {
      const result = await manualCodeUnlock(manualCode.trim());
      onUnlock(result.locationId);
      resetState();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'no_location_found') {
        setManualError('not_found');
      } else {
        setManualError('invalid');
      }
    } finally {
      setManualLoading(false);
    }
  }

  async function handleGpsUnlock() {
    if (!targetLocationId || gpsStatus === 'loading') return;
    setGpsStatus('loading');

    if (!navigator.geolocation) {
      setGpsStatus('error_denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await gpsUnlock(targetLocationId, pos.coords.latitude, pos.coords.longitude);
          onUnlock(targetLocationId);
          resetState();
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          if (msg === 'too_far') {
            setGpsStatus('error_far');
          } else {
            setGpsStatus('error_general');
          }
        }
      },
      (err) => {
        // err.code === 1 is PERMISSION_DENIED per the Geolocation spec
        if (err.code === 1) {
          setGpsStatus('error_denied');
        } else {
          setGpsStatus('error_general');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  async function handleReportDamaged() {
    if (!targetLocationId || reportStatus === 'loading') return;
    setReportStatus('loading');
    try {
      await reportDamaged(targetLocationId);
      onUnlock(targetLocationId);
      resetState();
    } catch {
      setReportStatus('error');
    }
  }

  const gpsErrorKey =
    gpsStatus === 'error_far' ? 'failsafeGpsErrorFar' :
    gpsStatus === 'error_denied' ? 'failsafeGpsErrorDenied' :
    gpsStatus === 'error_general' ? 'failsafeGpsErrorGeneral' : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-[1.4rem] border border-[#bf9961]/30 bg-[linear-gradient(160deg,#faf4e8,#f0e4c8)] p-0 shadow-[0_24px_56px_rgba(32,18,8,0.28)] overflow-hidden">
        {/* Balle Bagge header */}
        <div className="relative flex flex-col items-center bg-[linear-gradient(180deg,rgba(212,179,120,0.28),transparent)] px-6 pb-2 pt-6">
          <motion.img
            src={balleBaggeFraga}
            alt="Balle Bagge"
            className="h-24 w-auto drop-shadow-md"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <DialogHeader className="mt-3 text-center">
            <DialogTitle className="font-display text-xl leading-snug text-[#2e1a0e]">
              {t('failsafeModalTitle', language)}
            </DialogTitle>
          </DialogHeader>
          <p className="mt-1 text-center font-body text-[13px] leading-relaxed text-[#5b3d22]/75">
            {t('failsafeModalSubtitle', language)}
          </p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[#bf9961]/40 to-transparent" />
        </div>

        <div className="space-y-1 px-5 pb-6">

          {/* ── PRIMARY: Manual code ── */}
          <section className="rounded-[1rem] border border-[#bf9961]/30 bg-[rgba(255,250,237,0.7)] p-4">
            <h3 className="font-heading text-[15px] font-semibold text-[#2e1a0e]">
              {t('failsafeManualTitle', language)}
            </h3>
            <p className="mt-1 font-body text-[13px] leading-relaxed text-[#5b3d22]/80">
              {t('failsafeManualDesc', language)}
            </p>
            <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
              <Input
                ref={inputRef}
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value.toUpperCase());
                  setManualError(null);
                }}
                placeholder={t('failsafeManualPlaceholder', language)}
                className="h-10 flex-1 rounded-[8px] border-[#bf9961]/40 bg-white/70 font-body text-sm uppercase tracking-wider text-[#2e1a0e] placeholder:normal-case placeholder:tracking-normal placeholder:text-[#9a7850]/60"
                disabled={manualLoading}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
              <Button
                type="submit"
                disabled={!manualCode.trim() || manualLoading}
                className="h-10 rounded-[8px] bg-[#1C2E4A] px-4 font-heading text-sm text-[#f2e8d5] hover:bg-[#2a3f5f] disabled:opacity-50"
              >
                {manualLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : t('failsafeManualSubmit', language)
                }
              </Button>
            </form>
            <AnimatePresence>
              {manualError && (
                <motion.p
                  key={manualError}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 font-body text-[12px] leading-snug text-[#8b3a2a]"
                >
                  {t(
                    manualError === 'not_found'
                      ? 'failsafeManualErrorNotFound'
                      : 'failsafeManualErrorInvalid',
                    language,
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </section>

          {/* ── SECONDARY: GPS unlock ── */}
          {targetLocationId && (
            <section className="rounded-[1rem] border border-[#bf9961]/20 bg-[rgba(255,250,237,0.45)] px-4 py-3">
              <h3 className="font-heading text-[14px] font-semibold text-[#2e1a0e]">
                {t('failsafeGpsTitle', language)}
              </h3>
              <p className="mt-1 font-body text-[12px] leading-relaxed text-[#5b3d22]/70">
                {t('failsafeGpsDesc', language)}
              </p>
              <Button
                variant="outline"
                onClick={handleGpsUnlock}
                disabled={gpsStatus === 'loading'}
                className="mt-3 h-9 w-full rounded-[8px] border-[#bf9961]/40 bg-transparent font-heading text-[13px] text-[#2e1a0e] hover:bg-[#f0e4c8]/60"
              >
                {gpsStatus === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t('failsafeGpsChecking', language)}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {t('failsafeGpsButton', language)}
                  </span>
                )}
              </Button>
              <AnimatePresence>
                {gpsErrorKey && (
                  <motion.p
                    key={gpsStatus}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 font-body text-[12px] leading-snug text-[#8b3a2a]"
                  >
                    {t(gpsErrorKey, language)}
                  </motion.p>
                )}
              </AnimatePresence>
            </section>
          )}

          {/* ── TERTIARY: Report damaged ── */}
          {targetLocationId && (
            <section className="rounded-[1rem] px-4 py-3">
              <h3 className="font-heading text-[13px] font-medium text-[#2e1a0e]/80">
                {t('failsafeReportTitle', language)}
              </h3>
              <p className="mt-1 font-body text-[12px] leading-relaxed text-[#5b3d22]/60">
                {t('failsafeReportDesc', language)}
              </p>
              <Button
                variant="ghost"
                onClick={handleReportDamaged}
                disabled={reportStatus === 'loading'}
                className="mt-2 h-8 w-full rounded-[8px] font-body text-[12px] text-[#5b3d22]/60 hover:bg-[#f0e4c8]/50 hover:text-[#5b3d22]"
              >
                {reportStatus === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t('failsafeReportLoading', language)}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <TriangleAlert className="h-3 w-3" />
                    {t('failsafeReportButton', language)}
                  </span>
                )}
              </Button>
              <AnimatePresence>
                {reportStatus === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1 text-center font-body text-[11px] text-[#8b3a2a]"
                  >
                    {t('failsafeReportError', language)}
                  </motion.p>
                )}
              </AnimatePresence>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
