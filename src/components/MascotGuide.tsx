import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import balleBaggeGlad from "@/assets/balleBagge/balleBagge-glad.png";
import balleBaggePekar from "@/assets/balleBagge/balleBagge-pekar.png";
import balleBaggeFraga from "@/assets/balleBagge/balleBagge-fraga.png";
import balleBaggeSkattkarta from "@/assets/balleBagge/balleBagge-skattkarta.png";

type MascotPose = "welcome" | "point" | "question" | "map";
type MascotPosition = "center" | "bottom-left" | "bottom-right" | "inline";

type MascotGuideProps = {
  pose: MascotPose;
  text: string;
  position?: MascotPosition;
  interactive?: boolean;
  onClick?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

const poseImages: Record<MascotPose, string> = {
  welcome: balleBaggeGlad,
  point: balleBaggePekar,
  question: balleBaggeFraga,
  map: balleBaggeSkattkarta,
};

const positionClasses: Record<MascotPosition, string> = {
  center: "mx-auto flex max-w-[26rem] flex-col items-center text-center",
  inline: "flex w-full items-end gap-3 text-left",
  "bottom-left": "fixed bottom-24 left-4 z-40 flex max-w-[calc(100vw-2rem)] items-end gap-3 text-left",
  "bottom-right": "fixed bottom-24 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-row-reverse items-end gap-3 text-left",
};

const bubbleTailClasses: Record<MascotPosition, string> = {
  center: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2",
  inline: "left-8 top-full -translate-y-1/2",
  "bottom-left": "left-8 top-full -translate-y-1/2",
  "bottom-right": "right-8 top-full -translate-y-1/2",
};

export default function MascotGuide({
  pose,
  text,
  position = "inline",
  interactive = false,
  onClick,
  actionLabel,
  onAction,
  className = "",
}: MascotGuideProps) {
  const imageSrc = poseImages[pose];
  const isCentered = position === "center";
  const bubbleWidthClass = isCentered ? "max-w-[80vw] sm:max-w-[24rem]" : "max-w-[min(80vw,20rem)]";

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
            "relative rounded-[26px] border border-[#e8c98f]/26 bg-[linear-gradient(180deg,rgba(255,249,235,0.97),rgba(244,229,198,0.95))] px-4 py-3 text-[#3a2518] shadow-[0_18px_45px_rgba(64,42,2[...]",
            interactive ? "cursor-pointer transition-transform hover:translate-y-[-1px]" : "",
          ].join(" ")}
          onClick={interactive ? onClick : undefined}
        >
          <p className="font-body text-sm leading-6 sm:text-[15px]">{text}</p>
          {actionLabel && onAction ? (
            <Button
              type="button"
              size="sm"
              onClick={onAction}
              className="mt-3 h-10 rounded-full bg-[#dca54a] px-5 text-sm font-semibold text-[#2f1d11] hover:bg-[#e7b35d]"
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
        <div
          className={`absolute h-4 w-4 rotate-45 border-b border-r border-[#e8c98f]/26 bg-[#f4e5c6] ${bubbleTailClasses[position]}`}
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
          isCentered ? "mt-2 w-[34vw] min-w-[140px] max-w-[210px]" : "w-[24vw] min-w-[96px] max-w-[148px]",
        ].join(" ")}
      />
    </motion.div>
  );
}