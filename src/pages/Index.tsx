import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Puzzle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/lib/game-state";
import GeminiBackground from "@/assets/Gemini_Generated_Image_q0eyruq0eyruq0ey.png";
import centurymap from "@/assets/18th-century-map-of-visby-sweden-375758-1024.jpg";
import puzzleImage from "@/assets/puzzle-placeholder.jpg";

const copy = {
  sv: {
    heroTitle: "Upptack Visby som aldrig forr",
    heroSubtitle: "Skanna QR-koder, los pusslet och avslöja stadens hemligheter",
    heroBody: "Ett verkligt aventyr i Visby. Utforska staden, hitta koder och bygg fram en dold bild bit for bit.",
    cta: "Borja spela",
    howTitle: "Sa fungerar det",
    howBody:
      "Allt ar byggt som en sammanhangen upptacktsfard genom staden. Varje plats ger dig en ny ledtrad och en ny bit av bilden.",
    step1Title: "Utforska",
    step1Text: "Ga runt i Visby och hitta spelets platser.",
    step2Title: "Skanna",
    step2Text: "Skanna QR-koder for att lasa upp nya pusselbitar.",
    step3Title: "Bygg",
    step3Text: "Samla bitarna och avslöja den dolda bilden.",
    puzzleTitle: "Kan du avslöja hela bilden?",
    puzzleText: "Varje ny plats ger dig en ny del av mysteriet. Ju fler fynd du gor, desto tydligare blir motivet.",
    progress: "3 / 15 bitar hittade",
    mapTitle: "Hitta alla platser i Visby",
    mapText:
      "Folj markeringarna genom murar, gränder och dolda horn. Kartan visar precis tillrackligt for att locka dig vidare.",
    finalTitle: "Redo att börja ditt aventyr?",
    finalText: "Logga in och ge dig ut i staden.",
    finalCta: "Spela nu",
    chainLabel1: "Route I",
    chainLabel2: "Puzzle",
    chainLabel3: "Map",
    chainLabel4: "Begin",
  },
  en: {
    heroTitle: "Discover Visby like never before",
    heroSubtitle: "Scan QR codes, solve the puzzle, and uncover the city’s secrets",
    heroBody:
      "A real-world adventure in Visby. Explore the city, find codes, and reveal a hidden image piece by piece.",
    cta: "Start game",
    howTitle: "How it works",
    howBody:
      "Everything is designed as one connected journey through the city. Each stop gives you a new clue and another piece of the image.",
    step1Title: "Explore",
    step1Text: "Walk around Visby and find game locations.",
    step2Title: "Scan",
    step2Text: "Scan QR codes to unlock new puzzle pieces.",
    step3Title: "Build",
    step3Text: "Collect the pieces and reveal the hidden image.",
    puzzleTitle: "Can you reveal the whole image?",
    puzzleText:
      "Each new location gives you another piece of the mystery. The more you find, the clearer the image becomes.",
    progress: "3 / 15 pieces found",
    mapTitle: "Find every location in Visby",
    mapText:
      "Follow the markers through walls, alleys, and hidden corners. The map reveals just enough to pull you forward.",
    finalTitle: "Ready to begin your adventure?",
    finalText: "Sign in and step into the city.",
    finalCta: "Play now",
    chainLabel1: "Route I",
    chainLabel2: "Puzzle",
    chainLabel3: "Map",
    chainLabel4: "Begin",
  },
  de: {
    heroTitle: "Entdecke Visby wie nie zuvor",
    heroSubtitle: "Scanne QR-Codes, löse das Puzzle und enthülle die Geheimnisse der Stadt",
    heroBody:
      "Ein echtes Abenteuer in Visby. Erkunde die Stadt, finde Codes und enthülle ein verborgenes Bild Stück für Stück.",
    cta: "Spiel starten",
    howTitle: "So funktioniert es",
    howBody:
      "Alles ist als zusammenhängende Reise durch die Stadt gestaltet. Jeder Ort gibt dir einen neuen Hinweis und ein weiteres Stück des Bildes.",
    step1Title: "Erkunden",
    step1Text: "Gehe durch Visby und finde die Spielorte.",
    step2Title: "Scannen",
    step2Text: "Scanne QR-Codes, um neue Puzzleteile freizuschalten.",
    step3Title: "Bauen",
    step3Text: "Sammle die Teile und enthülle das verborgene Bild.",
    puzzleTitle: "Kannst du das ganze Bild enthüllen?",
    puzzleText:
      "Jeder neue Ort gibt dir ein weiteres Stück des Rätsels. Je mehr du findest, desto klarer wird das Motiv.",
    progress: "3 / 15 Teile gefunden",
    mapTitle: "Finde alle Orte in Visby",
    mapText:
      "Folge den Markierungen durch Mauern, Gassen und verborgene Ecken. Die Karte zeigt nur so viel, dass deine Neugier wächst.",
    finalTitle: "Bereit für dein Abenteuer?",
    finalText: "Melde dich an und geh hinaus in die Stadt.",
    finalCta: "Jetzt spielen",
    chainLabel1: "Route I",
    chainLabel2: "Puzzle",
    chainLabel3: "Map",
    chainLabel4: "Begin",
  },
} as const;

