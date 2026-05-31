import { useEffect, useState } from "react";

import { db } from "./db";

export type BibleStatus = "checking" | "ready" | "missing";

export function useBibleStatus() {
  const [status, setStatus] = useState<BibleStatus>("checking");

  useEffect(() => {
    let mounted = true;

    void db.verses
      .count()
      .then((count) => {
        if (mounted) {
          setStatus(count > 0 ? "ready" : "missing");
        }
      })
      .catch((error) => {
        console.error("[Bible] Unable to verify IndexedDB", error);

        if (mounted) {
          setStatus("missing");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return status;
}
