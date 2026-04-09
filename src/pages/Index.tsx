import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Clock3,
  Gift,
  Globe,
  Puzzle,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MascotGuide from "@/components/MascotGuide";
import { useGameState } from "@/lib/game-state";
import heroImage from "@/assets/hero-bg.jpg";
import heroImageSecondary from "@/assets/hero-bg2.JPG";
import centurymap from "@/assets/18th-century-map-of-visby-sweden-375758-1024.png";
import { languageNames, type Language } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    finalTitle: "Redo att börja?",
    finalText: "Starta nu och se hur många delar du hinner hitta.",
    finalCta: "Starta nu",
    mapAlt: "Karta över Visby",
    mapCardTitle: "Medeltida Visby",
    mascotName: "Balle Bagge",
    mascotStepsLine: "Jag pekar – följ ledtrådarna!",
    mascotWelcome: "Välkommen till skattjakten i Visby. Redo att börja?",
    mascotStart: "Starta",
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
    finalTitle: "Ready to begin?",
    finalText: "Start now and see how many pieces you can uncover.",
    finalCta: "Start now",
    mapAlt: "Map of Visby",
    mapCardTitle: "Medieval Visby",
    mascotName: "Balle Bagge",
    mascotStepsLine: "I point the way – follow the clues!",
    mascotWelcome: "Welcome to the treasure hunt in Visby. Ready to begin?",
    mascotStart: "Start",
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
    finalTitle: "Bereit loszulegen?",
    finalText: "Starte jetzt und sieh, wie viele Teile du finden kannst.",
    finalCta: "Jetzt starten",
    mapAlt: "Karte von Visby",
    mapCardTitle: "Mittelalterliches Visby",
    mascotName: "Balle Bagge",
    mascotStepsLine: "Ich zeige den Weg – folg den Hinweisen!",
    mascotWelcome: "Willkommen zur Schatzsuche in Visby. Bereit zu beginnen?",
    mascotStart: "Starten",
  },
} as const;

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
  title,
}: {
  alt: string;
  title: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-[#e4c789]/18 bg-[linear-gradient(145deg,rgba(19,13,9,0.92),rgba(33,22,15,0.88))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_36px_100px_rgba(0,0,0,0.4)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,207,124,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_35%)]" />
      <div className="relative rounded-[24px] border border-[#f2d39b]/16 bg-[linear-gradient(180deg,rgba(242,224,189,0.96),rgba(214,188,146,0.94))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-8px_18px_rgba(111,72,33,0.08)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-[#8f5e24]/82">Quest Chart</div>
            <div className="mt-1 font-heading text-[1.35rem] leading-none text-[#332015]">{title}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8e6338]/18 bg-[radial-gradient(circle,#fff0c6_0%,#ebc980_60%,#cf9c46_100%)] shadow-[0_8px_20px_rgba(111,72,33,0.16)]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#8e6338]/25 bg-[rgba(91,57,26,0.12)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b4620]">
              VV
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-[#8a6034]/20 bg-[#d8be8d]">
          <img
            src={centurymap}
            alt={alt}
            className="h-full w-full object-cover object-[-60%_60%] -translate-y-[8%] scale-[1.82] sepia-[0.72] saturate-[0.76] brightness-[0.86] transition-transform duration-[1600ms] group-hover:-translate-y-[9%] group-hover:scale-[2]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,12,8,0.04),rgba(20,12,8,0.26))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_42%,rgba(67,43,21,0.18)_100%)]" />

          <div className="absolute bottom-3 left-3 rounded-full border border-[#8e6338]/14 bg-[rgba(247,235,205,0.8)] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#7c5329] shadow-[0_6px_16px_rgba(91,57,26,0.1)]">
            Visby route
          </div>
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const { language, setLanguage, isLoggedIn } = useGameState();
  const c = copy[language as keyof typeof copy] ?? copy.sv;
  const startHref = isLoggedIn ? "/map" : "/login";
  const howItWorksRef = useRef<HTMLElement | null>(null);

  const steps = [
    { icon: Search, title: c.step1Title, text: c.step1Text },
    { icon: Puzzle, title: c.step2Title, text: c.step2Text },
    { icon: Gift, title: c.step3Title, text: c.step3Text },
  ];

  const handleMascotStart = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
              <h1 className="max-w-xl font-display text-5xl leading-[0.92] text-[#fff1d3] drop-shadow-[0_10px_30px_rgba(0,0,0,0.32)] sm:text-6xl lg:text-7xl">
                {c.heroTitle}
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-[#fff1d6]/92 sm:text-xl">
                {c.heroSubtitle}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full border border-[#f0c976]/35 bg-[#e0a84d] px-8 text-base font-semibold text-[#2f1d11] shadow-[0_18px_36px_rgba(0,0,0,0.24)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[#ebb760] hover:scale-[1.02] active:scale-[0.98]"
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

              <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#130d0a]/45 px-4 py-3 text-[#fff4de] backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[#f0c976]">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-semibold">{c.socialProof}</span>
                  </div>
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
              <div className="rounded-[34px] border border-white/10 bg-[#120c09]/40 p-4 shadow-[0_26px_70px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-5">
                <MascotGuide
                  pose="welcome"
                  position="center"
                  text={c.mascotWelcome}
                  actionLabel={c.mascotStart}
                  onAction={handleMascotStart}
                  className="pb-2"
                />

                <div className="mt-4">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FoggyMapCard alt={c.mapAlt} title={c.mapCardTitle} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        ref={howItWorksRef}
        className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(35,22,14,0.34), rgba(63,42,27,0.42)), url(${heroImageSecondary})`,
          backgroundSize: "cover",
          backgroundPosition: "center -500px",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,220,156,0.2),transparent_32%),linear-gradient(180deg,rgba(20,12,7,0.12),rgba(20,12,7,0.2))]" />

        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#e1bb7b]">{c.sectionHow}</p>
            <h2 className="mt-3 font-display text-4xl text-[#fff1d2] sm:text-5xl">{c.sectionHow}</h2>
            <p className="mt-4 text-base text-[#f2e3c4]/90 sm:text-lg">{c.sectionHowLead}</p>
          </motion.div>

          <div className="relative mx-auto mt-10 max-w-5xl">
            <div className="absolute left-1/2 top-20 hidden h-[calc(100%-10rem)] w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(177,135,82,0.12),rgba(177,135,82,0.65),rgba(177,135,82,0.12))] md:block" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 max-w-2xl rounded-[28px] border border-[#d8b981]/40 bg-[linear-gradient(180deg,rgba(76,53,35,0.4),rgba(42,28,19,0.32))] px-4 py-3 text-[#f7ead1] shadow-[0_14px_36px_rgba(95,66,40,0.12)] backdrop-blur-[3px]"
          >
              <MascotGuide pose="point" position="inline" text={c.mascotStepsLine} variant="dark" />
            </motion.div>

            <div className="space-y-5">
              {steps.map(({ icon: Icon, title, text }, index) => {
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className={[
                      "relative grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center",
                      isEven ? "" : "",
                    ].join(" ")}
                  >
                    <div className={isEven ? "md:col-start-1" : "md:col-start-3"}>
                      <div className="group rounded-[30px] border border-[#cfaf7a]/38 bg-[linear-gradient(180deg,rgba(78,54,35,0.42),rgba(43,28,19,0.34))] p-5 shadow-[0_18px_45px_rgba(95,66,40,0.14)] backdrop-blur-[3px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(95,66,40,0.18)]">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] border border-[#e0c386] bg-[linear-gradient(180deg,#f7e5bd,#ebcb88)] text-[#8f5e24] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-transform duration-300 group-hover:scale-105">
                            <Icon className="h-6 w-6" />
                          </div>

                          <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-[0.28em] text-[#e4bb78]">Steg 0{index + 1}</div>
                            <h3 className="mt-2 font-heading text-[1.9rem] leading-none text-[#fff1d2]">{title}</h3>
                            <p className="mt-3 text-sm leading-6 text-[#fff0cf] sm:text-base">{text}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative mx-auto hidden h-14 w-14 items-center justify-center md:flex">
                      <div className="absolute h-4 w-4 rounded-full bg-[#f1d496] shadow-[0_0_0_6px_rgba(241,212,150,0.18),0_0_22px_rgba(216,168,83,0.4)]" />
                      <div className="absolute h-10 w-10 rounded-full border border-[#d4af71]/60 bg-[radial-gradient(circle,#fff6dd_0%,#f2ddb0_58%,#e1bf7f_100%)]" />
                      <span className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f5e24]">
                        0{index + 1}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-10 max-w-3xl rounded-[30px] border border-[#f0d59a] bg-[linear-gradient(135deg,#2a1c13,#3a281c)] p-6 text-center text-[#fbf1dc] shadow-[0_26px_60px_rgba(40,25,16,0.18)]"
          >
            <h3 className="font-display text-3xl text-[#fff0cf] sm:text-4xl">{c.finalTitle}</h3>
            <p className="mt-3 text-base leading-7 text-[#eadfc8]/84 sm:text-lg">{c.finalText}</p>
            <div className="mt-6">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full border border-[#f0c976]/30 bg-[#e0a84d] px-8 text-base font-semibold text-[#2f1d11] hover:bg-[#ebb760] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <Link to={startHref}>
                  {c.finalCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
