"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import type { ActivityLog } from "@/lib/types";
import styles from "./dashboard.module.css";

const MapPanel = dynamic(() => import("./MapPanel"), { ssr: false });

export default function MapDialog({ log, onClose }: { log: ActivityLog; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="map-title" className={styles.mapDialog} onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span>FIELD LOCATION</span><h2 id="map-title">{log.fieldName}</h2></div><button onClick={onClose} aria-label="Close map"><X /></button></header>
        <div className={styles.mapDialogCanvas}><MapPanel latitude={log.latitude} longitude={log.longitude} fieldName={log.fieldName} expanded /></div>
      </section>
    </div>
  );
}
