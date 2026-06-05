import { db, type Highlight, type ReadingEntry, type MetaEntry } from "../bible/db";

const BACKUP_VERSION = 1;
const LS_KEYS = [
  "theme",
  "manna.notifications-enabled",
  "manna.reader-location",
  "manna.reader-font-size",
  "daily-verse-offset",
  "manna.daily-verse",
] as const;

interface BackupData {
  version: number;
  exportedAt: string;
  highlights: Highlight[];
  readingHistory: ReadingEntry[];
  meta: MetaEntry[];
  localStorage: Record<string, string | null>;
}

function readLocalStorage(): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (const key of LS_KEYS) {
    try {
      result[key] = localStorage.getItem(key);
    } catch {
      result[key] = null;
    }
  }
  return result;
}

function writeLocalStorage(data: Record<string, string | null>) {
  for (const key of LS_KEYS) {
    const value = data[key];
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch { /* localStorage may be full */ }
  }
}

export async function exportBackup(): Promise<void> {
  const [highlights, readingHistory, meta] = await Promise.all([
    db.highlights.toArray(),
    db.readingHistory.toArray(),
    db.meta.toArray(),
  ]);

  const data: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    highlights,
    readingHistory,
    meta,
    localStorage: readLocalStorage(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `manna-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  let data: BackupData;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file");
  }

  if (data.version !== BACKUP_VERSION) {
    throw new Error(`Unsupported backup version ${data.version}`);
  }

  if (!Array.isArray(data.highlights) || !Array.isArray(data.readingHistory) || !Array.isArray(data.meta)) {
    throw new Error("Invalid backup structure");
  }

  await db.transaction("rw", [db.highlights, db.readingHistory, db.meta], async () => {
    await Promise.all([
      db.highlights.clear(),
      db.readingHistory.clear(),
      db.meta.clear(),
    ]);

    await Promise.all([
      db.highlights.bulkAdd(data.highlights),
      db.readingHistory.bulkAdd(data.readingHistory),
      db.meta.bulkAdd(data.meta),
    ]);
  });

  writeLocalStorage(data.localStorage);
}
