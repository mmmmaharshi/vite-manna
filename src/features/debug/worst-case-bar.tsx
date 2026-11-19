import { useWorstCase } from "./use-worst-case";
import type { WorstCaseMode } from "./use-worst-case";

const SEGMENTS: { id: WorstCaseMode; label: string }[] = [
  { id: "demo", label: "Demo" },
  { id: "worst", label: "Worst case" },
  { id: "huge", label: "Huge" },
];

/**
 * Dev-only toggle between demo data and worst-case data.
 *
 * @returns The worst-case toggle, or nothing outside dev.
 */
export const WorstCaseBar = () => {
  const { mode, selectMode } = useWorstCase();

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-2 z-50 flex justify-center">
      <fieldset className="border-border bg-surface flex gap-1 rounded-full border p-1 shadow-lg">
        <legend className="sr-only">Fixture data</legend>
        {SEGMENTS.map((segment) => {
          const isActive = segment.id === mode;

          return (
            <button
              key={segment.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => selectMode(segment.id)}
              className={
                isActive
                  ? "bg-foreground text-background rounded-full px-3 py-1 text-xs"
                  : "text-muted rounded-full px-3 py-1 text-xs"
              }
            >
              {segment.label}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
};
