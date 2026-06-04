import type { Ref } from "react";
import type { ImageRatio } from "../hooks/useVerseImage";
import { RATIOS } from "../hooks/useVerseImage";

interface VerseImageCardProps {
  ref?: Ref<HTMLDivElement>;
  verses: { text: string; verse: number }[];
  reference: string;
  teluguText: string;
  ratio?: ImageRatio;
}

const VerseImageCard = ({ ref, verses, reference, teluguText, ratio = "landscape" }: VerseImageCardProps) => {
  const { width, height } = RATIOS[ratio];
  const isLandscape = ratio === "landscape";
  const isPortrait = ratio === "portrait";
  const isSquare = ratio === "square";

  const textSize = isPortrait ? "42px" : (isSquare ? "32px" : "36px");
  const refSize = isPortrait ? "24px" : (isSquare ? "18px" : "20px");
  const paddingX = isLandscape ? 80 : 64;
  const paddingY = isPortrait ? 120 : (isSquare ? 80 : 56);
  const gap = isPortrait ? 28 : 20;
  const contentMaxW = isPortrait ? 720 : 820;

  const verseNumbers = verses.length > 1
    ? [...new Set(verses.map((v) => v.verse))].toSorted((a, b) => a - b)
    : [];

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        padding: `${paddingY}px ${paddingX}px`,
        fontFamily: '"Google Sans Variable", "Noto Sans Telugu", sans-serif',
      }}
      aria-hidden="true"
    >
      <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
      <div
        className="absolute -top-[120px] -right-[80px] w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-[100px] -left-[60px] w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)" }}
      />

      <div className="flex flex-col items-center justify-center z-10" style={{ gap: `${gap}px`, maxWidth: `${contentMaxW}px` }}>
        {verseNumbers.length > 0 && (
          <span className="text-slate-400 font-medium tracking-wider" style={{ fontSize: isSquare ? "16px" : "18px" }}>
            {verseNumbers.join(", ")}
          </span>
        )}
        <div className="text-slate-100 text-center font-normal max-w-full break-words leading-[1.6]" style={{ fontSize: textSize }}>
          {teluguText}
        </div>
        <div className="w-12 h-[2px] my-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        <span className="text-amber-400 font-semibold tracking-wide" style={{ fontSize: refSize }}>
          {reference}
        </span>
      </div>

      <span className="absolute bottom-7 right-10 text-slate-600 text-sm font-bold tracking-[0.15em] uppercase">
        మన్నా
      </span>
    </div>
  );
};

export default VerseImageCard;
