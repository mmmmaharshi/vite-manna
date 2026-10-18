import { delay } from "es-toolkit";

const FONT_WAIT_TIMEOUT_MS = 3000;

const APP_FONT_FACES = [
  '400 1em "Google Sans Variable"',
  '900 1em "Google Sans Variable"',
];

export const waitForFonts = async () => {
  if (!("fonts" in document)) {
    return;
  }

  try {
    await Promise.race([
      Promise.all([
        ...APP_FONT_FACES.map((font) => document.fonts.load(font)),
        document.fonts.ready,
      ]),
      delay(FONT_WAIT_TIMEOUT_MS),
    ]);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[Fonts] Unable to preload fonts", error);
    }
  }
};
