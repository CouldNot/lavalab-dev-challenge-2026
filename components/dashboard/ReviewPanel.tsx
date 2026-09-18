"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Flag, RotateCcw, ShieldCheck } from "lucide-react";
import { reviewActivityLog, type ReviewActionState } from "@/app/dashboard/actions";
import type { ActivityLog, ReviewStatus } from "@/lib/types";
import styles from "./dashboard.module.css";

const labels: Record<ReviewStatus, string> = { new: "Needs review", reviewed: "Reviewed", flagged: "Flagged" };

export default function ReviewPanel({ log }: { log: ActivityLog }) {
  const [status, setStatus] = useState<ReviewStatus>(log.reviewStatus);
  const [note, setNote] = useState(log.reviewNote ?? "");
  const [state, action, pending] = useActionState(reviewActivityLog, {} as ReviewActionState);

  const icon = status === "reviewed" ? <CheckCircle2 size={16} /> : status === "flagged" ? <Flag size={16} /> : <ShieldCheck size={16} />;
  const buttonLabel = status === "reviewed" ? "Mark reviewed" : status === "flagged" ? "Flag for follow-up" : "Return to review queue";

  return (
    <section className={styles.reviewPanel} aria-label="Recording review">
      <div className={styles.reviewHeading}>
        <div><span>REVIEW DECISION</span><strong>{icon}{labels[log.reviewStatus]}</strong></div>
        {log.reviewedAt ? <time dateTime={log.reviewedAt}>Updated {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }).format(new Date(log.reviewedAt))}</time> : null}
      </div>
      <form action={action} className={styles.reviewForm}>
        <input type="hidden" name="logId" value={log.id} />
        <label>Decision
          <select name="status" value={status} onChange={(event) => setStatus(event.target.value as ReviewStatus)}>
            <option value="new">Needs review</option>
            <option value="reviewed">Reviewed</option>
            <option value="flagged">Flagged for follow-up</option>
          </select>
        </label>
        <label>Review note <span>(optional)</span>
          <textarea name="note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="Add context for the next reviewer…" rows={2} />
        </label>
        {state.error ? <p role="alert" className={styles.formError}>{state.error}</p> : null}
        {state.success ? <p role="status" className={styles.formSuccess}>{state.success}</p> : null}
        <button type="submit" className={styles.reviewSubmit} disabled={pending}>{status === "new" ? <RotateCcw size={16} /> : icon}{pending ? "Saving…" : buttonLabel}</button>
      </form>
    </section>
  );
}
