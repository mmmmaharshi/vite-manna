import { Typography } from "@heroui/react";

import type { BibleVerse } from "../../../shared/bible";

interface VerseListProps {
  verses: BibleVerse[];
}

const VerseList = ({ verses }: VerseListProps) => (
  <ol className="flex flex-col gap-3 [content-visibility:auto]">
    {verses.map((verse) => (
      <li key={verse.id}>
        <Typography className="text-sm">
          <sup className="me-1 text-xs text-muted">{verse.verse}</sup>
          {verse.text}
        </Typography>
      </li>
    ))}
  </ol>
);

export default VerseList;
