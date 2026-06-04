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

function getStyles(ratio: ImageRatio) {
  const { width, height } = RATIOS[ratio];
  const isLandscape = ratio === "landscape";
  const isPortrait = ratio === "portrait";
  const isSquare = ratio === "square";

  const textSize = isPortrait ? "42px" : (isSquare ? "32px" : "36px");
  const refSize = isPortrait ? "24px" : (isSquare ? "18px" : "20px");
  const paddingX = isLandscape ? "80px" : "64px";
  const paddingY = isPortrait ? "120px" : (isSquare ? "80px" : "56px");

  return {
    container: {
      width: `${width}px`,
      height: `${height}px`,
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      alignItems: "center",
      padding: `${paddingY} ${paddingX}`,
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      position: "relative" as const,
      overflow: "hidden",
      fontFamily: '"Google Sans Variable", "Noto Sans Telugu", sans-serif',
    },
    accentLine: {
      position: "absolute" as const,
      top: "0",
      left: "0",
      right: "0",
      height: "5px",
      background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
    },
    glow1: {
      position: "absolute" as const,
      top: "-120px",
      right: "-80px",
      width: "400px",
      height: "400px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
    },
    glow2: {
      position: "absolute" as const,
      bottom: "-100px",
      left: "-60px",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
    },
    content: {
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      alignItems: "center",
      gap: isPortrait ? "28px" : "20px",
      zIndex: 1,
      maxWidth: isPortrait ? "720px" : "820px",
    },
    verseText: {
      color: "#f1f5f9",
      fontSize: textSize,
      lineHeight: "1.6",
      textAlign: "center" as const,
      fontWeight: 400,
      maxWidth: "100%",
      wordBreak: "break-word" as const,
    },
    verseNumbers: {
      color: "#94a3b8",
      fontSize: isSquare ? "16px" : "18px",
      fontWeight: 500,
      letterSpacing: "0.05em",
    },
    divider: {
      width: "48px",
      height: "2px",
      background: "linear-gradient(90deg, transparent, #f59e0b, transparent)",
      margin: "4px 0",
    },
    reference: {
      color: "#fbbf24",
      fontSize: refSize,
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    branding: {
      position: "absolute" as const,
      bottom: "28px",
      right: "40px",
      color: "#475569",
      fontSize: "14px",
      fontWeight: 700,
      letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
    },
  };
}

const VerseImageCard = ({ ref, verses, reference, teluguText, ratio = "landscape" }: VerseImageCardProps) => {
  const styles = getStyles(ratio);

  const verseNumbers = verses.length > 1
    ? [...new Set(verses.map((v) => v.verse))].toSorted((a, b) => a - b)
    : [];

  return (
    <div
      ref={ref}
      style={styles.container}
      aria-hidden="true"
    >
      <div style={styles.accentLine} />
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div style={styles.content}>
        {verseNumbers.length > 0 && (
          <span style={styles.verseNumbers}>
            {verseNumbers.join(", ")}
          </span>
        )}
        <div style={styles.verseText}>{teluguText}</div>
        <div style={styles.divider} />
        <span style={styles.reference}>{reference}</span>
      </div>

      <span style={styles.branding}>మన్నా</span>
    </div>
  );
};

export default VerseImageCard;
