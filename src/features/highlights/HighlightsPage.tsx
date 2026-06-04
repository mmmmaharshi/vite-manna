import { useCallback, useMemo, useState } from "react";
import {
  Copy,
  PencilToSquare,
  TrashBin,
} from "@gravity-ui/icons";
import {
  AlertDialog,
  Button,
  ScrollShadow,
  Surface,
  ToggleButton,
  ToggleButtonGroup,
  toast,
  Tooltip,
  Typography,
} from "@heroui/react";

import {
  getBibleBookName,
  HIGHLIGHT_COLORS,
  type HighlightColor,
} from "../../shared/bible";
import { copyToClipboard } from "../../shared/lib/browser";
import { useReaderStore } from "../reader/store/readerStore";
import { useHighlights } from "../highlights/hooks/useHighlights";
import type { HighlightEntry } from "../highlights/store/highlightStore";
import { cn } from "../../shared/lib/cn";

interface HighlightsPageProps {
  onNavigateToReader: () => void;
}

function formatRef(book: number, chapter: number, verse: number) {
  return `${getBibleBookName(book)} ${chapter}:${verse}`;
}

const MAX_NOTE_LENGTH = 120;

const COLOR_STYLES: Record<HighlightColor, string> = {
  yellow: "bg-yellow-200/70 dark:bg-yellow-500/20 border-yellow-400/40",
  green: "bg-green-200/60 dark:bg-green-500/20 border-green-400/40",
  blue: "bg-blue-200/60 dark:bg-blue-500/20 border-blue-400/40",
  pink: "bg-pink-200/50 dark:bg-pink-500/15 border-pink-400/40",
  orange: "bg-orange-200/60 dark:bg-orange-500/20 border-orange-400/40",
};

const DOT_STYLES: Record<HighlightColor, string> = {
  yellow: "bg-yellow-400 dark:bg-yellow-400",
  green: "bg-green-500 dark:bg-green-400",
  blue: "bg-blue-500 dark:bg-blue-400",
  pink: "bg-pink-500 dark:bg-pink-400",
  orange: "bg-orange-500 dark:bg-orange-400",
};