const revealedPieces = [0, 2, 6];

function ScrollChain() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
      <div className="absolute left-1/2 top-0 h-full -translate-x-[470px]">
        <svg viewBox="0 0 80 1600" className="h-full w-20 overflow-visible">
          <defs>
            <linearGradient id="chainLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(214,178,106,0)" />
              <stop offset="12%" stopColor="rgba(214,178,106,0.22)" />
              <stop offset="88%" stopColor="rgba(214,178,106,0.22)" />
              <stop offset="100%" stopColor="rgba(214,178,106,0)" />
            </linearGradient>
          </defs>

          <path d="M40 0 L40 1600" stroke="url(#chainLine)" strokeWidth="1.2" fill="none" />

          {[
            { y: 120, label: "I" },
            { y: 500, label: "II" },
            { y: 930, label: "III" },
            { y: 1320, label: "IV" },
          ].map((node) => (
            <g key={node.y} transform={`translate(40 ${node.y})`}>
              <circle r="19" fill="rgba(26,19,14,0.95)" stroke="rgba(214,178,106,0.22)" strokeWidth="1.2" />
              <circle r="11" fill="none" stroke="rgba(214,178,106,0.18)" strokeWidth="1" />
              <path
                d="M0 -44 C9 -34 9 -24 0 -14 C-9 -24 -9 -34 0 -44"
                fill="none"
                stroke="rgba(214,178,106,0.2)"
                strokeWidth="1"
              />
              <path
                d="M0 14 C9 24 9 34 0 44 C-9 34 -9 24 0 14"
                fill="none"
                stroke="rgba(214,178,106,0.2)"
                strokeWidth="1"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fontSize="9"
                fill="rgba(214,178,106,0.7)"
                style={{ letterSpacing: "0.18em" }}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

const Index = () => {
  const { language, isLoggedIn } = useGameState();
  const c = copy[language as keyof typeof copy] ?? copy.en;
  const startHref = isLoggedIn ? "/map" : "/login";

  const steps = [
    { icon: Trophy, title: c.step1Title, text: c.step1Text },
    { icon: QrCode, title: c.step2Title, text: c.step2Text },
    { icon: Puzzle, title: c.step3Title, text: c.step3Text },
  ];

  return (
    <div className="flex flex-col bg-background text-foreground">
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${GeminiBackground})` }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,24,16,0.58),rgba(34,24,16,0.42)_36%,rgba(14,10,8,0.82)_100%)]" />
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(circle at 25% 20%, rgba(255,228,163,0.18), transparent 18%), radial-gradient(circle at 75% 30%, rgba(255,238,196,0.12), transparent 20%)",
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <div className="mb-4 inline-flex w-fit rounded-full border border-medieval-gold/20 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-medieval-gold/85 backdrop-blur-sm sm:text-[11px]">
                Visby Quest
              </div>

              <h1 className="font-heading text-4xl leading-[0.95] text-[#f3dfb0] drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl">
                {c.heroTitle}
              </h1>

              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#f6eddc] drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-xl">
                {c.heroSubtitle}
              </p>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#f0e6d2]/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)] sm:text-base">
                {c.heroBody}
              </p>

              <div className="mt-7">
                <Link to={startHref}>
                  <Button
                    size="lg"
                    className="h-13 rounded-full border border-[#d8b56a]/35 bg-[#d1aa5b] px-7 font-heading text-base text-[#2b2015] shadow-[0_12px_32px_rgba(0,0,0,0.24)] hover:bg-[#ddb86b] sm:h-14 sm:px-8"
                  >
                    {c.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9 }}
              className="relative mx-auto w-full max-w-[560px]"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-[28px] border border-[#d6b26a]/14 bg-[linear-gradient(180deg,rgba(45,33,23,0.84),rgba(28,21,15,0.92))] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.38)] sm:p-4"
              >
                <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,231,176,0.06),transparent_34%)]" />

                <div className="relative rounded-[22px] border border-[#8d6b41]/24 bg-[#e3cfaa] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:p-4">
                  <div className="aspect-[1.18/0.9] overflow-hidden rounded-[18px] border border-[#a07c4f]/24 bg-[#d5bf95]">
                    <img
                      src={centurymap}
                      alt=""
                      className="h-full w-full object-cover opacity-45 sepia-[0.72] saturate-[0.45]"
                    />
                    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                      <path
                        d="M16 24 C24 28, 34 24, 42 32 S58 46, 69 42 S82 31, 88 38"
                        fill="none"
                        stroke="rgba(92,62,31,0.42)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeDasharray="2 5"
                      />
                      <path
                        d="M22 67 C31 58, 43 56, 52 63 S71 77, 82 68"
                        fill="none"
                        stroke="rgba(92,62,31,0.34)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeDasharray="2 5"
                      />
                      <circle cx="23" cy="27" r="2.2" fill="rgba(166,115,43,0.9)" />
                      <circle cx="46" cy="35" r="2.2" fill="rgba(166,115,43,0.9)" />
                      <circle cx="70" cy="42" r="2.2" fill="rgba(166,115,43,0.9)" />
                    </svg>
                  </div>

                  <div className="absolute right-4 top-4 rounded-xl border border-[#d8bb86]/20 bg-[#f1e1ba] px-3 py-2 text-[#49331f] shadow-[0_10px_24px_rgba(0,0,0,0.16)] sm:right-5 sm:top-5">
                    <div className="text-[9px] uppercase tracking-[0.22em] text-[#86653e]">Quest Map</div>
                    <div className="mt-1 font-heading text-sm sm:text-base">Visby</div>
                  </div>
                </div>

                <div className="absolute -bottom-3 right-3 w-[38%] max-w-[180px] rounded-[18px] border border-[#d6b26a]/18 bg-[#241b14] p-2 shadow-[0_18px_34px_rgba(0,0,0,0.32)] sm:-bottom-4 sm:right-5">
                  <div className="grid grid-cols-2 gap-2 rounded-[12px] bg-[#17120e] p-2">
                    {revealedPieces.concat([9]).map((piece, index) => (
                      <div
                        key={`${piece}-${index}`}
                        className="relative aspect-square overflow-hidden rounded-[8px] border border-[#9f8254]/14 bg-[#251d16]"
                      >
                        <img
                          src={puzzleImage}
                          alt=""
                          className={`h-full w-full object-cover ${
                            index < 3 ? "brightness-105 saturate-110" : "blur-[6px] brightness-[0.45] saturate-[0.6]"
                          }`}
                          style={{
                            objectPosition: `${(piece % 5) * 25}% ${Math.floor(piece / 5) * 50}%`,
                          }}
                        />
                        {index < 3 && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(212,175,55,0.14),transparent_68%)]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pb-24 pt-10 sm:px-6 md:px-8">
        <ScrollChain />

        <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[30px] border border-[#d6b26a]/10 bg-[linear-gradient(180deg,rgba(38,28,20,0.95),rgba(22,17,13,0.98))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-7"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_38%)]" />
            <div className="absolute right-6 top-6 hidden rounded-full border border-[#d6b26a]/15 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#d6b26a]/55 sm:inline-block">
              {c.chainLabel1}
            </div>

            <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
              <div className="max-w-xl">
                <p className="text-[11px] uppercase tracking-[0.3em] text-medieval-gold/55">Journey</p>
                <h2 className="mt-3 font-heading text-3xl text-[#f3dfb0] sm:text-4xl md:text-5xl">{c.howTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-[#e6d9c0]/80 sm:text-base sm:leading-8">{c.howBody}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                {steps.map(({ icon: Icon, title, text }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                    viewport={{ once: true, amount: 0.25 }}
                    whileHover={{ y: -4 }}
                    className="relative rounded-[22px] border border-[#d6b26a]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.06))] p-4 sm:p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-medieval-gold/20 bg-medieval-gold/10 text-medieval-gold">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.24em] text-[#d6b26a]/45">0{i + 1}</span>
                    </div>
                    <h3 className="font-heading text-xl text-[#f7e7bf]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#f0e6d2]/90">{text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[30px] border border-[#d6b26a]/10 bg-[linear-gradient(180deg,rgba(36,27,19,0.97),rgba(22,17,13,0.99))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-5"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_35%)]" />
              <div className="absolute right-6 top-6 hidden rounded-full border border-[#d6b26a]/15 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#d6b26a]/55 sm:inline-block">
                {c.chainLabel2}
              </div>

              <div className="relative">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-xl">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-medieval-gold/55">Puzzle</p>
                    <h2 className="mt-2 font-heading text-3xl text-[#f3dfb0] sm:text-4xl">{c.puzzleTitle}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#e6d9c0]/80 sm:text-base sm:leading-8">{c.puzzleText}</p>
                  </div>

                  <div className="inline-flex items-center gap-3 rounded-full border border-medieval-gold/16 bg-medieval-gold/8 px-4 py-2 text-sm text-[#ead8ac]">
                    <div className="h-2.5 w-2.5 rounded-full bg-medieval-gold shadow-[0_0_14px_rgba(212,175,55,0.7)]" />
                    {c.progress}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 rounded-[22px] bg-[#120d09] p-3 sm:gap-2.5 sm:p-4">
                  {Array.from({ length: 15 }, (_, i) => {
                    const revealed = revealedPieces.includes(i);
                    return (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-[10px] border border-[#a38557]/12 bg-[#2a2119]"
                      >
                        <img
                          src={puzzleImage}
                          alt=""
                          className={[
                            "h-full w-full object-cover transition-all duration-500",
                            revealed
                              ? "scale-105 brightness-105 saturate-110"
                              : "scale-110 blur-[10px] brightness-[0.42] saturate-[0.55]",
                          ].join(" ")}
                          style={{
                            objectPosition: `${(i % 5) * 25}% ${Math.floor(i / 5) * 50}%`,
                          }}
                        />
                        {revealed && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(212,175,55,0.16),transparent_65%)]" />
                        )}
                        {!revealed && <div className="absolute inset-0 bg-black/28" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-[30px] border border-[#d6b26a]/10 bg-[linear-gradient(180deg,rgba(35,27,20,0.97),rgba(20,16,12,0.99))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.07),transparent_35%)]" />
                <div className="absolute right-6 top-6 hidden rounded-full border border-[#d6b26a]/15 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#d6b26a]/55 sm:inline-block">
                  {c.chainLabel3}
                </div>

                <p className="text-[11px] uppercase tracking-[0.3em] text-medieval-gold/55">Map</p>
                <h2 className="mt-2 font-heading text-3xl text-[#f3dfb0] sm:text-4xl">{c.mapTitle}</h2>
                <p className="mb-5 mt-3 text-sm leading-7 text-[#e6d9c0]/80 sm:text-base sm:leading-8">{c.mapText}</p>

                <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[#d6b26a]/10 bg-[#1a130e]">
                  <img
                    src={centurymap}
                    alt=""
                    className="h-full w-full object-cover sepia-[0.55] saturate-[0.55] brightness-[0.72]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,27,19,0.12),rgba(0,0,0,0.32))]" />
                  <div className="absolute left-[18%] top-[28%] h-3 w-3 rounded-full bg-medieval-gold shadow-[0_0_18px_rgba(212,175,55,0.9)]" />
                  <div className="absolute left-[42%] top-[52%] h-3 w-3 rounded-full bg-medieval-gold shadow-[0_0_18px_rgba(212,175,55,0.9)]" />
                  <div className="absolute left-[72%] top-[34%] h-3 w-3 rounded-full bg-medieval-gold shadow-[0_0_18px_rgba(212,175,55,0.9)]" />
                  <div className="absolute left-[26%] top-[62%] h-3 w-3 rounded-full bg-medieval-gold shadow-[0_0_18px_rgba(212,175,55,0.9)]" />
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 h-full w-full opacity-55"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M10 26 C18 20, 26 18, 34 26 S50 42, 58 36 S74 16, 88 24"
                      fill="none"
                      stroke="rgba(230,203,145,0.35)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeDasharray="2 4"
                    />
                    <path
                      d="M18 70 C28 62, 42 60, 54 66 S76 76, 88 64"
                      fill="none"
                      stroke="rgba(230,203,145,0.28)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeDasharray="2 4"
                    />
                  </svg>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_52%,rgba(0,0,0,0.35)_100%)]" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-[30px] border border-[#d6b26a]/10 bg-[linear-gradient(180deg,rgba(46,33,22,0.98),rgba(28,20,14,0.98))] px-5 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:px-6 sm:py-10"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_40%)]" />
                <div className="absolute right-6 top-6 hidden rounded-full border border-[#d6b26a]/15 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#d6b26a]/55 sm:inline-block">
                  {c.chainLabel4}
                </div>

                <div className="relative">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-medieval-gold/55">Begin</p>
                  <h2 className="mt-3 font-heading text-3xl text-[#f3dfb0] sm:text-4xl">{c.finalTitle}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#e6d9c0]/80 sm:text-base sm:leading-8">
                    {c.finalText}
                  </p>

                  <div className="mt-6">
                    <Link to={startHref}>
                      <Button
                        size="lg"
                        className="h-13 rounded-full border border-[#d8b56a]/35 bg-[#d1aa5b] px-7 font-heading text-base text-[#2b2015] shadow-[0_12px_32px_rgba(0,0,0,0.24)] hover:bg-[#ddb86b] sm:h-14 sm:px-8"
                      >
                        {c.finalCta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
