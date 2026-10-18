import { useEffect, useState } from "react";

import { isBibleSeeded } from "../../../shared/bible";

export type BibleStatus = "checking" | "ready" | "missing";

export const useBibleStatus = (): BibleStatus => {
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