const HighlightsPage = ({ onNavigateToReader }: HighlightsPageProps) => {
  const { highlights, remove, updateNote } = useHighlights();
  const [filterColor, setFilterColor] = useState<HighlightColor | "all">("all");
  const [editingNote, setEditingNote] = useState<HighlightEntry | null>(null);
  const [noteText, setNoteText] = useState("");
  const [pendingRemove, setPendingRemove] = useState<HighlightEntry | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const colorKeys = useMemo(() => new Set([filterColor]), [filterColor]);

  const toggleExpanded = useCallback((id: number) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const uniqueColors = useMemo(() => {
    const set = new Set(highlights.map((h) => h.color));
    return HIGHLIGHT_COLORS.filter((c) => set.has(c));
  }, [highlights]);

  const filtered = useMemo(() => {
    if (filterColor === "all") return highlights;
    return highlights.filter((h) => h.color === filterColor);
  }, [highlights, filterColor]);

  const navigateToVerse = (book: number, chapter: number, verse: number) => {
    const store = useReaderStore.getState();
    store.setBook(book);
    store.setChapter(chapter);
    store.setPermalinkVerse(verse);
    onNavigateToReader();
  };

  const handleRemove = (hl: HighlightEntry) => {
    remove(hl.verseId);
    toast("Highlight removed", { variant: "success" });
  };

  const handleEditNote = (hl: HighlightEntry) => {
    setEditingNote(hl);
    setNoteText(hl.note);
  };

  const handleSaveNote = () => {
    if (!editingNote) return;
    updateNote(editingNote.verseId, noteText);
    setEditingNote(null);
    setNoteText("");
    toast("Note saved", { variant: "success" });
  };

  const handleClearNote = () => {
    if (!editingNote) return;
    updateNote(editingNote.verseId, "");
    setEditingNote(null);
    setNoteText("");
    toast("Note cleared", { variant: "success" });
  };

  return (
    <div className="h-dvh flex flex-col">
      <Surface className="sticky top-0 z-30 bg-surface py-3 border border-b">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 mx-auto flex flex-col gap-2">
          <Typography.Heading level={1} className="text-xl">Highlights</Typography.Heading>
        </div>
      </Surface>

      <ScrollShadow hideScrollBar className="flex-1">
        {highlights.length > 0 && uniqueColors.length > 1 && (
          <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 mx-auto pt-2">
            <ScrollShadow hideScrollBar orientation="horizontal">
              <ToggleButtonGroup
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={colorKeys}
                onSelectionChange={(keys) => setFilterColor([...keys][0] as HighlightColor | "all")}
              >
                <ToggleButton id="all">All ({highlights.length})</ToggleButton>
                {uniqueColors.map((color) => (
                  <ToggleButton key={color} id={color}>
                    <span className={cn("inline-block w-2.5 h-2.5 rounded-full me-1.5", DOT_STYLES[color])} />
                    {color} ({highlights.filter((h) => h.color === color).length})
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </ScrollShadow>
          </div>
        )}

        {highlights.length === 0 ? (
          <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-24 mx-auto flex flex-col items-center gap-4 text-center">
            <PencilToSquare aria-hidden="true" className="h-10 w-10 sm:h-12 sm:w-12 text-muted" />
            <Typography className="text-base font-medium">No highlights yet</Typography>
            <Typography.Paragraph size="sm" color="muted">
              Select a verse and tap the highlight icon to color it
            </Typography.Paragraph>
          </section>
        ) : filtered.length === 0 ? (
          <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-16 mx-auto text-center">
            <Typography.Paragraph size="sm" color="muted">No matching highlights</Typography.Paragraph>
          </section>
        ) : (
          <section className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-full px-2 py-4 mx-auto flex flex-col gap-2">
            {filtered.map((hl) => (
              <Surface key={hl.id} className={cn("flex flex-col p-3 gap-2 border-l-4", COLOR_STYLES[hl.color])}>
                <div className="flex items-center gap-2">
                  <button type="button" className="flex-1 min-w-0 text-left" onClick={() => navigateToVerse(hl.book, hl.chapter, hl.verse)}>
                    <Typography className="text-sm font-medium text-accent">
                      {formatRef(hl.book, hl.chapter, hl.verse)}
                    </Typography>
                  </button>
                  <div className="flex gap-0.5 shrink-0">
                    <Tooltip delay={0}>
                      <Button isIconOnly size="sm" variant="tertiary" aria-label="Edit note" onPress={() => handleEditNote(hl)}>
                        <PencilToSquare aria-hidden="true" className="h-3.5 w-3.5 text-muted" />
                      </Button>
                      <Tooltip.Content placement="top">Add Note</Tooltip.Content>
                    </Tooltip>
                    <Tooltip delay={0}>
                      <Button isIconOnly size="sm" variant="tertiary" aria-label="Copy verse"
                        onPress={async () => {
                          try {
                            await copyToClipboard(`${formatRef(hl.book, hl.chapter, hl.verse)} ${hl.text}`);
                            toast("Verse copied to clipboard", { variant: "success" });
                          } catch { toast("Failed to copy verse", { variant: "danger" }); }
                        }}>
                        <Copy aria-hidden="true" className="h-3.5 w-3.5 text-muted" />
                      </Button>
                      <Tooltip.Content placement="top">Copy Verse</Tooltip.Content>
                    </Tooltip>
                    <Tooltip delay={0}>
                      <Button isIconOnly size="sm" variant="tertiary" aria-label="Remove highlight" onPress={() => setPendingRemove(hl)}>
                        <TrashBin aria-hidden="true" className="h-3.5 w-3.5 text-muted" />
                      </Button>
                      <Tooltip.Content placement="top">Remove Highlight</Tooltip.Content>
                    </Tooltip>
                  </div>
                </div>

                <Typography.Paragraph size="sm" color="muted" className="line-clamp-4 sm:line-clamp-3 break-words">
                  {hl.text}
                </Typography.Paragraph>

                {hl.note && (
                  <div className="mt-1 pt-2 border-t border-separator">
                    <Typography.Paragraph
                      size="xs"
                      color="muted"
                      className={cn("italic break-words whitespace-pre-wrap", !expandedNotes.has(hl.id) && "line-clamp-2")}
                    >
                      {hl.note}
                    </Typography.Paragraph>
                    {hl.note.length > MAX_NOTE_LENGTH && (
                      <button type="button" className="text-xs text-accent mt-0.5 hover:underline" onClick={() => toggleExpanded(hl.id)}>
                        {expandedNotes.has(hl.id) ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}
              </Surface>
            ))}
          </section>
        )}

        <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
      </ScrollShadow>

      <AlertDialog.Backdrop isOpen={editingNote !== null} onOpenChange={(open) => { if (!open) { setEditingNote(null); setNoteText(""); }}}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            {({ close }) => (
              <>
                <AlertDialog.CloseTrigger />
                <AlertDialog.Header>
                  <AlertDialog.Heading>{editingNote?.note ? "Edit Note" : "Add Note"}</AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  {editingNote && (
                    <div className="mb-3">
                      <Typography.Paragraph size="sm" color="muted">
                        {formatRef(editingNote.book, editingNote.chapter, editingNote.verse)}
                      </Typography.Paragraph>
                    </div>
                  )}
                  <textarea
                    className="w-full min-h-[120px] rounded-lg border border-border bg-field-background p-3 text-sm text-field-foreground placeholder-field-placeholder resize-y focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Write your note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    autoFocus
                  />
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <div className="flex w-full gap-2 justify-between">
                    <div>
                      {editingNote?.note && (
                        <Button variant="danger" size="sm" onPress={() => { handleClearNote(); close(); }}>
                          Clear Note
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button slot="close" variant="tertiary" size="sm" onPress={() => { setEditingNote(null); setNoteText(""); }}>Cancel</Button>
                      <Button variant="primary" size="sm" isDisabled={!noteText.trim()} onPress={() => { handleSaveNote(); close(); }}>Save</Button>
                    </div>
                  </div>
                </AlertDialog.Footer>
              </>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      <AlertDialog.Backdrop isOpen={pendingRemove !== null} onOpenChange={(open) => { if (!open) setPendingRemove(null); }}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            {({ close }) => (
              <>
                <AlertDialog.CloseTrigger />
                <AlertDialog.Header>
                  <AlertDialog.Icon status="danger" />
                  <AlertDialog.Heading>Remove highlight?</AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <p>Remove highlight for <strong>{pendingRemove ? formatRef(pendingRemove.book, pendingRemove.chapter, pendingRemove.verse) : ""}</strong>?</p>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <Button slot="close" variant="tertiary">Cancel</Button>
                  <Button variant="danger" onPress={() => { if (pendingRemove) handleRemove(pendingRemove); close(); }}>
                    <TrashBin aria-hidden="true" className="h-4 w-4" />
                    Remove
                  </Button>
                </AlertDialog.Footer>
              </>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  );
};

export default HighlightsPage;
