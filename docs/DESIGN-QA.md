# Design translation and QA

The Paper duplicate was inspected node-by-node and in both supplied artboard states. The implementation treats **1676 × 955** as the fidelity viewport and adapts below it.

| Reference detail | Implemented value |
|---|---:|
| Outer frame padding / gap | 10 px / 10 px |
| Sidebar | 280 × 935 px, 16 px radius |
| Main column | 1366 × 935 px, 30 px horizontal padding |
| Header | 84 px |
| Metric cards | ~429 × 114 px, 10 px gap, 14 px radius |
| Log panel | 20 px radius |
| Table rows | 59 px |
| Expanded detail | 476 px; 40 px padding and gap |
| Detail columns | 592 px recording / flexible ~594 px map |

Geist is self-hosted. The reference palette is represented directly: `#000`, `#4D4D4D`, `#CCC`, `#E6E6E6`, `#F2F2F2`, `#F8F8F8`, `#003930`, and `#146C44`. The table content, ordering, dates, times, metric values, waveform profile, and Isaac recording summary follow the source design.

## Responsive behavior

- At 1180 px and below, the fixed sidebar becomes an off-canvas navigation drawer.
- At 760 px and below, metric cards scroll horizontally, toolbar chips remain usable without wrapping, and expanded audio/map columns stack.
- The table retains the desktop information hierarchy inside an intentional horizontal scroller.

## Acceptance checklist

- Default state shows four records and no expanded row.
- “View” opens the matching recording without losing URL state.
- Search, sort, range, field, and activity controls update the URL and server result.
- Recording playback advances the waveform.
- Tags survive refresh (Supabase rows in hosted mode; secure cookie in local-demo mode).
- Map preview and modal render at the stored field coordinates.
- Keyboard-accessible labels exist for navigation, search, row selection, dialogs, and form feedback.
- Desktop and mobile Playwright projects pass with no console/page errors.
