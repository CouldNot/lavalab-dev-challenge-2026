"use client";

import { FormEvent, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownUp, AudioLines, CalendarDays, CalendarRange, ChevronDown, ClipboardPenLine, Expand, Filter,
  Menu, Percent, Search, ShieldCheck, Square, X,
} from "lucide-react";
import type { ActivityLog, DashboardSnapshot, ReviewStatus } from "@/lib/types";
import Sidebar from "./Sidebar";
import Waveform from "./Waveform";
import MapDialog from "./MapDialog";
import TagDialog from "./TagDialog";
import ReviewPanel from "./ReviewPanel";
import styles from "./dashboard.module.css";

const MapPanel = dynamic(() => import("./MapPanel"), { ssr: false });

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" }).format(new Date(value));
}
function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }).format(new Date(value));
}

export default function Dashboard({ snapshot }: { snapshot: DashboardSnapshot }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileNav, setMobileNav] = useState(false);
  const [tagLog, setTagLog] = useState<ActivityLog | null>(null);
  const [mapLog, setMapLog] = useState<ActivityLog | null>(null);
  const [query, setQuery] = useState(snapshot.filters.q ?? "");
  const selected = useMemo(() => snapshot.logs.find((log) => log.id === snapshot.filters.log), [snapshot]);

  const update = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.push(`${pathname}?${next.toString()}` as Route, { scroll: false });
  };
  const submitSearch = (event: FormEvent) => { event.preventDefault(); update({ q: query || null }); };

  return (
    <main className={styles.dashboardPage}>
      <Sidebar farmName={snapshot.farmName} role={snapshot.role} mapLogId={snapshot.logs[0]?.id} open={mobileNav} onClose={() => setMobileNav(false)} />
      <section className={styles.mainDash}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button>
          <div className={styles.title}><h1>Dashboard</h1><p>An overview of your farm and employee activity</p></div>
          <form className={styles.search} onSubmit={submitSearch} role="search"><Search size={16} /><input type="search" aria-label="Search employee logs" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />{query ? <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); update({ q: null }); }}><X size={14} /></button> : null}</form>
        </header>

        <section className={styles.metrics} aria-label="Farm summary">
          <article><div className={styles.metricLabel}><CalendarDays size={16} /><span>Today&apos;s Recordings</span></div><div className={styles.metricValue}><strong>{snapshot.metrics.todaysRecordings}</strong><button className={styles.metricReviewLink} onClick={() => update({ status: snapshot.filters.status === "new" ? null : "new" })}>{snapshot.metrics.newRecordings} to review</button></div></article>
          <article><div className={styles.metricLabel}><ClipboardPenLine size={16} /><span>Active Workers</span></div><div className={styles.metricValue}><strong>{snapshot.metrics.activeWorkers}</strong></div></article>
          <article><div className={styles.metricLabel}><Percent size={16} /><span>Response Accuracy</span></div><div className={styles.metricValue}><strong>{snapshot.metrics.responseAccuracy}</strong></div></article>
        </section>

        <section id="employee-logs" className={`${styles.logPanel} ${selected ? styles.logPanelExpanded : ""}`}>
          <header className={styles.panelHeader}>
            <div className={styles.panelTitle}><AudioLines size={16} /><h2>Employee Logs ({snapshot.logs.length})</h2></div>
            <div className={styles.toolbar}>
              <label className={styles.selectChip}><ArrowDownUp size={16} /><span>Sort</span><select aria-label="Sort logs" value={snapshot.filters.sort ?? "date-asc"} onChange={(e) => update({ sort: e.target.value })}><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="employee">Employee A–Z</option><option value="activity">Activity A–Z</option></select><ChevronDown size={14} /></label>
              <label className={styles.selectChip}><CalendarRange size={16} /><span>Show</span><select aria-label="Log range" value={snapshot.filters.range ?? "month"} onChange={(e) => update({ range: e.target.value })}><option value="month">Recent 4 logs</option><option value="all">All logs</option></select><ChevronDown size={14} /></label>
              <details className={styles.filterMenu}>
                <summary><Filter size={16} /> Filter</summary>
                <div className={styles.filterPopover}>
                  <label>Field<select value={snapshot.filters.field ?? ""} onChange={(e) => update({ field: e.target.value || null })}><option value="">All fields</option>{snapshot.fields.map((field) => <option key={field}>{field}</option>)}</select></label>
                  <label>Activity<select value={snapshot.filters.activity ?? ""} onChange={(e) => update({ activity: e.target.value || null })}><option value="">All activities</option>{snapshot.activities.map((activity) => <option key={activity}>{activity}</option>)}</select></label>
                  <label>Review status<select aria-label="Review status" value={snapshot.filters.status ?? ""} onChange={(e) => update({ status: e.target.value || null })}><option value="">All statuses</option><option value="new">Needs review</option><option value="reviewed">Reviewed</option><option value="flagged">Flagged</option></select></label>
                  <button onClick={() => update({ field: null, activity: null, status: null })}>Clear filters</button>
                </div>
              </details>
            </div>
          </header>

          <div className={styles.tableScroller}>
            <div className={styles.table} role="table" aria-label="Employee activity logs">
              <div className={`${styles.tableRow} ${styles.tableHead}`} role="row">
                <div role="columnheader" className={styles.checkCell}><Square size={16} /></div><div role="columnheader">EMPLOYEE</div><div role="columnheader">ACTIVITY</div><div role="columnheader">DATE</div><div role="columnheader">FIELD</div><div role="columnheader">TIME</div><div role="columnheader">REVIEW</div><div role="columnheader"><button>View All</button></div>
              </div>
              {snapshot.logs.length ? snapshot.logs.map((log) => <LogRow key={log.id} log={log} selected={selected?.id === log.id} onView={() => update({ log: selected?.id === log.id ? null : log.id })} onTag={() => setTagLog(log)} onMap={() => setMapLog(log)} />) : <div className={styles.empty}><Search size={22} /><strong>No recordings found</strong><span>Try clearing a filter or using a different search.</span></div>}
            </div>
          </div>
        </section>
      </section>
      {tagLog ? <TagDialog log={tagLog} onClose={() => setTagLog(null)} /> : null}
      {mapLog ? <MapDialog log={mapLog} onClose={() => setMapLog(null)} /> : null}
    </main>
  );
}

