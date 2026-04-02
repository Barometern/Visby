import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, ScanLine } from 'lucide-react';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';

interface QRScannerProps {
  onScan: (decodedText: string) => boolean | Promise<boolean>;
}

export default function QRScanner({ onScan }: QRScannerProps) {
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

  onScanRef.current = onScan;

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
                setError(t('scanError', language));
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
          setError(t('scanError', language));
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
  }, [language]);

  return (
    <section className="rounded-[1.75rem] border border-medieval-gold/15 bg-[linear-gradient(180deg,rgba(37,27,20,0.94),rgba(18,13,10,0.98))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-medieval-gold/20 bg-medieval-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-medieval-gold">
            <ScanLine className="h-3.5 w-3.5" />
            Scanner
          </div>
          <h2 className="font-heading text-xl text-amber-50">Scan the quest seal</h2>
          <p className="mt-1 font-body text-sm leading-relaxed text-amber-100/70">
            Center the QR code in the frame and hold still for a moment.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 p-2 text-medieval-gold">
          <Camera className="h-4 w-4" />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/50 p-2">
        <div className="pointer-events-none absolute inset-4 rounded-[1rem] border border-medieval-gold/25" />
        <div className="pointer-events-none absolute inset-x-10 top-1/2 z-10 -translate-y-1/2">
          <div className="h-px bg-gradient-to-r from-transparent via-medieval-gold/80 to-transparent shadow-[0_0_16px_rgba(201,168,76,0.45)]" />
        </div>

        <div
          id="qr-reader"
          className="relative z-0 w-full overflow-hidden rounded-[1rem] bg-black/70 [&_video]:aspect-square [&_video]:w-full [&_video]:object-cover"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medieval-gold/80">
            Status
          </p>
          {!isScanning && !error && (
            <p className="mt-1 font-body text-sm text-amber-100/70 animate-pulse">
              {t('scanning', language)}
            </p>
          )}
          {isScanning && !error && (
            <p className="mt-1 font-body text-sm text-amber-100/75">
              Camera is active and ready.
            </p>
          )}
          {error && (
            <p className="mt-1 font-body text-sm text-red-300">{error}</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medieval-gold/80">
            Tips
          </p>
          <p className="mt-1 font-body text-sm text-amber-100/75">
            Better light and a flat angle usually make scanning much faster.
          </p>
        </div>
      </div>
    </section>
  );
}
