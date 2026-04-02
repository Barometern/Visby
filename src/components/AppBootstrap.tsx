import { useEffect } from "react";
import { VISBY_LOCATIONS } from "@/lib/game-state";
import { useGameState } from "@/lib/game-state";

export default function AppBootstrap() {
  const bootstrapApp = useGameState((state) => state.bootstrapApp);

  useEffect(() => {
    void bootstrapApp(VISBY_LOCATIONS);
  }, [bootstrapApp]);

  return null;
}
