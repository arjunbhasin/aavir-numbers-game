"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/progress";

/** Remembers that this game was opened, for the "Keep playing" row on the home page. */
export default function VisitTracker({ id }: { id: string }) {
  const hydrated = useProgress((s) => s.hydrated);
  const visit = useProgress((s) => s.visit);
  useEffect(() => {
    // wait for saved progress to load, or it would overwrite this visit
    if (hydrated) visit(id);
  }, [hydrated, id, visit]);
  return null;
}
