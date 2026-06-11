# Implementation Plan: Household Visit Report

## Overview

Digitize the bi-weekly Appendix #1 household visit form for HEWs, adding a multi-step wizard, supervisor review queue, risk flagging, and in-app notifications. All data is mock (localStorage for draft persistence). Extends existing Next.js 16 / TypeScript / Tailwind CSS v4 app.

## Tasks

- [x] 1. Add TypeScript types to src/types/index.ts
  - Append VisitStatus, RiskPriority, YesNo, YesNoNA, EarlyStimulationScore, NutritionalStatus, MilestoneStatus, DisabilityCategory, MaternalVisitStatus
  - Append RiskFlag, MaternalVisitSection, ChildVisitSection, VisitReport, Notification interfaces
  - _Requirements: 1, 2, 3, 8, 10_

- [x] 2. Add mock data to src/lib/mockData.ts
  - Append mockVisitReports array (5–8 reports covering all statuses)
  - Append mockNotifications array (sample notifications for all event types)
  - Append helper functions: getVisitReportsForHousehold, getNextVisitNumber, getSubmittedReportsForSupervisor, computeRiskFlags
  - _Requirements: 1.3, 1.4, 6.2, 7.1, 8, 9.1_

- [x] 3. Create RiskFlagAlert UI component at src/components/ui/RiskFlagAlert.tsx
  - Renders prominent banner for high-priority (red) and medium-priority (yellow) flags
  - Props: flags: RiskFlag[]
  - _Requirements: 8.1–8.7_

- [x] 4. Create VisitHistoryTable component at src/components/visits/VisitHistoryTable.tsx
  - Reusable table showing visit date, number, status badge, HEW name, risk flags
  - Props: reports: VisitReport[], onOpen: (id: string) => void
  - _Requirements: 9.1, 9.2_

- [x] 5. Update Sidebar to add Visits and Review Queue nav items
  - Add Visits (ClipboardList icon) → /visits, visible to health_worker
  - Add Review Queue (CheckSquare icon) → /supervisor/queue, visible to supervisor and admin
  - _Requirements: 6, 7_

- [x] 6. Update TopBar to use mockNotifications for the notification bell
  - Replace hardcoded notifications with mockNotifications filtered to currentUser
  - Show badge count driven by unread count
  - Add "New Visit Report" → /visits/new to the quick-add dropdown
  - _Requirements: 10_

- [x] 7. Create /visits page at src/app/(app)/visits/page.tsx
  - HEW visit report list with status filter pills (All, Draft, Submitted, Approved, Returned)
  - Search by household name or registration number
  - Link to /visits/new and /visits/[id]
  - _Requirements: 6.5, 9.1, 9.2_

- [-] 8. Create /visits/new page at src/app/(app)/visits/new/page.tsx
  - 4-step wizard: Household Info, Maternal Section, Child Sections, Review & Submit
  - Step 1: pre-populated household fields + PSNP/CBHI/TDS/vulnerability
  - Step 2: maternal indicators with conditional fields per status (P/PN/L), postnatal reclassification banner
  - Step 3: child indicators, stimulation scores, milestone assessment, disability categories
  - Step 4: read-only summary with RiskFlagAlert, submit or save draft
  - localStorage draft persistence under key draft_visit_<householdId>
  - Full validation before submission (Req 4)
  - _Requirements: 1, 2, 3, 4, 5, 6, 8_

- [ ] 9. Create /visits/[id] page at src/app/(app)/visits/[id]/page.tsx
  - Read-only view of all sections with RiskFlagAlert
  - Supervisor action buttons: Approve / Return with comment (if status === submitted)
  - HEW sees status and supervisor comment if returned
  - _Requirements: 6.4, 7.2, 7.3, 7.4, 7.5, 9.3_

- [ ] 10. Create /supervisor/queue page at src/app/(app)/supervisor/queue/page.tsx
  - List submitted reports sorted by submission date ascending
  - Columns: visit date, household, HEW name, risk flags, status
  - Link to /visits/[id] for review
  - _Requirements: 7.1_

- [ ] 11. Update households page to show Visit History tab
  - Add Visit History tab to the household detail modal
  - Display VisitHistoryTable for the selected household
  - Include "Start New Visit" button linking to /visits/new?householdId=X
  - _Requirements: 9.1, 9.2, 1.1_

- [ ] 12. Run diagnostics on all new files and fix any errors
  - Check all new and modified files with getDiagnostics
  - Fix all TypeScript and lint errors
  - _Requirements: all_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- No new npm packages — use only Next.js 16, React 19, TypeScript, Tailwind CSS v4, lucide-react
- localStorage key pattern: `draft_visit_<householdId>`
- Follow existing CSS classes: section-card, btn-primary, btn-outline, btn-secondary, form-input, form-label
