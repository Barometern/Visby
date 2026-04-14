import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import MascotGuide from "@/components/MascotGuide";
import { useGameState } from "@/lib/game-state";
import heroImage from "@/assets/IMG_3126.png";
import parchmentBg from "@/assets/IMG_3128.png";
import centurymap from "@/assets/18th-century-map-of-visby-sweden-375758-1024.png";
import { languageNames, t, type Language } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function FoggyMapCard({
  alt,
  title,
}: {
  alt: string;
  title: string;
}) {
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

const Index = () => {
  const { language, setLanguage, isLoggedIn } = useGameState();
  const navigate = useNavigate();
  const startHref = isLoggedIn ? "/map" : "/login";

  const steps = [
    { title: t("step1Title", language), text: t("step1Text", language) },
    { title: t("step2Title", language), text: t("step2Text", language) },
    { title: t("step3Title", language), text: t("step3Text", language) },
  ];

  return (
    <div className="bg-[#F2E8D5] text-[#2C1A0E]">

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

        {/* Concentrated text vignette — darkness pools around the text area, edges breathe */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 52%, rgba(0,0,0,0.30) 0%, transparent 100%)",
          }}
        />

        {/* Dust particles — slow-floating motes in torch-lit stone air */}
        {[
          { left: "12%", top: "55%", size: 2, opacity: 0.35, duration: 9,  delay: 0,   driftX: 8  },
          { left: "27%", top: "68%", size: 3, opacity: 0.25, duration: 12, delay: 2.3, driftX: -12 },
          { left: "53%", top: "30%", size: 2, opacity: 0.40, duration: 8,  delay: 4.1, driftX: 14 },
          { left: "70%", top: "60%", size: 3, opacity: 0.28, duration: 14, delay: 1.7, driftX: -9 },
          { left: "41%", top: "75%", size: 2, opacity: 0.33, duration: 11, delay: 5.5, driftX: 10 },
          { left: "84%", top: "45%", size: 2, opacity: 0.30, duration: 10, delay: 3.2, driftX: -7 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute z-[5] rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              backgroundColor: `rgba(255,220,150,${p.opacity})`,
            }}
            animate={{
              y: [20, -100],
              x: [0, p.driftX],
              opacity: [0, p.opacity, p.opacity * 0.9, 0],
            }}
            transition={{
              times: [0, 0.15, 0.8, 1],
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

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

            <div className="relative mt-5">
              {/* Backlit glow — torch-lit warmth radiating behind the title */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: 400,
                  height: 200,
                  background: "radial-gradient(ellipse at center, rgba(201,168,76,0.12), transparent 70%)",
                }}
              />
              <h1 className="relative max-w-xl font-display text-5xl leading-[0.92] text-[#fff1d3] drop-shadow-[0_10px_30px_rgba(0,0,0,0.32)] sm:text-6xl lg:text-7xl">
                {t("heroTitle", language)}
              </h1>
            </div>

            <p className="mx-auto mt-5 max-w-sm text-lg leading-8 text-[#fff1d6]/80 sm:text-xl">
              {t("heroSubtitle", language)}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-[6px] border border-[#f0c976]/35 bg-[#dca54a] px-10 text-base font-semibold text-[#2f1d11] shadow-[0_18px_36px_rgba(0,0,0,0.24),2px_3px_0px_rgba(122,82,48,0.35),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.25)] transition-all duration-200 hover:translate-y-[-1px] hover:bg-[#e7b35d] hover:scale-[1.02] hover:shadow-[0_18px_36px_rgba(0,0,0,0.24),2px_3px_0px_rgba(122,82,48,0.35),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.25),0_0_18px_rgba(201,168,76,0.45)] active:translate-y-[1px] active:scale-[0.98] active:shadow-[0_6px_14px_rgba(0,0,0,0.22),1px_1px_0px_rgba(122,82,48,0.35),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.25)]"
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

      </section>

      {/* ─── SECTION 2 — PARCHMENT ─── */}
      <section
        id="how-it-works"
        className="relative bg-[#F2E8D5] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        style={{
          backgroundImage: `url(${parchmentBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Shadow continuation — hero darkness bleeds onto parchment, fading naturally */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0"
          style={{ height: 220, background: "linear-gradient(to bottom, rgba(12,8,5,0.72), transparent)" }}
        />
        <div className="relative z-10 mx-auto max-w-xl">

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
    </div>
  );
};

export default Index;
