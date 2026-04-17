import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, ScanLine } from 'lucide-react';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';

interface QRScannerProps {
  onScan: (decodedText: string) => boolean | Promise<boolean>;
  onFailsafe?: () => void;
}

export default function QRScanner({ onScan, onFailsafe }: QRScannerProps) {
  const { language } = useGameState();
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  const stoppingRef = useRef(false);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);
  const cooldownUntilRef = useRef(0);
  const lastScanTextRef = useRef('');
  const languageRef = useRef(language);

  onScanRef.current = onScan;
  languageRef.current = language;

  useEffect(() => {
    mountedRef.current = true;
    stoppingRef.current = false;

    const startScanner = async () => {
      if (!mountedRef.current) return;

      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (stoppingRef.current) return;

            const normalizedText = decodedText.trim();
            if (!normalizedText) return;
            const now = Date.now();

            if (
              processingRef.current ||
              (lastScanTextRef.current === normalizedText && now < cooldownUntilRef.current)
            ) {
              return;
            }

            try {
              processingRef.current = true;
              const shouldStop = await onScanRef.current(normalizedText);
              if (!shouldStop) return;

              stoppingRef.current = true;
              scanner.stop().catch(() => {});
            } catch {
              if (mountedRef.current) {
                setError(t('scanError', languageRef.current));
              }
            } finally {
              lastScanTextRef.current = normalizedText;
              cooldownUntilRef.current = Date.now() + 2500;
              processingRef.current = false;
            }
          },
          () => {},
        );

        if (mountedRef.current) {
          setIsScanning(true);
        } else {
          scanner.stop().catch(() => {});
        }
      } catch {
        if (mountedRef.current) {
          setError(t('scanError', languageRef.current));
        }
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;
      stoppingRef.current = true;
      const scanner = scannerRef.current;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner.stop().catch(() => {});
          }
        } catch {
          // Scanner can already be shutting down.
        }
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <section className="rounded-[1.9rem] border border-[#bf9961]/26 bg-[linear-gradient(180deg,rgba(230,212,181,0.74),rgba(164,122,78,0.32))] p-4 text-[#4b3320] shadow-[0_18px_44px_rgba(32,21,12,0.24)] sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#d6b578]/26 bg-[#f5e7c5]/86 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a6b31]">
            <ScanLine className="h-3.5 w-3.5" />
            {t('scannerLabel', language)}
          </div>
          <h2 className="font-heading text-[1.6rem] leading-none text-[#342014]">{t('scannerHeading', language)}</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-[#5b4330]/82">
            {t('scannerDescription', language)}
          </p>
        </div>

        <div className="rounded-full border border-[#d4b37a]/24 bg-[rgba(255,249,236,0.72)] p-2 text-[#9a6b31] shadow-[0_8px_18px_rgba(95,66,40,0.08)]">
          <Camera className="h-4 w-4" />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.55rem] border border-[#9c6f3f]/34 bg-[linear-gradient(145deg,#4f301a,#2d1b10)] p-3 shadow-[0_18px_34px_rgba(22,14,9,0.38),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),transparent_35%),repeating-linear-gradient(90deg,rgba(87,52,25,0.2)_0px,rgba(87,52,25,0.2)_3px,rgba(26,16,9,0.14)_3px,rgba(26,16,9,0.14)_6px)] opacity-80" />
        <div className="relative rounded-[1.2rem] border border-[#bf9054]/24 bg-[linear-gradient(180deg,rgba(19,15,12,0.98),rgba(3,3,3,1))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="pointer-events-none absolute inset-4 rounded-[1rem] border border-medieval-gold/25" />
          <div className="pointer-events-none absolute inset-x-10 top-1/2 z-10 -translate-y-1/2">
            <div className="h-px bg-gradient-to-r from-transparent via-medieval-gold/80 to-transparent shadow-[0_0_16px_rgba(201,168,76,0.45)]" />
          </div>

          <div
            id="qr-reader"
            className="relative z-0 w-full overflow-hidden rounded-[1rem] bg-black/80 [&_video]:aspect-square [&_video]:w-full [&_video]:object-cover"
          />
        </div>
      </div>

      {onFailsafe && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onFailsafe}
            className="font-body text-[11px] text-[#9a6b31]/50 transition-colors hover:text-[#9a6b31]/80 hover:underline underline-offset-2"
          >
            {t('failsafeLinkText', language)}
          </button>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#d7ba87]/24 bg-[rgba(255,250,240,0.55)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a6b31]">
            {t('scannerStatusLabel', language)}
          </p>
          {!isScanning && !error && (
            <p className="mt-1 font-body text-sm text-[#5b4330]/72 animate-pulse">
              {t('scanning', language)}
            </p>
          )}
          {isScanning && !error && (
            <p className="mt-1 font-body text-sm text-[#5b4330]/82">
              {t('scannerReady', language)}
            </p>
          )}
          {error && (
            <p className="mt-1 font-body text-sm text-red-700">{error}</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#d7ba87]/24 bg-[rgba(255,250,240,0.55)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a6b31]">
            {t('scannerTipsLabel', language)}
          </p>
          <p className="mt-1 font-body text-sm text-[#5b4330]/82">
            {t('scannerTips', language)}
          </p>
        </div>
      </div>
    </section>
  );
}
