import Dexie, { type Table } from "dexie";

export interface BibleVerse {
  id: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

class BibleDB extends Dexie {
  verses!: Table<BibleVerse, number>;

  constructor() {
    super("BibleDB");

    this.version(1).stores({
      verses: "Verseid",
    });

    this.version(2).stores({
      verses: null,
    });

    this.version(3).stores({
      verses: "id",
    });

    this.version(4).stores({
      verses: "id, book",
    });

    this.version(5).stores({
      verses: "id, book, [book+chapter]",
    });
  }
}

export const db = new BibleDB();
