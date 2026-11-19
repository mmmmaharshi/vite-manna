import { useEffect, useState } from "react";

import { isBibleSeeded } from "../../../shared/bible";

/**
 * The Bible seed status.
 */
export type BibleStatus = "checking" | "ready" | "missing";

/**
 * Tracks whether the Bible database is seeded.
 *
 * @returns `"checking"`, `"ready"`, or `"missing"`.
 */
export const useBibleStatus = () => {
  const [status, setStatus] = useState<BibleStatus>("checking");

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const seeded = await isBibleSeeded();

        if (mounted) {
          setStatus(seeded ? "ready" : "missing");
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("[Bible] Unable to verify IndexedDB", error);
        }

        if (mounted) {
          setStatus("missing");
        }
      }
    };

    void check();

    return () => {
      mounted = false;
    };
  }, []);

  return status;
};
