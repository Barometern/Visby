import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import QRScanner from '@/components/QRScanner';
import ScanRevealAnimation from '@/components/ScanRevealAnimation';
import LocationScreen from '@/components/LocationScreen';
import MascotGuide from '@/components/MascotGuide';
import { playSuccessfulScanSound } from '@/lib/audio';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import { resolveScannedLocationId } from '@/lib/qr';
import { Button } from '@/components/ui/button';
import { Lock, MapPinned, QrCode, ScrollText, Sparkles } from 'lucide-react';

const SCAN_HINT_SEEN_KEY = 'visby-quest-scan-hint-seen';

export default function ScanPage() {
  const {
    language, isLoggedIn, hasPaid, scannedLocations, locations,
    scanLocation, purchaseFullAccess,
  } = useGameState();

  const routeLocation = useLocation();

  const [phase, setPhase] = useState<'scanning' | 'reveal' | 'location'>('scanning');
  const [scannedLocationId, setScannedLocationId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [alreadyScannedNotice, setAlreadyScannedNotice] = useState(false);
  const alreadyScannedTimerRef = useRef<number | null>(null);

  const [isAtTop, setIsAtTop] = useState(true);
  const [showFirstVisitHint, setShowFirstVisitHint] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY < 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    try {
      const hasSeenHint = window.localStorage.getItem(SCAN_HINT_SEEN_KEY) === 'true';

      if (!hasSeenHint) {
        setShowFirstVisitHint(true);
        window.localStorage.setItem(SCAN_HINT_SEEN_KEY, 'true');
      }
    } catch {
      // If localStorage is unavailable, skip the hint rather than forcing it on every load.
    }
  }, []);

  // Reset to scanning when navigating to this page
  useEffect(() => {
    setPhase('scanning');
    setScannedLocationId(null);
    setScanError(null);
    setAlreadyScannedNotice(false);
    if (alreadyScannedTimerRef.current) {
      window.clearTimeout(alreadyScannedTimerRef.current);
      alreadyScannedTimerRef.current = null;
    }
  }, [routeLocation.key]);

  const freeScansLeft = Math.max(0, 2 - scannedLocations.length);
  const needsPayment = !hasPaid && scannedLocations.length >= 2;
  const scannedLocation = scannedLocationId
    ? locations.find((location) => location.id === scannedLocationId) ?? null
    : null;
  const scannedPieceIndex = scannedLocation
    ? locations.findIndex((location) => location.id === scannedLocation.id)
    : -1;

  const handleScan = async (decodedText: string) => {
    if (needsPayment) return true;
    setScanError(null);
    setAlreadyScannedNotice(false);

    const locationId = resolveScannedLocationId(decodedText, locations);

    if (!locationId) {
      console.warn("Unrecognized QR code scanned.", decodedText);
      setScanError(t('scanMismatchError', language));
      return false;
    }

    try {
      const result = await scanLocation(locationId);
      setScannedLocationId(locationId);

      if (result.alreadyScanned) {
        if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
        setAlreadyScannedNotice(true);
        if (alreadyScannedTimerRef.current) {
          window.clearTimeout(alreadyScannedTimerRef.current);
        }
        alreadyScannedTimerRef.current = window.setTimeout(() => {
          setAlreadyScannedNotice(false);
          alreadyScannedTimerRef.current = null;
        }, 4200);
        return false;
      }

      playSuccessfulScanSound();

      setPhase('reveal');
      return true;
    } catch (error) {
      console.error(error);
      setScanError(error instanceof Error ? error.message : t('scanFailed', language));
      return false;
    }
  };

  const handleRevealComplete = () => {
    setPhase('location');
  };

  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-md mx-auto px-4 py-16 text-center"
      >
        <QrCode className="w-16 h-16 text-[#C9A84C] mx-auto mb-4" />
        <h2 className="font-display text-2xl text-[#2C1A0E] mb-4">{t('scanTitle', language)}</h2>
        <p className="font-body text-[#2C1A0E]/70 mb-6">{t('scanInstructions', language)}</p>
        <Link to="/login">
          <Button className="bg-[#1C2E4A] text-[#F2E8D5] rounded-[6px] hover:bg-[#2A3F5F] font-heading">
            {t('login', language)}
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (needsPayment) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FAF6EE] border-2 border-[#7A5230]/50 rounded-[16px] shadow-[4px_6px_0px_rgba(122,82,48,0.2)] p-8"
        >
          <Lock className="w-12 h-12 text-[#C9A84C] mx-auto mb-4" />
          <h2 className="font-display text-2xl text-[#2C1A0E] mb-2">{t('paywallTitle', language)}</h2>
          <p className="font-body text-[#2C1A0E]/70 mb-6">{t('paywallDesc', language)}</p>
          <Button
            className="bg-[#1C2E4A] text-[#F2E8D5] rounded-[6px] hover:bg-[#2A3F5F] font-heading w-full"
            onClick={() => void purchaseFullAccess()}
          >
            {t('payWithKlarna', language)}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 pb-24 sm:py-8">
      <section className="bg-[#F2E8D5] border-2 border-[#7A5230]/40 rounded-[16px] shadow-[4px_6px_0px_rgba(122,82,48,0.2)] p-5 text-[#2C1A0E] sm:p-6 transition-all duration-300">
        <div className="relative space-y-6">
          {phase === 'scanning' && <QRScanner onScan={handleScan} />}

          {phase === 'scanning' && showFirstVisitHint && (
            <motion.div
              animate={{ opacity: isAtTop ? 1 : 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{ pointerEvents: isAtTop ? 'auto' : 'none' }}
              className="md:hidden"
            >
              <MascotGuide
                pose="point"
                position="bottom-left"
                text={t('mascotScanHint', language)}
                lambSuffix={true}
              />
            </motion.div>
          )}

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-[4px] border border-[#7A5230]/30 bg-[#FAF6EE] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A5230]">
              <Sparkles className="h-3.5 w-3.5" />
              {t('scanBadge', language)}
            </div>

            <h1 className="font-display text-3xl text-[#2C1A0E] sm:text-4xl">
              {t('scanTitle', language)}
            </h1>

            <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-[#2C1A0E]/70">
              {t('scanInstructions', language)}
            </p>

            {!hasPaid && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-[4px] border border-[#7A5230]/30 bg-[#FAF6EE] px-4 py-2 text-sm font-body text-[#7A5230]">
                <Sparkles className="h-4 w-4" />
                {freeScansLeft} {t('freeScansLeft', language)}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div className="bg-[#FAF6EE] border border-[#7A5230]/30 rounded-[8px] p-4 transition-all duration-200">
                <div className="mb-2 flex items-center gap-2 text-[#7A5230]">
                  <QrCode className="h-4 w-4" />
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.2em]">{t('step1FindCode', language)}</span>
                </div>
                <p className="font-body text-sm text-[#2C1A0E]/70">
                  {t('step1FindCodeDesc', language)}
                </p>
              </div>

              <div className="bg-[#FAF6EE] border border-[#7A5230]/30 rounded-[8px] p-4 transition-all duration-200">
                <div className="mb-2 flex items-center gap-2 text-[#7A5230]">
                  <MapPinned className="h-4 w-4" />
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.2em]">{t('step2HoldSteady', language)}</span>
                </div>
                <p className="font-body text-sm text-[#2C1A0E]/70">
                  {t('step2HoldSteadyDesc', language)}
                </p>
              </div>

              <div className="bg-[#FAF6EE] border border-[#7A5230]/30 rounded-[8px] p-4 transition-all duration-200">
                <div className="mb-2 flex items-center gap-2 text-[#7A5230]">
                  <ScrollText className="h-4 w-4" />
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.2em]">{t('step3UnlockStory', language)}</span>
                </div>
                <p className="font-body text-sm text-[#2C1A0E]/70">
                  {t('step3UnlockStoryDesc', language)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {alreadyScannedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-x-4 top-4 z-[95] mx-auto max-w-xl rounded-[8px] bg-[#1C2E4A] p-4 text-center shadow-[4px_6px_0px_rgba(28,46,74,0.3)]"
          >
            <p className="font-body text-sm leading-6 text-[#FAF6EE]">
              {t('alreadyScanned', language)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {scanError && (
        <motion.div
          className="mt-4 rounded-[12px] border border-[#8B1A1A]/30 bg-[#8B1A1A]/10 p-4 text-center"
          initial={{ x: 0 }}
          animate={{ x: [-6, 6, -5, 5, -3, 3, 0] }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <p className="font-body text-sm text-[#8B1A1A]">{scanError}</p>
          <p className="font-body text-xs text-[#8B1A1A]/70 mt-1">{t('scanErrorHint', language)}</p>
        </motion.div>
      )}

      <AnimatePresence>
        {phase === 'reveal' && scannedLocation && scannedPieceIndex >= 0 && (
          <ScanRevealAnimation
            key={`reveal-${scannedLocation.id}-${scannedPieceIndex}`}
            pieceIndex={scannedPieceIndex}
            onComplete={handleRevealComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'location' && scannedLocation && scannedPieceIndex >= 0 && (
          <LocationScreen
            key={`location-${scannedLocation.id}-${scannedPieceIndex}`}
            location={scannedLocation}
            pieceIndex={scannedPieceIndex}
            onClose={() => setPhase('scanning')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
