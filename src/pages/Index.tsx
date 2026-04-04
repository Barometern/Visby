import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Clock3,
  Gift,
  Globe,
  MapPinned,
  Puzzle,
  QrCode,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/lib/game-state";
import heroImage from "@/assets/hero-bg.jpg";
import centurymap from "@/assets/18th-century-map-of-visby-sweden-375758-1024.png";
import puzzleImage from "@/assets/puzzle-placeholder.jpg";
import { COLS, PIECE_SIZE, ROWS, TOTAL, piecePath } from "@/lib/puzzle-geometry";
import { languageNames, type Language } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const revealedPieces = [1, 3, 7, 11];

const copy = {
  sv: {
    heroTitle: "Skattjakt genom Visbys gränder",
    heroSubtitle:
      "Leta QR-koder runt Visby, lås upp pusselbitar och se om du kan hitta hela belöningen före alla andra.",
    heroCta: "Börja jakten",
    heroSecondary: "Tar bara några minuter att börja",
    socialProof: "100+ deltagare",
    curiosity: "Kan du hitta alla delar?",
    sectionHow: "Så funkar det",
    sectionHowLead: "Tre enkla steg och jakten är igång.",
    step1Title: "Leta QR-koder",
    step1Text: "Hitta nästa plats och skanna på sekunder.",
    step2Title: "Samla pusselbitar",
    step2Text: "Varje scan avslöjar en ny del av bilden.",
    step3Title: "Få pris",
    step3Text: "Fyll pusslet och lås upp belöningen.",
    sectionWhy: "Varför göra detta?",
    whyLead: "Det här ska kännas som ett miniäventyr, inte som information.",
    whyBullets: [
      "Utforska Visby med nya ögon.",
      "Känn progressionen när pusslet fylls i.",
      "Gör det tillsammans med vänner eller familj.",
      "Jaga känslan av att hitta sista biten.",
    ],
    teaserTitle: "Utmaningen väntar",
    teaserText: "Riktiga pusselbitar, riktiga platser, riktig belöning.",
    progressLabel: "Pusselstatus",
    mapTitle: "Visby blir din spelplan",
    mapText: "Murar, gränder och dolda hörn förvandlas till ledtrådar längs vägen.",
    puzzleCardText: "Varje QR-kod ger dig en ny bit, och motivet blir tydligare ju längre du kommer.",
    finalTitle: "Redo att börja?",
    finalText: "Starta nu och se hur många delar du hinner hitta.",
    finalCta: "Starta nu",
    statStars: "5.0 i upplevelse",
    miniReadyTitle: "Redo att börja?",
    miniReadyText: "Skanna första koden och se första biten falla på plats.",
    miniLiveTitle: "Live känsla",
    miniLiveEmpty: "Din första pusselbit väntar ute i Visby.",
    miniLiveProgress: "bitar upplåsta i din jakt just nu.",
    mapAlt: "Karta över Visby",
    mapCardLabel: "Utforska kartan",
    mapCardHint: "Dra över kartan för att skingra dimman.",
    puzzleCardLabel: "Pusslet avslöjas bit för bit",
  },
  en: {
    heroTitle: "Treasure hunt through Visby",
    heroSubtitle:
      "Find QR codes around Visby, unlock puzzle pieces, and see if you can uncover the full reward before everyone else.",
    heroCta: "Start hunt",
    heroSecondary: "Takes only minutes to begin",
    socialProof: "100+ players",
    curiosity: "Can you find every piece?",
    sectionHow: "How it works",
    sectionHowLead: "Three quick steps and you are in.",
    step1Title: "Find QR codes",
    step1Text: "Spot the next location and scan in seconds.",
    step2Title: "Collect puzzle pieces",
    step2Text: "Each scan reveals another part of the image.",
    step3Title: "Get the prize",
    step3Text: "Complete the puzzle and unlock the reward.",
    sectionWhy: "Why do this?",
    whyLead: "This should feel like a city adventure, not a brochure.",
    whyBullets: [
      "See Visby with fresh curiosity.",
      "Feel the progression as the puzzle fills up.",
      "Turn it into a shared activity.",
      "Chase the thrill of the final piece.",
    ],
    teaserTitle: "The challenge is waiting",
    teaserText: "Real puzzle pieces, real locations, real reward.",
    progressLabel: "Puzzle progress",
    mapTitle: "Visby becomes your game board",
    mapText: "Walls, alleys, and hidden corners turn into clues as you move.",
    puzzleCardText: "Each QR code gives you a new piece, and the image sharpens as you progress.",
    finalTitle: "Ready to begin?",
    finalText: "Start now and see how many pieces you can uncover.",
    finalCta: "Start now",
    statStars: "5.0 experience score",
    miniReadyTitle: "Ready to begin?",
    miniReadyText: "Scan the first code and watch the first piece snap into place.",
    miniLiveTitle: "Live feeling",
    miniLiveEmpty: "Your first puzzle piece is waiting somewhere in Visby.",
    miniLiveProgress: "pieces unlocked in your hunt right now.",
    mapAlt: "Map of Visby",
    mapCardLabel: "Explore the map",
    mapCardHint: "Drag across the map to clear the fog.",
    puzzleCardLabel: "The puzzle reveals itself piece by piece",
  },
  de: {
    heroTitle: "Schatzsuche durch Visbys Gassen",
    heroSubtitle:
      "Finde QR-Codes in Visby, schalte Puzzleteile frei und entdecke, ob du die Belohnung vor allen anderen findest.",
    heroCta: "Jagd starten",
    heroSecondary: "Der Einstieg dauert nur wenige Minuten",
    socialProof: "100+ Teilnehmer",
    curiosity: "Findest du alle Teile?",
    sectionHow: "So funktioniert es",
    sectionHowLead: "Drei schnelle Schritte und es geht los.",
    step1Title: "QR-Codes finden",
    step1Text: "Finde den nächsten Ort und scanne sofort.",
    step2Title: "Puzzleteile sammeln",
    step2Text: "Jeder Scan enthüllt einen neuen Bildteil.",
    step3Title: "Preis erhalten",
    step3Text: "Vervollständige das Puzzle und schalte die Belohnung frei.",
    sectionWhy: "Warum mitmachen?",
    whyLead: "Es soll sich wie ein Abenteuer anfühlen, nicht wie Information.",
    whyBullets: [
      "Erlebe Visby mit neuen Augen.",
      "Spüre den Fortschritt, wenn das Puzzle wächst.",
      "Mache es zu einer sozialen Aktivität.",
      "Jage den Moment des letzten Teils.",
    ],
    teaserTitle: "Die Herausforderung wartet",
    teaserText: "Echte Puzzleteile, echte Orte, echte Belohnung.",
    progressLabel: "Puzzle-Fortschritt",
    mapTitle: "Visby wird dein Spielfeld",
    mapText: "Mauern, Gassen und verborgene Ecken werden zu Hinweisen.",
    puzzleCardText: "Jeder QR-Code gibt dir ein neues Teil, und das Motiv wird mit jedem Fund klarer.",
    finalTitle: "Bereit loszulegen?",
    finalText: "Starte jetzt und sieh, wie viele Teile du finden kannst.",
    finalCta: "Jetzt starten",
    statStars: "5,0 Erlebniswertung",
    miniReadyTitle: "Bereit zu starten?",
    miniReadyText: "Scanne den ersten Code und sieh, wie das erste Teil einrastet.",
    miniLiveTitle: "Live-Gefühl",
    miniLiveEmpty: "Dein erstes Puzzleteil wartet irgendwo in Visby.",
    miniLiveProgress: "Teile sind in deiner Jagd gerade freigeschaltet.",
    mapAlt: "Karte von Visby",
    mapCardLabel: "Erkunde die Karte",
    mapCardHint: "Ziehe über die Karte, um den Nebel zu lichten.",
    puzzleCardLabel: "Das Puzzle enthüllt sich Stück für Stück",
  },
} as const;

