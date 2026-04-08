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
    mapCardLabel: "Utforska kartan",
    mapCardHint: "Dra över kartan för att skingra dimman.",
    mascotName: "Balle Bagge",
    mascotStepsLine: "Jag pekar ut riktningen. Du hittar nästa kod.",
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
    mapCardLabel: "Explore the map",
    mapCardHint: "Drag across the map to clear the fog.",
    mascotName: "Balle Bagge",
    mascotStepsLine: "I point the way. You find the next code.",
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
    mapCardLabel: "Erkunde die Karte",
    mapCardHint: "Ziehe über die Karte, um den Nebel zu lichten.",
    mascotName: "Balle Bagge",
    mascotStepsLine: "Ich zeige die Richtung. Du findest den nächsten Code.",
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
  label,
  hint,
}: {
  alt: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e4c789]/20 bg-[#1b130f]/90 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:p-5 hover:brightness-105 transition-all duration-300">
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
                    <FoggyMapCard alt={c.mapAlt} label={c.mapCardLabel} hint={c.mapCardHint} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how-it-works" ref={howItWorksRef} className="relative px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#a2743a]">{c.sectionHow}</p>
            <h2 className="mt-3 font-heading text-4xl text-[#2d1d12] sm:text-5xl">{c.sectionHow}</h2>
            <p className="mt-4 text-base text-[#5e4738] sm:text-lg">{c.sectionHowLead}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-8 max-w-3xl rounded-[30px] border border-[#ead7b2] bg-[#fff9ef] px-5 py-4 shadow-[0_18px_50px_rgba(95,66,40,0.08)]"
          >
            <MascotGuide pose="point" position="inline" text={c.mascotStepsLine} />
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="group rounded-[28px] border border-[#ead7b2] bg-white/70 p-5 shadow-[0_18px_50px_rgba(95,66,40,0.08)] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(95,66,40,0.14)] transition-all duration-300"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4e0b8] text-[#9c6727] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-5 text-[11px] uppercase tracking-[0.26em] text-[#b18752]">0{index + 1}</div>
                <h3 className="mt-2 font-heading text-2xl text-[#2d1d12]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5e4738] sm:text-base">{text}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-8 max-w-3xl rounded-[30px] border border-[#f0d59a] bg-[linear-gradient(135deg,#2a1c13,#3a281c)] p-6 text-center text-[#fbf1dc] shadow-[0_26px_60px_rgba(40,25,16,0.18)]"
          >
            <h3 className="font-heading text-3xl text-[#fff0cf] sm:text-4xl">{c.finalTitle}</h3>
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
