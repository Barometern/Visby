import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGameState } from "@/lib/game-state";
import { t } from "@/lib/i18n";
import MascotGuide from "@/components/MascotGuide";

const NotFound = () => {
  const location = useLocation();
  const { language } = useGameState();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen items-center justify-center bg-[#F2E8D5] px-4"
    >
      <div className="bg-[#FAF6EE] border-2 border-[#7A5230]/40 rounded-[12px] shadow-[4px_6px_0px_rgba(122,82,48,0.2)] p-10 text-center max-w-sm w-full">
        <MascotGuide
          pose="question"
          position="center"
          text="Hmm, this path leads nowhere. Let us turn back."
          lambSuffix={true}
          variant="parchment"
          className="mb-6"
        />
        <h1 className="font-heading text-8xl text-[#C9A84C] medieval-shadow mt-6">404</h1>
        <p className="mt-4 font-body text-xl text-[#2C1A0E]">{t('notFound', language)}</p>
        <p className="mt-2 font-body text-sm text-[#2C1A0E]/60">
          {t('notFoundSubtitle', language)}
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-block px-6 py-3 text-sm font-semibold bg-[#1C2E4A] text-[#F2E8D5] rounded-[6px] hover:bg-[#2A3F5F] transition-colors duration-200 shadow-[2px_3px_0px_rgba(28,46,74,0.4)]"
          >
            {t('returnHome', language)}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
