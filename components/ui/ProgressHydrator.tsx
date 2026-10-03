"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/progress";

/** Loads saved progress after the first render so server and client HTML match. */
export default function ProgressHydrator() {
  useEffect(() => {
    void useProgress.persist.rehydrate();
  }, []);
  return null;
}
