import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import balleBaggeGlad from "@/assets/balleBagge/balleBagge-glad.png";
import balleBaggePekar from "@/assets/balleBagge/balleBagge-pekar.png";
import balleBaggeFraga from "@/assets/balleBagge/balleBagge-fraga.png";
import balleBaggeSkattkarta from "@/assets/balleBagge/balleBagge-skattkarta.png";

type MascotPose = "welcome" | "point" | "question" | "map";
type MascotPosition = "center" | "bottom-left" | "bottom-right" | "inline";
type MascotVariant = "parchment" | "dark";

type MascotGuideProps = {
  pose: MascotPose;
  text: string;
  position?: MascotPosition;
  interactive?: boolean;
  onClick?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: MascotVariant;
  lambSuffix?: boolean;
};

const poseImages: Record<MascotPose, string> = {
  welcome: balleBaggeGlad,
  point: balleBaggePekar,
  question: balleBaggeFraga,
  map: balleBaggeSkattkarta,
};

const positionClasses: Record<MascotPosition, string> = {
  center: "mx-auto flex max-w-[26rem] flex-col items-center text-center",
  inline:
    "flex w-full flex-col-reverse items-center gap-3 text-center sm:flex-row sm:items-end sm:text-left",
  "bottom-left":
    "fixed bottom-5 left-1/2 z-40 flex w-[min(100vw-1.5rem,24rem)] -translate-x-1/2 flex-col-reverse items-center gap-3 text-center sm:bottom-24 sm:left-4 sm:w-auto sm:max-w-[calc(100vw-2rem)] sm:translate-x-0 sm:flex-row sm:items-end sm:text-left",
  "bottom-right":
    "fixed bottom-5 left-1/2 z-40 flex w-[min(100vw-1.5rem,24rem)] -translate-x-1/2 flex-col-reverse items-center gap-3 text-center sm:bottom-24 sm:left-auto sm:right-4 sm:w-auto sm:max-w-[calc(100vw-2rem)] sm:translate-x-0 sm:flex-row-reverse sm:items-end sm:text-left",
};

const bubbleTailClasses: Record<MascotPosition, string> = {
  center: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2",
  inline: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2 sm:left-8 sm:translate-x-0",
  "bottom-left":
    "left-1/2 top-full -translate-x-1/2 -translate-y-1/2 sm:left-8 sm:translate-x-0",
  "bottom-right":
    "left-1/2 top-full -translate-x-1/2 -translate-y-1/2 sm:left-auto sm:right-0 sm:top-1/2 sm:translate-x-1/2 sm:-translate-y-1/2",
};

function applyLambSuffix(text: string): string {
  return text.replace(/[.!?…]+\s*$/, '') + ', lamb.';
}

export default function MascotGuide({
  pose,
  text,
  position = "inline",
  interactive = false,
  onClick,
  actionLabel,
  onAction,
  className = "",
  variant = "parchment",
  lambSuffix = false,
}: MascotGuideProps) {
  const imageSrc = poseImages[pose];
  const isCentered = position === "center";
  const bubbleWidthClass = isCentered
    ? "max-w-[80vw] sm:max-w-[24rem]"
    : "w-full max-w-[22rem] sm:w-auto sm:max-w-[min(80vw,20rem)]";
  const isDark = variant === "dark";
  const displayText = lambSuffix ? applyLambSuffix(text) : text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`${positionClasses[position]} ${className}`.trim()}
    >
      <div className={`relative ${bubbleWidthClass}`}>
        <div
          className={[
            isDark
              ? "relative rounded-[26px] border border-[#d8b981]/40 bg-[linear-gradient(180deg,rgba(76,53,35,0.88),rgba(42,28,19,0.74))] px-4 py-3 text-[#f7ead1] shadow-[0_18px_45px_rgba(28,18,12,0.24)] backdrop-blur-[3px] transition-shadow duration-300"
              : "relative rounded-[26px] border border-[#e8c98f]/26 bg-[linear-gradient(180deg,rgba(255,249,235,0.97),rgba(244,229,198,0.95))] px-4 py-3 text-[#3a2518] shadow-[0_18px_45px_rgba(64,42,22,0.18)] transition-shadow duration-300",
            interactive ? "cursor-pointer transition-transform hover:translate-y-[-1px]" : "",
          ].join(" ")}
          onClick={interactive ? onClick : undefined}
        >
          <p className="font-body text-sm leading-6 sm:text-[15px]">{displayText}</p>
          {actionLabel && onAction ? (
            <Button
              type="button"
              size="sm"
              onClick={onAction}
              className="mt-3 h-10 rounded-[6px] bg-[#dca54a] px-5 text-sm font-semibold text-[#2f1d11] hover:bg-[#e7b35d] hover:scale-[1.03] active:scale-[0.97] transition-transform duration-150"
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
        <div
          className={`absolute h-4 w-4 rotate-45 ${
            isDark
              ? "border-b border-r border-[#d8b981]/40 bg-[#5c402c]"
              : "border-b border-r border-[#e8c98f]/26 bg-[#f4e5c6]"
          } ${bubbleTailClasses[position]}`}
        />
      </div>

      <motion.img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className={[
          "select-none drop-shadow-[0_18px_28px_rgba(38,23,13,0.22)]",
          isCentered
            ? "mt-2 w-[34vw] min-w-[140px] max-w-[210px]"
            : "w-[28vw] min-w-[112px] max-w-[156px] sm:w-[24vw] sm:min-w-[96px] sm:max-w-[148px]",
        ].join(" ")}
      />
    </motion.div>
  );
}
