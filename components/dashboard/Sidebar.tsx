"use client";

import {
  ArrowLeftRight, AudioLines, BookCheck, CalendarDays, ChartLine, ChartPie,
  ChevronDown, CircleUserRound, Files, Handshake, Inbox, LogOut, Mail,
  Map, Settings, Users,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import styles from "./dashboard.module.css";

const groups = [
  { label: "OVERVIEW", items: [[ChartLine, "Dashboard"], [AudioLines, "Activity Logs"], [Map, "Map"]] },
  { label: "COMPLIANCE", items: [[BookCheck, "Audit Manager"], [Files, "Reports"], [CalendarDays, "Schedule"]] },
  { label: "TEAM MANAGEMENT", items: [[Users, "Employees"], [ChartPie, "Performance"], [Mail, "Messages"]] },
  { label: "OTHER", items: [[Settings, "Settings"], [Handshake, "Support"]] },
] as const;

export default function Sidebar({ farmName, role, mapLogId, open, onClose }: { farmName: string; role: string; mapLogId?: string; open: boolean; onClose: () => void }) {
  return (
    <>
      {open ? <button aria-label="Close navigation" className={styles.backdrop} onClick={onClose} /> : null}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <header className={styles.account}>
          <div className={styles.avatar}><CircleUserRound size={25} strokeWidth={1.25} /></div>
          <div><strong>{farmName}</strong><span>{role === "owner" ? "Admin" : role}</span></div>
          <button aria-label="Open inbox" className={styles.iconButton}><Inbox size={16} /></button>
        </header>
        <nav className={styles.nav} aria-label="Main navigation">
          {groups.map((group) => (
            <section key={group.label} className={styles.navGroup}>
              <h2>{group.label}</h2>
              {group.items.map(([Icon, label]) => {
                const active = label === "Dashboard";
                const href = label === "Activity Logs" ? "#employee-logs" : label === "Map" && mapLogId ? `/dashboard?log=${mapLogId}#employee-logs` : undefined;
                return href ? (
                  <a key={label} href={href} className={`${styles.navItem} ${active ? styles.navActive : ""}`}>
                    <Icon size={16} strokeWidth={1.55} /><span>{label}</span>{active ? <em>1</em> : null}
                  </a>
                ) : (
                  <button key={label} className={`${styles.navItem} ${active ? styles.navActive : ""}`} aria-disabled="true" title="Dashboard demo">
                    <Icon size={16} strokeWidth={1.55} /><span>{label}</span>{active ? <em>1</em> : null}
                  </button>
                );
              })}
            </section>
          ))}
        </nav>
        <div className={styles.navFooter}>
          <a href="/login" className={styles.navItem}><ArrowLeftRight size={16} /><span>Switch User</span></a>
          <form action={signOut}><button className={styles.navItem}><LogOut size={16} /><span>Log Out</span></button></form>
        </div>
        <button className={styles.collapse} onClick={onClose} aria-label="Collapse navigation"><ChevronDown size={16} /></button>
      </aside>
    </>
  );
}
