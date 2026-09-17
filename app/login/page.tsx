import { Sprout } from "lucide-react";
import { continueAsDemo } from "./actions";
import styles from "./login.module.css";

const messages: Record<string, string> = {
  "demo-not-configured": "The hosted demo account has not been configured yet.",
  "sign-in-failed": "The demo account could not be signed in. Please try again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.brand}><span className={styles.logo}><Sprout size={25} strokeWidth={1.6} /></span><span>Toph</span></div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Bays Ranch workspace</p>
          <h1>Farm activity,<br />clearly recorded.</h1>
          <p>Review employee voice logs, field work, and recording accuracy in one place.</p>
        </div>
        <form action={continueAsDemo} className={styles.form}>
          <button type="submit">Continue as demo farmer <span aria-hidden>→</span></button>
          {error ? <p role="alert" className={styles.error}>{messages[error] ?? "Unable to sign in."}</p> : null}
          <small>No account setup required</small>
        </form>
      </section>
      <aside className={styles.visual} aria-label="Toph product preview">
        <div className={styles.fieldLines} />
        <div className={styles.statusCard}><span>Response accuracy</span><strong>90</strong><small>Across today&apos;s logs</small></div>
        <div className={styles.activityCard}><span className={styles.dot} /> <span>Isaac finished spraying</span><time>10:40 AM</time></div>
      </aside>
    </main>
  );
}
