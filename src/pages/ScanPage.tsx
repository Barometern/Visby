import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import QRScanner from '@/components/QRScanner';
import ScanRevealAnimation from '@/components/ScanRevealAnimation';
import LocationScreen from '@/components/LocationScreen';
import balleBaggePekar from '@/assets/balleBagge/balleBagge-pekar.png';
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
        <QrCode className="w-16 h-16 text-medieval-gold mx-auto mb-4" />
        <h2 className="font-display text-2xl text-foreground mb-4">{t('scanTitle', language)}</h2>
        <p className="font-body text-muted-foreground mb-6">{t('scanInstructions', language)}</p>
        <Link to="/login">
          <Button className="bg-medieval-gold text-medieval-brown hover:bg-medieval-gold/90 font-heading">
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
          className="parchment-bg stone-border rounded-lg p-8"
        >
          <Lock className="w-12 h-12 text-medieval-gold mx-auto mb-4" />
          <h2 className="font-display text-2xl text-foreground mb-2">{t('paywallTitle', language)}</h2>
          <p className="font-body text-muted-foreground mb-6">{t('paywallDesc', language)}</p>
          <Button
            className="bg-medieval-gold text-medieval-brown hover:bg-medieval-gold/90 font-heading w-full"
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
      <section className="rounded-[2rem] border border-[#dabc86]/22 bg-[linear-gradient(180deg,rgba(247,239,224,0.98),rgba(233,216,184,0.96))] p-5 text-[#4b3320] shadow-[0_22px_60px_rgba(74,50,29,0.16)] sm:p-6 transition-all duration-300">
        <div className="relative space-y-6">
          {phase === 'scanning' && <QRScanner onScan={handleScan} />}

          {phase === 'scanning' && showFirstVisitHint && (
            <motion.div
              animate={{ opacity: isAtTop ? 1 : 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{ pointerEvents: isAtTop ? 'auto' : 'none' }}
              className="fixed bottom-2 left-0 z-[60] flex flex-col items-start px-1 md:hidden"
            >
              <div className="relative mb-1.5 ml-1 max-w-[min(100vw-5.5rem,15rem)] rounded-[24px] border border-[#e8c98f]/26 bg-[linear-gradient(180deg,rgba(255,249,235,0.98),rgba(244,229,198,0.96))] px-4 py-3 text-left text-[#3a2518] shadow-[0_18px_45px_rgba(64,42,22,0.18)]">
                <p className="font-body text-sm leading-6">{t('mascotScanHint', language)}</p>
                <div className="absolute bottom-[-8px] left-8 h-4 w-4 rotate-45 border-b border-r border-[#e8c98f]/26 bg-[#f4e5c6]" />
              </div>

              <motion.img
                src={balleBaggePekar}
                alt=""
                aria-hidden="true"
                draggable={false}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="ml-0 w-[7.5rem] max-w-none select-none drop-shadow-[0_18px_28px_rgba(38,23,13,0.22)]"
              />
            </motion.div>
          )}

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d6b578]/26 bg-[#f5e7c5]/86 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a6b31]">
              <Sparkles className="h-3.5 w-3.5" />
              {t('scanBadge', language)}
            </div>

            <h1 className="font-display text-3xl text-[#342014] sm:text-4xl">
              {t('scanTitle', language)}
            </h1>

            <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-[#5b4330]/82">
              {t('scanInstructions', language)}
            </p>

            {!hasPaid && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d6b578]/24 bg-[rgba(255,248,235,0.72)] px-4 py-2 text-sm font-body text-[#8d602c]">
                <Sparkles className="h-4 w-4" />
                {freeScansLeft} {t('freeScansLeft', language)}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-[#d7ba87]/24 bg-[rgba(255,250,240,0.55)] p-4 transition-all duration-200">
                <div className="mb-2 flex items-center gap-2 text-[#9a6b31]">
                  <QrCode className="h-4 w-4" />
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.2em]">{t('step1FindCode', language)}</span>
                </div>
                <p className="font-body text-sm text-[#5b4330]/82">
                  {t('step1FindCodeDesc', language)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#d7ba87]/24 bg-[rgba(255,250,240,0.55)] p-4 transition-all duration-200">
                <div className="mb-2 flex items-center gap-2 text-[#9a6b31]">
                  <MapPinned className="h-4 w-4" />
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.2em]">{t('step2HoldSteady', language)}</span>
                </div>
                <p className="font-body text-sm text-[#5b4330]/82">
                  {t('step2HoldSteadyDesc', language)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#d7ba87]/24 bg-[rgba(255,250,240,0.55)] p-4 transition-all duration-200">
                <div className="mb-2 flex items-center gap-2 text-[#9a6b31]">
                  <ScrollText className="h-4 w-4" />
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.2em]">{t('step3UnlockStory', language)}</span>
                </div>
                <p className="font-body text-sm text-[#5b4330]/82">
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
            className="fixed inset-x-4 top-4 z-[95] mx-auto max-w-xl rounded-2xl border border-medieval-gold/25 bg-[linear-gradient(180deg,rgba(201,168,76,0.18),rgba(67,47,29,0.92))] p-4 text-center shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm"
          >
            <p className="font-body text-sm leading-6 text-amber-50/95">
              {t('alreadyScanned', language)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {scanError && (
        <motion.div
          className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-center"
          initial={{ x: 0 }}
          animate={{ x: [-6, 6, -5, 5, -3, 3, 0] }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <p className="font-body text-sm text-destructive">{scanError}</p>
          <p className="font-body text-xs text-destructive/70 mt-1">{t('scanErrorHint', language)}</p>
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
