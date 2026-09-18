"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Star } from "lucide-react";
import type { ActivityLog } from "@/lib/types";
import styles from "./dashboard.module.css";

export default function Waveform({ log, onTag }: { log: ActivityLog; onTag: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!playing || log.audioUrl) return;
    const timer = window.setInterval(() => setProgress((value) => value >= 1 ? 0 : value + 0.0125), 120);
    return () => window.clearInterval(timer);
  }, [playing, log.audioUrl]);

  const toggle = async () => {
    if (audioRef.current) {
      if (audioRef.current.paused) await audioRef.current.play(); else audioRef.current.pause();
    }
    setPlaying((value) => !value);
  };

  return (
    <div className={styles.waveformContent}>
      {log.audioUrl ? <audio ref={audioRef} src={log.audioUrl} onTimeUpdate={(event) => {
        const audio = event.currentTarget;
        if (audio.duration) setProgress(audio.currentTime / audio.duration);
      }} onEnded={() => { setPlaying(false); setProgress(0); }} /> : null}
      <div className={styles.waveform} aria-label="Audio waveform">
        {log.waveform.map((peak, index) => <i key={index} style={{ height: `${Math.max(7, peak)}px`, opacity: index / log.waveform.length <= progress ? 1 : .25 }} />)}
      </div>
      <div className={styles.recordingActions}>
        <button onClick={toggle}>{playing ? <Pause size={17} /> : <Play size={17} />} {playing ? "Pause Recording" : "Play Recording"}</button>
        <button className={styles.addTag} onClick={onTag}><Star size={17} /> Add Tag</button>
      </div>
      <div className={styles.summary}><h3>Summary</h3><p>{log.summary}</p></div>
    </div>
  );
}
