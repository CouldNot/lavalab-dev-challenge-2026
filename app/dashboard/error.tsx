"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
    <section style={{ textAlign: "center", maxWidth: 420 }}>
      <p style={{ color: "#146c44", fontWeight: 600 }}>Toph</p>
      <h1>We couldn&apos;t load the dashboard.</h1>
      <p style={{ color: "#666" }}>Check the database connection and try again.</p>
      <button onClick={reset} style={{ border: 0, borderRadius: 8, padding: "11px 18px", background: "#000", color: "#fff" }}>Try again</button>
    </section>
  </main>;
}