const reviewLabels: Record<ReviewStatus, string> = { new: "Needs review", reviewed: "Reviewed", flagged: "Flagged" };

function LogRow({ log, selected, onView, onTag, onMap }: { log: ActivityLog; selected: boolean; onView: () => void; onTag: () => void; onMap: () => void }) {
  return (
    <>
      <div className={`${styles.tableRow} ${selected ? styles.selectedRow : ""}`} role="row">
        <div role="cell" className={styles.checkCell}><button aria-label={`Select ${log.employeeName}`}><Square size={16} /></button></div>
        <div role="cell">{log.employeeName}</div><div role="cell">{log.activityType}</div><div role="cell">{formatDate(log.startedAt)}</div><div role="cell">{log.fieldName}</div><div role="cell">{formatTime(log.startedAt)} – {formatTime(log.endedAt)}</div><div role="cell"><span className={`${styles.reviewBadge} ${styles[`review${log.reviewStatus[0].toUpperCase()}${log.reviewStatus.slice(1)}`]}`}>{log.reviewStatus === "new" ? <ShieldCheck size={13} /> : null}{reviewLabels[log.reviewStatus]}</span></div>
        <div role="cell" className={styles.viewCell}><button onClick={onView}>{selected ? "Close" : "View"}</button></div>
      </div>
      {selected ? (
        <div className={styles.expandedDetail}>
          <div className={styles.recordingColumn}><Waveform log={log} onTag={onTag} /><ReviewPanel key={log.id} log={log} /></div>
          <div className={styles.mapColumn}>
            <div className={styles.mapPreview}><MapPanel latitude={log.latitude} longitude={log.longitude} fieldName={log.fieldName} /></div>
            <button className={styles.expandMap} onClick={onMap}><Expand size={17} /> Expand Map</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
