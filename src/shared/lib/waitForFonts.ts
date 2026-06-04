const FONT_WAIT_TIMEOUT_MS = 3_000;
const APP_FONT_FACES = [
  '400 1em "Google Sans Variable"',
  '900 1em "Google Sans Variable"',
];

export async function waitForFonts() {
  if (!("fonts" in document)) {
    return;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      Promise.all([
        ...APP_FONT_FACES.map((font) => document.fonts.load(font)),
        document.fonts.ready,
      ]),
      new Promise<void>((resolve) => {
        timeoutId = setTimeout(resolve, FONT_WAIT_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    if (import.meta.env.DEV) console.warn("[Fonts] Unable to preload fonts", error);
  } finally {
    clearTimeout(timeoutId);
  }
}
