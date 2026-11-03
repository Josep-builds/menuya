"use client";

import { useEffect, useRef } from "react";
import { trackSavingViewed } from "@/lib/event-actions";

/** Registra «saving_viewed» una sola vez por visita a la pantalla. */
export function SavingViewed() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void trackSavingViewed();
  }, []);
  return null;
}
