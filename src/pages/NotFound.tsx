import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGameState } from "@/lib/game-state";
import { t } from "@/lib/i18n";

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
      className="flex min-h-screen items-center justify-center bg-background px-4"
    >
      <div className="parchment-bg stone-border rounded-2xl p-10 text-center max-w-sm w-full">
        <h1 className="font-heading text-8xl text-medieval-gold medieval-shadow">404</h1>
        <p className="mt-4 font-body text-xl text-foreground">{t('notFound', language)}</p>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          {t('notFoundSubtitle', language)}
        </p>
        <div className="mt-8">
          <Link to="/" className="btn-gold inline-block px-6 py-3 text-sm font-semibold">
            {t('returnHome', language)}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