function PuzzleTeaser({ progressLabel }: { progressLabel: string }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#e4c789]/20 bg-[#1b130f]/90 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,208,122,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_45%)]" />

      <div className="relative rounded-[22px] border border-[#f2d39b]/18 bg-[linear-gradient(180deg,rgba(245,227,188,0.96),rgba(220,194,149,0.94))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
        <svg
          viewBox={`0 0 ${COLS * PIECE_SIZE} ${ROWS * PIECE_SIZE}`}
          className="block w-full overflow-visible rounded-[16px]"
          aria-hidden="true"
        >
          <defs>
            {Array.from({ length: TOTAL }, (_, i) => (
              <clipPath key={i} id={`hero-piece-${i}`}>
                <path d={piecePath(i % COLS, Math.floor(i / COLS))} />
              </clipPath>
            ))}

            <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(58,33,18,0.24)" />
            </filter>
          </defs>

          <image href={puzzleImage} x="0" y="0" width={COLS * PIECE_SIZE} height={ROWS * PIECE_SIZE} opacity="0.2" />

          {Array.from({ length: TOTAL }, (_, i) => {
            const d = piecePath(i % COLS, Math.floor(i / COLS));
            const isRevealed = revealedPieces.includes(i);

            return (
              <g key={i} filter={isRevealed ? "url(#hero-shadow)" : undefined}>
                {isRevealed ? (
                  <>
                    <image
                      href={puzzleImage}
                      x="0"
                      y="0"
                      width={COLS * PIECE_SIZE}
                      height={ROWS * PIECE_SIZE}
                      clipPath={`url(#hero-piece-${i})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <path d={d} fill="none" stroke="rgba(77,46,22,0.55)" strokeWidth="1.4" />
                    <path d={d} fill="rgba(255,207,120,0.14)" />
                  </>
                ) : (
                  <>
                    <path d={d} fill="rgba(96,67,39,0.1)" stroke="rgba(96,67,39,0.24)" strokeWidth="1.1" />
                    <text
                      x={(i % COLS) * PIECE_SIZE + PIECE_SIZE / 2}
                      y={Math.floor(i / COLS) * PIECE_SIZE + PIECE_SIZE / 2 + 5}
                      textAnchor="middle"
                      fontSize="18"
                      fill="rgba(96,67,39,0.32)"
                      style={{ fontFamily: "Crimson Text, serif" }}
                    >
                      ?
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d99f47]/35 bg-[#20150f]/88 text-[#f3c977] shadow-[0_12px_26px_rgba(0,0,0,0.26)]"
        >
          <QrCode className="h-7 w-7" />
        </motion.div>

        <div className="absolute bottom-4 left-4 rounded-2xl border border-[#8a6034]/20 bg-[#241812]/88 px-4 py-3 text-[#f7ead2] shadow-[0_14px_28px_rgba(0,0,0,0.24)] backdrop-blur-sm">
          <div className="text-[10px] uppercase tracking-[0.24em] text-[#f0c976]/75">{progressLabel}</div>
          <div className="mt-1 text-xl font-semibold">{revealedPieces.length} / {TOTAL}</div>
        </div>
      </div>
    </div>
  );
}

function LanguagePicker({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (lang: Language) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 rounded-full border border-white/12 bg-black/20 px-4 text-[#fff1d6] backdrop-blur-sm hover:bg-black/30 hover:text-white"
        >
          <Globe className="mr-2 h-4 w-4 text-[#f0c976]" />
          <span className="text-xs font-semibold tracking-[0.18em]">{language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {(Object.keys(languageNames) as Language[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={language === lang ? "font-semibold text-medieval-gold" : ""}
          >
            {languageNames[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FoggyMapCard({
  alt,
  label,
  hint,
}: {
  alt: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e4c789]/20 bg-[#1b130f]/90 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:p-5">
      <div className="rounded-[22px] border border-[#f2d39b]/18 bg-[linear-gradient(180deg,rgba(245,227,188,0.96),rgba(220,194,149,0.94))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-[#8a6034]/18">
          <img
            src={centurymap}
            alt={alt}
            className="h-full w-full object-cover sepia-[0.7] saturate-[0.78] brightness-[0.84]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,10,7,0.06),rgba(17,10,7,0.32))]" />
          <div className="absolute left-[17%] top-[26%] h-3.5 w-3.5 rounded-full bg-[#f0b24b] shadow-[0_0_18px_rgba(240,178,75,0.9)]" />
          <div className="absolute left-[44%] top-[55%] h-3.5 w-3.5 rounded-full bg-[#f0b24b] shadow-[0_0_18px_rgba(240,178,75,0.9)]" />
          <div className="absolute left-[72%] top-[37%] h-3.5 w-3.5 rounded-full bg-[#f0b24b] shadow-[0_0_18px_rgba(240,178,75,0.9)]" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <path
              d="M12 30 C26 17, 39 20, 47 33 S65 57, 86 51"
              fill="none"
              stroke="rgba(255,228,172,0.58)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="2 4"
            />
          </svg>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-[linear-gradient(180deg,transparent,rgba(16,10,7,0.72))] px-4 pb-4 pt-10 text-[#fff1d6]">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#f0c976]/78">{label}</div>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#f8ecd4]/86">{hint}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e4c789]/20 bg-[#1b130f]/90 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:p-5">
      <div className="rounded-[22px] border border-[#f2d39b]/18 bg-[linear-gradient(180deg,rgba(245,227,188,0.96),rgba(220,194,149,0.94))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-[#8a6034]/18">
          <img
            src={centurymap}
            alt={alt}
            className="h-full w-full object-cover sepia-[0.7] saturate-[0.78] brightness-[0.84]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,10,7,0.06),rgba(17,10,7,0.32))]" />
          <div className="absolute left-[17%] top-[26%] h-3.5 w-3.5 rounded-full bg-[#f0b24b] shadow-[0_0_18px_rgba(240,178,75,0.9)]" />
          <div className="absolute left-[44%] top-[55%] h-3.5 w-3.5 rounded-full bg-[#f0b24b] shadow-[0_0_18px_rgba(240,178,75,0.9)]" />
          <div className="absolute left-[72%] top-[37%] h-3.5 w-3.5 rounded-full bg-[#f0b24b] shadow-[0_0_18px_rgba(240,178,75,0.9)]" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <path
              d="M12 30 C26 17, 39 20, 47 33 S65 57, 86 51"
              fill="none"
              stroke="rgba(255,228,172,0.58)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="2 4"
            />
          </svg>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-[linear-gradient(180deg,transparent,rgba(16,10,7,0.72))] px-4 pb-4 pt-10 text-[#fff1d6]">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#f0c976]/78">{label}</div>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#f8ecd4]/86">{hint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const { language, setLanguage, isLoggedIn, unlockedPieces } = useGameState();
  const c = copy[language as keyof typeof copy] ?? copy.sv;
  const startHref = isLoggedIn ? "/map" : "/login";

  const steps = [
    { icon: Search, title: c.step1Title, text: c.step1Text },
    { icon: Puzzle, title: c.step2Title, text: c.step2Text },
    { icon: Gift, title: c.step3Title, text: c.step3Text },
  ];

  const reasons = [
    { icon: MapPinned, text: c.whyBullets[0] },
    { icon: Sparkles, text: c.whyBullets[1] },
    { icon: Users, text: c.whyBullets[2] },
    { icon: Star, text: c.whyBullets[3] },
  ];

  return (
    <div className="bg-[#f6efe3] text-[#231711]">
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(17,10,7,0.3), rgba(17,10,7,0.72)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,201,111,0.16),transparent_28%),linear-gradient(180deg,rgba(10,6,4,0.12),rgba(10,6,4,0.5))]" />

        <div className="relative mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
          <div className="flex justify-end">
            <LanguagePicker language={language} setLanguage={setLanguage} />
          </div>
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid w-full gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl"
            >
              <h1 className="max-w-xl font-heading text-5xl leading-[0.92] text-[#fff1d3] drop-shadow-[0_10px_30px_rgba(0,0,0,0.32)] sm:text-6xl lg:text-7xl">
                {c.heroTitle}
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-[#fff1d6]/92 sm:text-xl">
                {c.heroSubtitle}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full border border-[#f0c976]/35 bg-[#e0a84d] px-8 text-base font-semibold text-[#2f1d11] shadow-[0_18px_36px_rgba(0,0,0,0.24)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[#ebb760]"
                >
                  <Link to={startHref}>
                    {c.heroCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm text-[#f7ead2] backdrop-blur-sm">
                  <Clock3 className="h-4 w-4 text-[#f0c976]" />
                  {c.heroSecondary}
                </div>
              </div>

              <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[#130d0a]/45 px-4 py-3 text-[#fff4de] backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[#f0c976]">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-semibold">{c.socialProof}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#130d0a]/45 px-4 py-3 text-[#fff4de] backdrop-blur-sm">
                  <div className="flex items-center gap-1 text-[#f0c976]">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <div className="mt-1 text-sm">{c.statStars}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#130d0a]/45 px-4 py-3 text-[#fff4de] backdrop-blur-sm">
                  <div className="text-sm font-semibold text-[#f0c976]">{c.curiosity}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <FoggyMapCard alt={c.mapAlt} label={c.mapCardLabel} hint={c.mapCardHint} />
              </motion.div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-[#140d0a]/68 px-4 py-4 text-[#f8ebd3] shadow-[0_16px_32px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#f0c976]/72">{c.miniReadyTitle}</div>
                  <p className="mt-2 text-sm leading-6">{c.miniReadyText}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-[#140d0a]/68 px-4 py-4 text-[#f8ebd3] shadow-[0_16px_32px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#f0c976]/72">{c.miniLiveTitle}</div>
                  <p className="mt-2 text-sm leading-6">
                    {unlockedPieces.length > 0
                      ? `${unlockedPieces.length} ${c.miniLiveProgress}`
                      : c.miniLiveEmpty}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#a2743a]">{c.sectionHow}</p>
            <h2 className="mt-3 font-heading text-4xl text-[#2d1d12] sm:text-5xl">{c.sectionHow}</h2>
            <p className="mt-4 text-lg text-[#5e4738]">{c.sectionHowLead}</p>
          </motion.div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className="rounded-[28px] border border-[#ead7b2] bg-white/70 p-6 shadow-[0_18px_50px_rgba(95,66,40,0.08)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4e0b8] text-[#9c6727] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-5 text-[11px] uppercase tracking-[0.26em] text-[#b18752]">0{index + 1}</div>
                <h3 className="mt-2 font-heading text-2xl text-[#2d1d12]">{title}</h3>
                <p className="mt-2 text-base leading-7 text-[#5e4738]">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] bg-[#1c130e] p-7 text-[#f8edd5] shadow-[0_30px_70px_rgba(40,25,16,0.22)]"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#f0c976]/72">{c.sectionWhy}</div>
            <h2 className="mt-3 font-heading text-4xl text-[#fff0cf] sm:text-5xl">{c.sectionWhy}</h2>
            <p className="mt-4 max-w-lg text-lg leading-8 text-[#eadfc8]/82">{c.whyLead}</p>

            <div className="mt-8 space-y-3">
              {reasons.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0c976]/12 text-[#f0c976]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-base leading-7 text-[#f7ecd6]">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full border border-[#f0c976]/30 bg-[#e0a84d] px-8 text-base font-semibold text-[#2f1d11] hover:bg-[#ebb760]"
              >
                <Link to={startHref}>
                  {c.heroCta}
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden rounded-[32px] border border-[#ead7b2] bg-white/70 p-4 shadow-[0_18px_50px_rgba(95,66,40,0.08)]"
            >
              <PuzzleTeaser progressLabel={c.progressLabel} />

              <div className="p-6">
                <div className="text-[11px] uppercase tracking-[0.28em] text-[#a2743a]">{c.puzzleCardLabel}</div>
                <h3 className="mt-2 font-heading text-3xl text-[#2d1d12]">{c.teaserTitle}</h3>
                <p className="mt-3 text-base leading-7 text-[#5e4738]">{c.puzzleCardText}</p>
                <p className="mt-3 text-sm font-medium text-[#9c6727]">{c.teaserText}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="rounded-[32px] border border-[#f0d59a] bg-[linear-gradient(135deg,#2a1c13,#3a281c)] p-7 text-[#fbf1dc] shadow-[0_26px_60px_rgba(40,25,16,0.2)]"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#f0c976]">
                <span className="rounded-full border border-[#f0c976]/22 px-3 py-1">{c.socialProof}</span>
                <span className="rounded-full border border-[#f0c976]/22 px-3 py-1">{c.curiosity}</span>
              </div>
              <h3 className="mt-4 font-heading text-4xl text-[#fff0cf]">{c.finalTitle}</h3>
              <p className="mt-3 max-w-xl text-lg leading-8 text-[#eadfc8]/84">{c.finalText}</p>

              <div className="mt-7">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full border border-[#f0c976]/30 bg-[#e0a84d] px-8 text-base font-semibold text-[#2f1d11] hover:bg-[#ebb760]"
                >
                  <Link to={startHref}>
                    {c.finalCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
