"use client";

import { useActionState, useEffect, useRef } from "react";
import { Check, Tag, X } from "lucide-react";
import { addTag, type TagActionState } from "@/app/dashboard/actions";
import type { ActivityLog } from "@/lib/types";
import styles from "./dashboard.module.css";

export default function TagDialog({ log, onClose }: { log: ActivityLog; onClose: () => void }) {
  const [state, action, pending] = useActionState(addTag, {} as TagActionState);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (state.success) { const timer = setTimeout(onClose, 650); return () => clearTimeout(timer); } }, [state.success, onClose]);
  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="tag-title" className={styles.tagDialog} onMouseDown={(event) => event.stopPropagation()}>
        <header><div className={styles.tagIcon}><Tag size={19} /></div><div><h2 id="tag-title">Add a tag</h2><p>Organize {log.employeeName}&apos;s recording.</p></div><button onClick={onClose} aria-label="Close tag dialog"><X size={18} /></button></header>
        {log.tags.length ? <div className={styles.existingTags}>{log.tags.map((tag) => <span key={tag.id}><Check size={13} />{tag.name}</span>)}</div> : null}
        <form action={action}>
          <input type="hidden" name="logId" value={log.id} />
          <label htmlFor="tag-name">Tag name</label>
          <input ref={inputRef} id="tag-name" name="name" placeholder="e.g. Needs follow-up" maxLength={24} required />
          {state.error ? <p role="alert" className={styles.formError}>{state.error}</p> : null}
          {state.success ? <p role="status" className={styles.formSuccess}>{state.success}</p> : null}
          <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save tag"}</button>
        </form>
      </section>
    </div>
  );
}
