import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import MascotGuide from "@/components/MascotGuide";
import { useGameState } from "@/lib/game-state";
import heroImage from "@/assets/IMG_3119.PNG";
import centurymap from "@/assets/18th-century-map-of-visby-sweden-375758-1024.png";
import { languageNames, t, type Language } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Vite resolves this at build time and includes the asset in the bundle
const introVideoSrc = new URL("../assets/bakgrund.mp4", import.meta.url).href;

const INTRO_KEY = "visby-intro-seen";
type IntroPhase = "video" | "logo" | "home";

// ─── Language picker ──────────────────────────────────────────────────────────

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
          className="h-10 rounded-[6px] border border-white/20 bg-black/25 px-4 text-[#fff1d6] hover:bg-black/35 hover:text-white"
        >
          <Globe className="mr-2 h-4 w-4 text-[#c9a84c]" />
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

// ─── Foggy map card ───────────────────────────────────────────────────────────

function FoggyMapCard({ alt, title }: { alt: string; title: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[12px] border border-[#e4c789]/18 bg-[linear-gradient(145deg,rgba(19,13,9,0.92),rgba(33,22,15,0.88))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.34)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_36px_100px_rgba(0,0,0,0.4)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,207,124,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_35%)]" />
      <div className="relative rounded-[8px] border border-[#f2d39b]/16 bg-[linear-gradient(180deg,rgba(242,224,189,0.96),rgba(214,188,146,0.94))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-8px_18px_rgba(111,72,33,0.08)]">
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

        <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] border border-[#8a6034]/20 bg-[#d8be8d]">
          <img
            src={centurymap}
            alt={alt}
            className="h-full w-full object-cover object-[-60%_60%] -translate-y-[8%] scale-[1.82] sepia-[0.72] saturate-[0.76] brightness-[0.86] transition-transform duration-[1600ms] group-hover:-translate-y-[9%] group-hover:scale-[2]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,12,8,0.04),rgba(20,12,8,0.26))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_42%,rgba(67,43,21,0.18)_100%)]" />
          <div className="absolute bottom-3 left-3 rounded-[3px] border border-[#8e6338]/14 bg-[rgba(247,235,205,0.8)] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#7c5329] shadow-[0_6px_16px_rgba(91,57,26,0.1)]">
            Visby route
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const Index = () => {
  const { language, setLanguage, isLoggedIn } = useGameState();
  const navigate = useNavigate();
  const startHref = isLoggedIn ? "/map" : "/login";

  // Initialise phase — skip intro if already seen this session
  const [phase, setPhase] = useState<IntroPhase>(() => {
    try {
      return sessionStorage.getItem(INTRO_KEY) === "true" ? "home" : "video";
    } catch {
      return "home";
    }
  });

  const [showSkip, setShowSkip] = useState(false);
  const [logoTitleVisible, setLogoTitleVisible] = useState(false);
  const [logoHintVisible, setLogoHintVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Show skip button 1 s after video starts
  useEffect(() => {
    if (phase !== "video") return;
    const timer = window.setTimeout(() => setShowSkip(true), 1000);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Attempt autoplay; fall through to logo on failure
  useEffect(() => {
    if (phase !== "video" || !videoRef.current) return;
    videoRef.current.play().catch(goToLogo);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sequence logo elements
  useEffect(() => {
    if (phase !== "logo") return;
    setLogoTitleVisible(false);
    setLogoHintVisible(false);
    const t1 = window.setTimeout(() => setLogoTitleVisible(true), 400);
    const t2 = window.setTimeout(() => setLogoHintVisible(true), 1000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [phase]);

  function goToLogo() {
    setPhase("logo");
  }

  function goToHome() {
    try { sessionStorage.setItem(INTRO_KEY, "true"); } catch { /* ignore */ }
    window.scrollTo(0, 0);
    setPhase("home");
  }

  const steps = [
    { title: t("step1Title", language), text: t("step1Text", language) },
    { title: t("step2Title", language), text: t("step2Text", language) },
    { title: t("step3Title", language), text: t("step3Text", language) },
  ];

  return (
    <>
      {/* ── 1. VIDEO INTRO ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "video" && (
          <motion.div
            key="intro-video"
            className="fixed inset-0 z-[100] bg-black"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <video
              ref={videoRef}
              src={introVideoSrc}
              muted
              playsInline
              className="h-full w-full object-cover"
              onEnded={goToLogo}
              onError={goToLogo}
            />

            {/* Skip button — appears after 1 s */}
            <AnimatePresence>
              {showSkip && (
                <motion.button
                  key="skip-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={goToLogo}
                  className="absolute bottom-8 right-6 h-10 rounded-[6px] border border-white/20 bg-black/25 px-4 text-sm font-semibold text-[#fff1d6] transition-colors duration-150 hover:bg-black/35 hover:text-white"
                >
                  Hoppa över
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. LOGO SCREEN ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "logo" && (
          <motion.div
            key="intro-logo"
            className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(rgba(12,8,5,0.52), rgba(12,8,5,0.70)), url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={goToHome}
          >
            {/* "Visby Quest" title */}
            <AnimatePresence>
              {logoTitleVisible && (
                <motion.h2
                  key="logo-title"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="select-none font-display text-[3.5rem] leading-none text-[#fff1d3]"
                  style={{
                    textShadow:
                      "0 0 48px rgba(201,168,76,0.45), 0 0 16px rgba(201,168,76,0.20), 0 4px 18px rgba(0,0,0,0.55)",
                  }}
                >
                  Visby Quest
                </motion.h2>
              )}
            </AnimatePresence>

            {/* "Tryck för att börja" — fades in then breathes */}
            <AnimatePresence>
              {logoHintVisible && (
                <motion.div
                  key="logo-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-7"
                >
                  <motion.p
                    animate={{ opacity: [0.45, 0.85, 0.45] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="select-none text-[10px] font-semibold uppercase tracking-[0.38em] text-[#fff1d6]"
                  >
                    Tryck för att börja
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. HOMEPAGE ──────────────────────────────────────────────────── */}
      {phase === "home" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-[#F2E8D5] text-[#2C1A0E]"
        >
          {/* ─── SECTION 1 — CINEMATIC HERO ─── */}
          <section
            className="relative flex min-h-screen flex-col overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(12,8,5,0.42), rgba(12,8,5,0.78)), url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,201,111,0.10),transparent_30%)]" />

            {/* Language picker — top right only */}
            <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
              <div className="flex justify-end">
                <LanguagePicker language={language} setLanguage={setLanguage} />
              </div>
            </div>

            {/* Center hero content */}
            <div className="relative z-10 mx-auto flex flex-1 max-w-3xl flex-col items-center justify-center px-4 pb-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85 }}
              >
                <p className="text-[11px] uppercase tracking-[0.42em] text-[#c9a84c]">
                  Visby · Gotland
                </p>

                <h1 className="mt-5 max-w-xl font-display text-5xl leading-[0.92] text-[#fff1d3] drop-shadow-[0_10px_30px_rgba(0,0,0,0.32)] sm:text-6xl lg:text-7xl">
                  {t("heroTitle", language)}
                </h1>

                <p className="mx-auto mt-5 max-w-sm text-lg leading-8 text-[#fff1d6]/80 sm:text-xl">
                  {t("heroSubtitle", language)}
                </p>

                <div className="mt-8 flex flex-col items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 rounded-[6px] border border-[#f0c976]/35 bg-[#dca54a] px-10 text-base font-semibold text-[#2f1d11] shadow-[0_18px_36px_rgba(0,0,0,0.24),2px_3px_0px_rgba(122,82,48,0.35)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[#e7b35d] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Link to={startHref}>{t("heroCta", language)}</Link>
                  </Button>

                  <p className="text-sm text-[#fff1d6]/50">
                    {t("heroSecondary", language)}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
              <motion.div
                className="w-px bg-gradient-to-b from-transparent via-[#c9a84c]/60 to-[#c9a84c]"
                style={{ height: 52 }}
                animate={{ opacity: [0.3, 0.85, 0.3], y: [0, 8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Organic painted transition — parchment eats into the bottom of the hero */}
            <svg
              aria-hidden="true"
              className="absolute bottom-0 left-0 z-10 w-full"
              style={{ height: 100, display: "block" }}
              viewBox="0 0 1440 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,100 L0,70 C180,70 260,22 390,38 C520,54 570,80 720,74 C810,68 930,36 1020,44 C1110,52 1280,76 1440,72 L1440,100 Z"
                fill="#F2E8D5"
              />
            </svg>
          </section>

          {/* ─── SECTION 2 — PARCHMENT ─── */}
          <section
            id="how-it-works"
            className="bg-[#F2E8D5] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
          >
            <div className="mx-auto max-w-xl">

              {/* Mascot with Starta button */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
              >
                <MascotGuide
                  pose="welcome"
                  position="center"
                  text={t("mascotWelcome", language)}
                  actionLabel={t("mascotStart", language)}
                  onAction={() => navigate(startHref)}
                />
              </motion.div>

              {/* FoggyMapCard — full width, gentle float */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-8"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FoggyMapCard
                    alt={t("indexMapAlt", language)}
                    title={t("indexMapCardTitle", language)}
                  />
                </motion.div>
              </motion.div>

              {/* Illuminated drop cap intro */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-10"
              >
                {(() => {
                  const sentence = t("sectionHowLead", language);
                  return (
                    <div
                      className="overflow-hidden font-body text-[15px] leading-7 text-[#2C1A0E]/68"
                      aria-label={sentence}
                    >
                      <span
                        className="float-left select-none font-display text-[#8B1A1A]"
                        style={{ fontSize: "4.5rem", lineHeight: 0.75, marginRight: "0.12em", marginTop: "0.05em", marginBottom: 0 }}
                        aria-hidden="true"
                      >
                        {sentence.charAt(0)}
                      </span>
                      <span aria-hidden="true">{sentence.slice(1)}</span>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Steps — plain vertical list */}
              <div className="mt-10 space-y-8">
                {steps.map(({ title, text }, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: index * 0.1 }}
                    className="flex items-start gap-5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1C2E4A] bg-[#1C2E4A] text-sm font-bold text-[#F2E8D5]">
                      0{index + 1}
                    </div>
                    <div className="pt-0.5">
                      <h3 className="font-heading text-xl leading-tight text-[#2C1A0E]">{title}</h3>
                      <p className="mt-2 font-body text-sm leading-6 text-[#2C1A0E]/65">{text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Final CTA */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="mt-14 text-center"
              >
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-[6px] bg-[#1C2E4A] px-10 text-base font-semibold text-[#F2E8D5] shadow-[2px_3px_0px_rgba(28,46,74,0.4)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[#2A3F5F] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link to={startHref}>{t("finalCta", language)}</Link>
                </Button>
                <p className="mt-5 text-xs tracking-wide text-[#2C1A0E]/30">visby-quest.se</p>
              </motion.div>

            </div>
          </section>
        </motion.div>
      )}
    </>
  );
};

export default Index;
