import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import QRScanner from '@/components/QRScanner';
import ScanRevealAnimation from '@/components/ScanRevealAnimation';
import LocationScreen from '@/components/LocationScreen';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Lock, MapPinned, QrCode, ScrollText, Sparkles } from 'lucide-react';

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
  const [alreadyScannedTimer, setAlreadyScannedTimer] = useState<number | null>(null);

  // Reset to scanning when navigating to this page
  useEffect(() => {
    setPhase('scanning');
    setScannedLocationId(null);
    setScanError(null);
    setAlreadyScannedNotice(false);
    if (alreadyScannedTimer) {
      window.clearTimeout(alreadyScannedTimer);
      setAlreadyScannedTimer(null);
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

  const resolveScannedLocationId = (decodedText: string) => {
    const normalizedText = decodedText.trim();
    const loweredText = normalizedText.toLowerCase();

    const directMatch = locations.find((location) => {
      const qrCode = location.qrCode?.trim().toLowerCase();
      return (
        location.id.toLowerCase() === loweredText ||
        qrCode === loweredText
      );
    });

    if (directMatch) return directMatch.id;

    const visbyQuestMatch = loweredText.match(/visby-quest-(\d+)/);
    if (visbyQuestMatch) {
      const qrCode = `visby-quest-${visbyQuestMatch[1]}`;
      const byQuestCode = locations.find((location) => location.qrCode.toLowerCase() === qrCode);
      if (byQuestCode) return byQuestCode.id;
    }

    const locIdMatch = loweredText.match(/loc-\d+/);
    if (locIdMatch) {
      const byLocId = locations.find((location) => location.id.toLowerCase() === locIdMatch[0]);
      if (byLocId) return byLocId.id;
    }

    try {
      const url = new URL(normalizedText);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1]?.toLowerCase();
      const locationIdParam = url.searchParams.get('locationId')?.toLowerCase();
      const qrParam = url.searchParams.get('qr')?.toLowerCase() ?? url.searchParams.get('code')?.toLowerCase();

      const urlMatch = locations.find((location) =>
        location.id.toLowerCase() === lastSegment ||
        location.id.toLowerCase() === locationIdParam ||
        location.qrCode.toLowerCase() === lastSegment ||
        location.qrCode.toLowerCase() === qrParam,
      );

      if (urlMatch) return urlMatch.id;
    } catch {
      // Not a URL, continue.
    }

    return null;
  };

  const handleScan = async (decodedText: string) => {
    if (needsPayment) return true;
    setScanError(null);
    setAlreadyScannedNotice(false);

    const locationId = resolveScannedLocationId(decodedText);

    if (!locationId) {
      setScanError(`Scanned QR code does not match any loaded location. Received: ${decodedText}`);
      return false;
    }

    try {
      const result = await scanLocation(locationId);
      setScannedLocationId(locationId);

      if (result.alreadyScanned) {
        if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
        setAlreadyScannedNotice(true);
        if (alreadyScannedTimer) {
          window.clearTimeout(alreadyScannedTimer);
        }
        const timer = window.setTimeout(() => {
          setAlreadyScannedNotice(false);
          setAlreadyScannedTimer(null);
        }, 4200);
        setAlreadyScannedTimer(timer);
        return false;
      }

      // Woosh + chime sound effect only for new successful scans
      try {
        const ctx = new AudioContext();

        const bufferSize = ctx.sampleRate * 0.4;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2000, ctx.currentTime);
        noiseFilter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
        noiseFilter.Q.value = 2;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start();

        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chime.type = 'sine';
        chime.frequency.setValueAtTime(523, ctx.currentTime + 0.2);
        chime.frequency.setValueAtTime(659, ctx.currentTime + 0.35);
        chime.frequency.setValueAtTime(784, ctx.currentTime + 0.5);
        chime.frequency.setValueAtTime(1047, ctx.currentTime + 0.65);
        chimeGain.gain.setValueAtTime(0, ctx.currentTime);
        chimeGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.25);
        chimeGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        chime.start(ctx.currentTime + 0.2);
        chime.stop(ctx.currentTime + 1);

        setTimeout(() => {
          const thud = ctx.createOscillator();
          const thudGain = ctx.createGain();
          thud.connect(thudGain);
          thudGain.connect(ctx.destination);
          thud.type = 'sine';
          thud.frequency.setValueAtTime(80, ctx.currentTime);
          thud.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
          thudGain.gain.setValueAtTime(0.3, ctx.currentTime);
          thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          thud.start();
          thud.stop(ctx.currentTime + 0.3);
        }, 2500);
      } catch {}

      setPhase('reveal');
      return true;
    } catch (error) {
      console.error(error);
      setScanError(error instanceof Error ? error.message : 'Scan failed.');
      return false;
    }
  };

  const handleRevealComplete = () => {
    setPhase('location');
  };

  if (!isLoggedIn) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16 text-center">
        <QrCode className="w-16 h-16 text-medieval-gold mx-auto mb-4" />
        <h2 className="font-heading text-2xl text-foreground mb-4">{t('scanTitle', language)}</h2>
        <p className="font-body text-muted-foreground mb-6">{t('scanInstructions', language)}</p>
        <Link to="/login">
          <Button className="bg-medieval-gold text-medieval-brown hover:bg-medieval-gold/90 font-heading">
            {t('login', language)}
          </Button>
        </Link>
      </div>
    );
  }

  if (needsPayment) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16 text-center">
        <div className="parchment-bg stone-border rounded-lg p-8">
          <Lock className="w-12 h-12 text-medieval-gold mx-auto mb-4" />
          <h2 className="font-heading text-2xl text-foreground mb-2">{t('paywallTitle', language)}</h2>
          <p className="font-body text-muted-foreground mb-6">{t('paywallDesc', language)}</p>
          <Button
            className="bg-medieval-gold text-medieval-brown hover:bg-medieval-gold/90 font-heading w-full"
            onClick={() => void purchaseFullAccess()}
          >
            {t('payWithKlarna', language)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 pb-24 sm:py-8">
      <section className="rounded-[2rem] border border-medieval-gold/15 bg-[linear-gradient(180deg,rgba(39,28,20,0.97),rgba(16,11,8,0.98))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)] sm:p-6">
        <div className="space-y-6">
          {phase === 'scanning' && <QRScanner onScan={handleScan} />}

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-medieval-gold/20 bg-medieval-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-medieval-gold">
              <Sparkles className="h-3.5 w-3.5" />
              Scan
            </div>

            <h1 className="font-heading text-3xl text-amber-50 sm:text-4xl">
              {t('scanTitle', language)}
            </h1>

            <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-amber-100/72">
              {t('scanInstructions', language)}
            </p>

            {!hasPaid && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-medieval-gold/20 bg-black/20 px-4 py-2 text-sm font-body text-medieval-gold">
                <Sparkles className="h-4 w-4" />
                {freeScansLeft} {t('freeScansLeft', language)}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-medieval-gold">
                  <QrCode className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">1. Find the code</span>
                </div>
                <p className="font-body text-sm text-amber-100/75">
                  Look for the Visby Quest QR marker at the site.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-medieval-gold">
                  <MapPinned className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">2. Hold steady</span>
                </div>
                <p className="font-body text-sm text-amber-100/75">
                  Keep the code centered until you hear the success sound.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-medieval-gold">
                  <ScrollText className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">3. Unlock the story</span>
                </div>
                <p className="font-body text-sm text-amber-100/75">
                  Read the location info and collect the next puzzle piece.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {alreadyScannedNotice && (
        <div className="fixed inset-x-4 top-4 z-[95] mx-auto max-w-xl rounded-2xl border border-medieval-gold/25 bg-[linear-gradient(180deg,rgba(201,168,76,0.18),rgba(67,47,29,0.92))] p-4 text-center shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm">
          <p className="font-body text-sm leading-6 text-amber-50/95">
            Du har redan skannat denna, tryck på pusselbiten för att se informationen om platsen.
          </p>
        </div>
      )}

      {scanError && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-center">
          <p className="font-body text-sm text-destructive">{scanError}</p>
        </div>
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
