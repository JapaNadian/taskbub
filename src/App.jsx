import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { storage } from './storage';

// ─────────────────────────────────────────────
// FONT INJECTION
// ─────────────────────────────────────────────
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
  input[type=range] { accent-color: currentColor; }
  @keyframes bellykick {
    0%   { transform: scale(1);   opacity: 0.55; }
    50%  { transform: scale(2.1); opacity: 0.85; }
    100% { transform: scale(1);   opacity: 0.55; }
  }
  .belly-kick { animation: bellykick 0.32s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @media (max-width: 768px) {
    .tb-topbar { flex-wrap: wrap !important; height: auto !important; min-height: 48px !important; padding: 6px 8px !important; }
    .tb-canvas-tabs { display: none !important; }
    .tb-detail-panel { width: 100vw !important; border-radius: 16px 16px 0 0 !important; top: 20vh !important; }
    .tb-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
    .tb-topbar-search input { width: 140px !important; }
  }
`;
document.head.appendChild(styleTag);

// ─────────────────────────────────────────────
// TEST DATA (from TaskBub_test_file CSV)
// ─────────────────────────────────────────────

const SEED_TASKS = [
  {
    "id": "csv_1000",
    "owner": "Mary",
    "title": "SDFC - Allocation for FD Tickets",
    "nextAction": "",
    "additionalInfo": "Team discussion on FD allocation and whether we want to implement. If so, this will result in another dev project internally.",
    "entryDate": "2026-01-12",
    "type": "Internal To Do",
    "project": "Internal - Team Discussion",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-15",
    "projectedEndDate": "2026-01-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "Team discussion on FD allocation and whether we want to implement. If so, this will result in another dev project internally.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 80
  },
  {
    "id": "csv_1001",
    "owner": "Mary",
    "title": "Chris/BRD Progress Request",
    "nextAction": "",
    "additionalInfo": "Send Peter note about Chris (Gina to provide list of BRDs we are not making progress on (pushed to backlog)) along with screenshots to prove we\ufffdve reached out",
    "entryDate": "2026-01-09",
    "type": "Internal To Do",
    "project": "One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-09",
    "projectedEndDate": "2026-01-09",
    "actualStartDate": "2026-01-09",
    "actualEndDate": "2026-01-09",
    "comment": "Send Peter note about Chris (Gina to provide list of BRDs we are not making progress on (pushed to backlog)) along with screenshots to prove we\ufffdve reached out",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 270
  },
  {
    "id": "csv_1002",
    "owner": "Mary",
    "title": "Migrations - Sign Date vs. Book Date",
    "nextAction": "",
    "additionalInfo": "Grab migrations signed earlier in the year and share with Kyle\ufffd",
    "entryDate": "2026-01-09",
    "type": "General Support & Requests",
    "project": "One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Finance",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-09",
    "projectedEndDate": "2026-01-09",
    "actualStartDate": "2026-01-09",
    "actualEndDate": "2026-01-09",
    "comment": "Resulted in discovery of more opportunities signed in one month but booked in another. Need to use this focus on enhancing the data discrepancy channel. We should be the first line of defense and catching these but data discrepancy is a great back-up.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 460
  },
  {
    "id": "csv_1003",
    "owner": "Dan",
    "title": "Master - Performance.xlsx- Snapsot",
    "nextAction": "Mary to review snapshot pages",
    "additionalInfo": "Snapshot",
    "entryDate": "2026-01-12",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Master Workbooks",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "20",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-12",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-12",
    "actualEndDate": "",
    "comment": "Need Bookings \ufffd Clawbacks = Actual Bookings  ??",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 80
  },
  {
    "id": "csv_1004",
    "owner": "Mary",
    "title": "Tyler Review  - via Slack",
    "nextAction": "PRIORITY",
    "additionalInfo": "Review file Tyler sent over via slack",
    "entryDate": "2026-01-09",
    "type": "General Support & Requests",
    "project": "One Offs",
    "status": "Not Started",
    "statusReason": "Not Started - Prio",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-01-09",
    "projectedEndDate": "2026-01-12",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "Delayed due to other items getting in the way!",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 650
  },
  {
    "id": "csv_1005",
    "owner": "Mary",
    "title": "ACH / Credit Card Reporting",
    "nextAction": "",
    "additionalInfo": "Need a report from docusign to view the frequency in which we have ACH vs. Credit Card",
    "entryDate": "2026-01-12",
    "type": "General Support & Requests",
    "project": "One Offs",
    "status": "Cancelled",
    "statusReason": "Cancelled",
    "priority": "Medium",
    "points": "5",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-12",
    "projectedEndDate": "2026-01-12",
    "actualStartDate": "2026-01-12",
    "actualEndDate": "2026-01-12",
    "comment": "CANCELLED - Data is only retrievable in Stripe Payment Portal. Need to add this to our internal docusign reporting. Going to update there and provide Peter the full breakout of voids, payment methods, etc.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 840
  },
  {
    "id": "csv_1007",
    "owner": "Dan",
    "title": "Consolidated Forecast - 2026.v1",
    "nextAction": "Simple formulas for Rep Names currently in pod",
    "additionalInfo": "Rewire backends for population master file",
    "entryDate": "2026-01-12",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Master Workbooks",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "14",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-01",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-01",
    "actualEndDate": "2026-01-16",
    "comment": "Most rewireing is done. Pete gave ok to drop pipeline forecast section\nRemoved SBUopps by accident. Re-added and re-wired everything.\nNext : Automize names, based on the population file.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 270
  },
  {
    "id": "csv_1008",
    "owner": "Mary",
    "title": "Chelsie - Opp Upload Request",
    "nextAction": "",
    "additionalInfo": "Run through Chelsie's first upload request - help make adjustments for easier uploads for the SFDC team",
    "entryDate": "2026-01-12",
    "type": "General Support & Requests",
    "project": "One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Marketing",
    "requesterName": "Chelsie Hodgkiss",
    "projectedStartDate": "2026-01-12",
    "projectedEndDate": "2026-01-13",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-13",
    "comment": "Upload for Chelsie - straight forward but will provide insights for future requests",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 1030
  },
  {
    "id": "csv_1009",
    "owner": "Mary",
    "title": "File Repository.xlsx",
    "nextAction": "PRIORITY",
    "additionalInfo": "File that contributes to our excel ecosystem. To be updated as we build our ecosystem out",
    "entryDate": "2026-01-09",
    "type": "General Projects",
    "project": "G2026 - Master Workbooks",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "10",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-09",
    "projectedEndDate": "2026-12-31",
    "actualStartDate": "2026-01-09",
    "actualEndDate": "",
    "comment": "File respository - please update as you build out new workbooks are update older ones",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 1220
  },
  {
    "id": "csv_1010",
    "owner": "Mary",
    "title": "Dealhub 2026  - Set Goals",
    "nextAction": "",
    "additionalInfo": "Tweak, enhance and set plan for tackling this project",
    "entryDate": "2026-01-12",
    "type": "General Projects",
    "project": "G2026 - Dealhub Fine Tuning",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "25",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-01",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 1410
  },
  {
    "id": "csv_1011",
    "owner": "Mary",
    "title": "Data Discrepancy - Massive Rehaul",
    "nextAction": "",
    "additionalInfo": "Tweak, enhance and set plan for tackling this project",
    "entryDate": "2026-01-12",
    "type": "General Projects",
    "project": "G2026 - Data Discrepancy Overhaul",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "25",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 1600
  },
  {
    "id": "csv_1012",
    "owner": "Mary",
    "title": "Master Pricing - Massive Rehaul",
    "nextAction": "PRIORITY",
    "additionalInfo": "Enhance and move out of Google",
    "entryDate": "2026-01-12",
    "type": "General Projects",
    "project": "G2026 - Master Workbooks",
    "status": "Not Started",
    "statusReason": "Not Started - Prio",
    "priority": "Medium",
    "points": "25",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-01",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 1790
  },
  {
    "id": "csv_1013",
    "owner": "Mary",
    "title": "Master Sales Field - Massive Rehaul",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-01-12",
    "type": "General Projects",
    "project": "G2026 - Master Workbooks",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "25",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 1980
  },
  {
    "id": "csv_1014",
    "owner": "Mary",
    "title": "Sprint Capacity - File Creation",
    "nextAction": "",
    "additionalInfo": "Need to finalize before our final sprint.",
    "entryDate": "2026-01-12",
    "type": "General Projects",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "12",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-05",
    "projectedEndDate": "2026-01-09",
    "actualStartDate": "2026-01-05",
    "actualEndDate": "2026-01-13",
    "comment": "There is still a lot to do here but phase 1 complete. Create a line for phase 2",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 2170
  },
  {
    "id": "csv_1015",
    "owner": "Mary",
    "title": "Finalize New BRD Format",
    "nextAction": "Launched",
    "additionalInfo": "Required for easier management of BRDs. Get agreement on the sign-off function.",
    "entryDate": "2026-01-12",
    "type": "General Projects",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "6",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-05",
    "projectedEndDate": "2026-01-09",
    "actualStartDate": "2026-01-09",
    "actualEndDate": "2026-01-29",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 2360
  },
  {
    "id": "csv_1016",
    "owner": "Mary",
    "title": "Quota Master - Finalize",
    "nextAction": "PRIORITY",
    "additionalInfo": "Waiting for final numbers",
    "entryDate": "2026-01-12",
    "type": "General Projects",
    "project": "G2026 - Master Workbooks",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "10",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2025-12-01",
    "projectedEndDate": "2026-01-09",
    "actualStartDate": "2025-12-01",
    "actualEndDate": "2026-01-20",
    "comment": "Completed. Quota is finalized.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 2550
  },
  {
    "id": "csv_1017",
    "owner": "Mary",
    "title": "Submit Tech Users - Non Retains",
    "nextAction": "",
    "additionalInfo": "Need to submit to free up licenses",
    "entryDate": "2026-01-12",
    "type": "Tech Stack Maintenance",
    "project": "TS - SFDC",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "5",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-05",
    "projectedEndDate": "2026-01-09",
    "actualStartDate": "2026-01-05",
    "actualEndDate": "2026-01-14",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 2740
  },
  {
    "id": "csv_1018",
    "owner": "Mary",
    "title": "License & Rate Update - XBU",
    "nextAction": "",
    "additionalInfo": "Update lifesaver pricing (see slack) and Quilt/Music Flat Rates",
    "entryDate": "2026-01-09",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-01-09",
    "projectedEndDate": "2026-01-12",
    "actualStartDate": "2026-01-09",
    "actualEndDate": "2026-01-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 2930
  },
  {
    "id": "csv_1019",
    "owner": "Mary",
    "title": "Docusign  - Envelope Monthly Review",
    "nextAction": "",
    "additionalInfo": "Update Docusign Monthly Envelope Review - see 1006 for additional add in",
    "entryDate": "2026-01-09",
    "type": "Tech Stack Maintenance",
    "project": "TS - Docusign",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "5",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-09",
    "projectedEndDate": "2026-01-12",
    "actualStartDate": "2026-01-09",
    "actualEndDate": "2026-01-12",
    "comment": "Maintain and train Dan/Nick to maintain go forward.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 3120
  },
  {
    "id": "csv_1020",
    "owner": "Mary",
    "title": "Update BRD Form to include Calendly link to Gina",
    "nextAction": "Completed - went with Microsoft Bookings",
    "additionalInfo": "Get Calendly Link for Gina - Create an event. Get Gina to connect her outlook calendar",
    "entryDate": "2026-01-12",
    "type": "General Projects",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-05",
    "projectedEndDate": "2026-01-05",
    "actualStartDate": "2026-01-26",
    "actualEndDate": "2026-02-16",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 3310
  },
  {
    "id": "csv_1021",
    "owner": "Nick",
    "title": "Payroll Process - December",
    "nextAction": "",
    "additionalInfo": "Audit \ufffd SPIF/Adj; Preview Sheet; Inquiries; Add Estimate to Pop File; Clawbacks; CC Team Percentages; Nicole December SPIF; Final Sheet to Drew; Add to Earnings File",
    "entryDate": "2026-01-09",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "24",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "",
    "projectedStartDate": "2026-01-05",
    "projectedEndDate": "2026-01-15",
    "actualStartDate": "2026-01-05",
    "actualEndDate": "2026-01-20",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 80
  },
  {
    "id": "csv_1022",
    "owner": "Mary",
    "title": "Review BRD Opp Page Layout",
    "nextAction": "Sent Lisa some initial feedback",
    "additionalInfo": "This is only when you get time or feel like doing it...while I was working on a BRD for the Opportunity, I added in the condensed version of the Opportunity page when creating a new one.  (Only in XBU full sandbox right now) https://app.shortcut.com/quiltiqteam/story/32923/sfdc-brd-clean-up-opportunity-page-when-creating-new",
    "entryDate": "2026-01-13",
    "type": "General Support & Requests",
    "project": "TS - SFDC",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "Medium",
    "points": "5",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Lisa Haigy",
    "projectedStartDate": "2026-01-15",
    "projectedEndDate": "2026-01-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "Try to review earlier if possible to let Lisa continue work",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 3500
  },
  {
    "id": "csv_1023",
    "owner": "Nick",
    "title": "Percentages Needed for Customer Care Comp",
    "nextAction": "",
    "additionalInfo": "Need numbers for CC from Chris. Followed up twice last week. Will follow up again today.",
    "entryDate": "2026-01-13",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "",
    "projectedStartDate": "2026-01-06",
    "projectedEndDate": "2026-01-15",
    "actualStartDate": "2026-01-06",
    "actualEndDate": "2026-01-15",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 270
  },
  {
    "id": "csv_1024",
    "owner": "Nick",
    "title": "Earnings File 2026",
    "nextAction": "Create Leaders Earnings file and make updated/ additions to the Master and BDR earnings files.",
    "additionalInfo": "Create seperate earnings files for 2026.",
    "entryDate": "2026-01-13",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Planning H2 2026",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "14",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-06",
    "projectedEndDate": "2026-02-13",
    "actualStartDate": "",
    "actualEndDate": "2026-02-13",
    "comment": "Starting with building master CIQ. Going through and making sure we have everything from each payroll sheet. x\nCreate earnings 2026 tab, and update all to 2026. x\nUpdate master pop file to house the leaders as well.\n\nHave an idea on how to reference the CIQ data master and keep what we want out. Need to run by Mary to see what she thinks.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 460
  },
  {
    "id": "csv_1025",
    "owner": "Nick",
    "title": "CIQ Clawback automation",
    "nextAction": "",
    "additionalInfo": "Corrected automations in AE and eAE plans. Need to build in TL",
    "entryDate": "2026-01-13",
    "type": "Tech Stack Maintenance",
    "project": "G2025 - Planning H1 2026",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "6",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "",
    "projectedStartDate": "2026-01-12",
    "projectedEndDate": "2026-01-12",
    "actualStartDate": "2026-01-12",
    "actualEndDate": "2026-01-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 650
  },
  {
    "id": "csv_1026",
    "owner": "Nick",
    "title": "EOY True up for Merchant Services",
    "nextAction": "",
    "additionalInfo": "What we have paid them vs OTV for H2",
    "entryDate": "2026-01-13",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-13",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 840
  },
  {
    "id": "csv_1027",
    "owner": "Mary",
    "title": "Follow up with Lisa on the OWN Back Up Services",
    "nextAction": "",
    "additionalInfo": "Follow up with Lisa to ensure she's running our back up for our systems in SFDC",
    "entryDate": "2026-01-13",
    "type": "General Projects",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "1",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-13",
    "comment": "Chat with Lisa on this one and confirm we get this running. Cort responded in agreement, Lisa needs to follow up she's running the process and the cadence in which we will run this go forward. Lisa has this launched and let leadership know.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 3690
  },
  {
    "id": "csv_1028",
    "owner": "Dan",
    "title": "Master  - Pipeline",
    "nextAction": "Start it",
    "additionalInfo": "Not started",
    "entryDate": "2026-01-12",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Master Workbooks",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "21",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "Up to date information on deals and where they are sitting and for how long \nMonitor \ufffddead\ufffd deals not being closed lost \nZap potential",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 460
  },
  {
    "id": "csv_1029",
    "owner": "Dan",
    "title": "Master - Forecast Trend",
    "nextAction": "Start it",
    "additionalInfo": "Not started",
    "entryDate": "2026-01-12",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Master Workbooks",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "22",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 650
  },
  {
    "id": "csv_1030",
    "owner": "Dan",
    "title": "Lead Adherence  - Make Scenario",
    "nextAction": "Zap was submitted 1/16",
    "additionalInfo": "Zap logic was submitted. Can start working",
    "entryDate": "2026-01-12",
    "type": "Workbook/Document Maintenance",
    "project": "TS - Zapier",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "10",
    "requester": "",
    "department": "Marketing",
    "requesterName": "Adrianna Jacobus",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 840
  },
  {
    "id": "csv_1031",
    "owner": "Dan",
    "title": "Lead Allocation 4.0",
    "nextAction": "Close lead-alloction-v4 channel",
    "additionalInfo": "Initial launch + test phase is done. Once channel is closed arechive old versions",
    "entryDate": "2026-01-12",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - LA4.0 Maintenance & Delivery",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "25",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Fleming",
    "projectedStartDate": "2025-12-08",
    "projectedEndDate": "2025-01-22",
    "actualStartDate": "2025-12-08",
    "actualEndDate": "2025-01-22",
    "comment": "Ready to close",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 1030
  },
  {
    "id": "csv_1032",
    "owner": "Dan",
    "title": "Lead Checker t95",
    "nextAction": "done",
    "additionalInfo": "New + Mig (non-rec rev) was concerning Performance. Not Lead Allocation",
    "entryDate": "2026-01-12",
    "type": "Workbook/Document Maintenance",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "12",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-01-08",
    "projectedEndDate": "2026-01-22",
    "actualStartDate": "2026-01-08",
    "actualEndDate": "2026-01-22",
    "comment": "Need Bookings \ufffd Clawbacks = Actual Bookings  ??",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 1220
  },
  {
    "id": "csv_1033",
    "owner": "Mary",
    "title": "Steve Smeltz Q4 Payout",
    "nextAction": "",
    "additionalInfo": "Pay Steve",
    "entryDate": "2026-01-13",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "2",
    "requester": "",
    "department": "Finance",
    "requesterName": "Candace Gilman",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-13",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 3880
  },
  {
    "id": "csv_1034",
    "owner": "Mary",
    "title": "Find time to discuss Steve Smeltz H1 Plan",
    "nextAction": "",
    "additionalInfo": "Schedule call with CB, Spencer, Peter",
    "entryDate": "2026-01-13",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-13",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 4070
  },
  {
    "id": "csv_1035",
    "owner": "Nick",
    "title": "Review Nicole Beetz Sheet/Touch base to finalize her payout.",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-01-13",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-13",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 1030
  },
  {
    "id": "csv_1036",
    "owner": "Mary",
    "title": "Bookings Rules - Finalize",
    "nextAction": "Reviewed  - want to review this monthly go forward to ensure this is sound.",
    "additionalInfo": "Finalize - reach out to Dan/Nick if there are any questions",
    "entryDate": "2026-01-13",
    "type": "General Projects",
    "project": "G2025 - Planning H1 2026",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "10",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-21",
    "comment": "Adding frequent reviews to ensure everything is good.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 4260
  },
  {
    "id": "csv_1037",
    "owner": "Nick",
    "title": "CJ and oBDRs close date audit",
    "nextAction": "",
    "additionalInfo": "CJ had 4 deals with close dates in 2026 throwing off the 2025 CIQ plan. Fixed 3 but one is closed won in 2026 so will need to adjust. Going to audit the rest of the oBDRs as well.",
    "entryDate": "2026-01-13",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-13",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 1220
  },
  {
    "id": "csv_1038",
    "owner": "Mary",
    "title": "Performance Reviews",
    "nextAction": "PRIORITY",
    "additionalInfo": "Team Review",
    "entryDate": "2026-01-13",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "10",
    "requester": "",
    "department": "Personal Request",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-26",
    "actualStartDate": "2026-01-27",
    "actualEndDate": "2026-01-29",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 4450
  },
  {
    "id": "csv_1039",
    "owner": "Mary",
    "title": "Dan Slack Review Request",
    "nextAction": "",
    "additionalInfo": "Refer to Slack message",
    "entryDate": "2026-01-13",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Dan Hall",
    "projectedStartDate": "2026-01-14",
    "projectedEndDate": "2026-01-14",
    "actualStartDate": "2026-01-15",
    "actualEndDate": "2026-01-15",
    "comment": "Messaged reviewed",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 4640
  },
  {
    "id": "csv_1040",
    "owner": "Mary",
    "title": "Slack Automated Message for Sprint Testing",
    "nextAction": "Different from automation but a general reminder of deadlines - maybe discuss with Kyle. Could potentially do it via slack myself.",
    "additionalInfo": "Figure out if a work flow is going to be enough or submit a case for Dan to investigate if we can have a set messaging schedule of warnings vs. deadlines.",
    "entryDate": "2026-01-13",
    "type": "Internal To Do",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "5",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-14",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 4830
  },
  {
    "id": "csv_1041",
    "owner": "Mary",
    "title": "Cort's message about crossing training",
    "nextAction": "",
    "additionalInfo": "Bring up to Peter - how do we cross train on Natasha's process? When do we start? Can we get a shared SOP?",
    "entryDate": "2026-01-13",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "5",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Cort Ouzts",
    "projectedStartDate": "2026-01-14",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "2026-01-16",
    "comment": "If we go with this, this cross training will be more points and need invidual rows for all three of us (m/n/d). Discussed with Peter - holding on Cort's assessment.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 5020
  },
  {
    "id": "csv_1042",
    "owner": "Mary",
    "title": "Resend Quilt Contract",
    "nextAction": "Add task to send follow up contract mid-February",
    "additionalInfo": "Break out into 2 and 12 per Finance Request",
    "entryDate": "2026-01-13",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "5",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-14",
    "projectedEndDate": "2026-01-14",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "2026-01-16",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 5210
  },
  {
    "id": "csv_1043",
    "owner": "Mary",
    "title": "Chat with Dan on enhancing FD support file zap.",
    "nextAction": "Mary to submit a t4 and Dan to work when he has time",
    "additionalInfo": "Ask dan, submit zap enhancement request.",
    "entryDate": "2026-01-13",
    "type": "Internal To Do",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-14",
    "projectedEndDate": "2026-01-23",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-20",
    "comment": "Mary to coordinate with Kyle to submit ticket with all the fields that need to be added (i think there are three)",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 5400
  },
  {
    "id": "csv_1044",
    "owner": "Mary",
    "title": "Regina Email - Jenn's payouts",
    "nextAction": "",
    "additionalInfo": "Review Regina's email and get payout for Jenn for the last three months",
    "entryDate": "2026-01-13",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Finance",
    "requesterName": "Helm (Contractor)",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-14",
    "actualStartDate": "2026-01-15",
    "actualEndDate": "2026-01-15",
    "comment": "Sent over to Regina",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 5590
  },
  {
    "id": "csv_1045",
    "owner": "Mary",
    "title": "Respond to Steve Smeltz's message about commission",
    "nextAction": "",
    "additionalInfo": "Slack Message (question on commission)",
    "entryDate": "2026-01-13",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Steve Smeltz",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-14",
    "actualStartDate": "2026-01-15",
    "actualEndDate": "2026-01-15",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 5780
  },
  {
    "id": "csv_1046",
    "owner": "Mary",
    "title": "Finalize amBDR Quota",
    "nextAction": "",
    "additionalInfo": "Finalize amBDR quotas and present Mike any discrepancies",
    "entryDate": "2026-01-14",
    "type": "General Projects",
    "project": "G2025 - Planning H1 2026",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "8",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-14",
    "projectedEndDate": "2026-01-14",
    "actualStartDate": "2026-01-14",
    "actualEndDate": "2026-01-15",
    "comment": "Finalized with Mike - need to note that we need to discuss Vo's plan and get those components settled. 60/20/10/10",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 5970
  },
  {
    "id": "csv_1047",
    "owner": "Mary",
    "title": "Commission Triage - Update with new quotas and numbers.",
    "nextAction": "Aligned with updated numbers. Check in with Nick EOD Thursday. Assist where possible",
    "additionalInfo": "Update all written plans assigned in the triage sheet. Align with Nick to ensure written plans + CIQ + planning are aligned for ALL plans",
    "entryDate": "2026-01-14",
    "type": "General Projects",
    "project": "G2025 - Planning H1 2026",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "20",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Quilt",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-23",
    "actualStartDate": "2026-01-01",
    "actualEndDate": "2026-01-21",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 6160
  },
  {
    "id": "csv_1048",
    "owner": "Mary",
    "title": "Commission Triage - Send out written plans for signature",
    "nextAction": "PRIORITY",
    "additionalInfo": "Send out all written plans by Friday EOD - Expansion delayed until early next week if required",
    "entryDate": "2026-01-14",
    "type": "General Projects",
    "project": "G2025 - Planning H1 2026",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "20",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Quilt",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-23",
    "actualStartDate": "2026-01-23",
    "actualEndDate": "2026-01-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 6350
  },
  {
    "id": "csv_1049",
    "owner": "Mary",
    "title": "Payments Clawback Review",
    "nextAction": "Reviewed  - Sending over to Peter. Might need to schedule a walkthrough (have Nick schedule)",
    "additionalInfo": "Need to finalize by EOW - review and present findings",
    "entryDate": "2026-01-14",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "10",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-01",
    "projectedEndDate": "2026-01-09",
    "actualStartDate": "2026-01-01",
    "actualEndDate": "2026-01-16",
    "comment": "Sharing findings with Peter. Looks small and not worth our time to chase.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 6540
  },
  {
    "id": "csv_1050",
    "owner": "Mary",
    "title": "Merchant Services - Finalize payout w/ Nick",
    "nextAction": "",
    "additionalInfo": "Need to finalize by 1/14/2026 to get Nick to send over to Chris",
    "entryDate": "2026-01-14",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "5",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-01-14",
    "projectedEndDate": "2026-01-14",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 6730
  },
  {
    "id": "csv_1051",
    "owner": "Mary",
    "title": "Clean out inbox.",
    "nextAction": "",
    "additionalInfo": "Too much unread. Disaster.",
    "entryDate": "2026-01-14",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Low",
    "points": "1",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-15",
    "projectedEndDate": "2026-01-15",
    "actualStartDate": "2026-01-15",
    "actualEndDate": "2026-01-15",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 6920
  },
  {
    "id": "csv_1052",
    "owner": "Nick",
    "title": "Send analysis to Chris, build in adjustment worksheet and summary for merchant services, and add adjustments to CIQ",
    "nextAction": "",
    "additionalInfo": "Analysis and send complete, but realizing merchant services has no adjustments in their plan. need to build before adding.",
    "entryDate": "2026-01-14",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "5",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-13",
    "projectedEndDate": "2026-01-14",
    "actualStartDate": "2026-01-13",
    "actualEndDate": "2026-01-14",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 1410
  },
  {
    "id": "csv_1053",
    "owner": "Nick",
    "title": "COO demos attended adjustments",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-01-14",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Fleming",
    "projectedStartDate": "2026-01-14",
    "projectedEndDate": "2026-01-14",
    "actualStartDate": "2026-01-14",
    "actualEndDate": "2026-01-14",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 1600
  },
  {
    "id": "csv_1054",
    "owner": "Mary",
    "title": "COO Reporting Dashboard",
    "nextAction": "Discussed with Nick. Gave instruction on next steps. See update Tuesday.",
    "additionalInfo": "Dashboard  - Bandwidth - when do we need by? Discuss with Peter. Potential of calendar availability updates for this if it's a large amount. (Discuss with Nick on Friday 1/16)",
    "entryDate": "2026-01-14",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "5",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "2026-01-16",
    "comment": "Not a major but we should be making efforts on this\nSummary data by month by ae by industry by brand of how many of these are happening MoM. Dropped points due it being related to a discussion.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 7110
  },
  {
    "id": "csv_1055",
    "owner": "Mary",
    "title": "Work with Kyle to see if we can create automation around bookings for demos for the SFDC team",
    "nextAction": "Have discussion with the broader team on what we could automate that would make a difference.",
    "additionalInfo": "Internal Note to speak to Kyle to see if we can automate an auto prompt for a requester to either 1) schedule a demo to review OR 2) schedule a shared UAT session with the admin or 3) forgo scheduling anything and will sign off on their own.",
    "entryDate": "2026-01-15",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-20",
    "projectedEndDate": "2026-01-20",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-20",
    "comment": "Need to high level discuss with the SFDC team  - automation might be good but potential overkill.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 7300
  },
  {
    "id": "csv_1056",
    "owner": "Mary",
    "title": "Add Free Pinpad to Open box bundle",
    "nextAction": "Added free pinpad to refurb bundles  -  monitor with AEs. Have asked Tyler to share with the SBU side.",
    "additionalInfo": "Add free pinpad to the open box bundles",
    "entryDate": "2026-01-15",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "2",
    "requester": "",
    "department": "Fulfillment",
    "requesterName": "Duane Brennan",
    "projectedStartDate": "2026-01-15",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "2026-01-16",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 7490
  },
  {
    "id": "csv_1057",
    "owner": "Mary",
    "title": "Speak to Dan about scheduling a call with Peter on the t95 and Mary to assist Dan with Tyler's message in the t95.",
    "nextAction": "Dan to schedule meeting with Peter to chat about the t95.",
    "additionalInfo": "Schedule time with Peter to walkthrough report and channel. Discuss Tyler's message in the t95 channel as well.",
    "entryDate": "2026-01-15",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "Discussed with Dan",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 7680
  },
  {
    "id": "csv_1058",
    "owner": "Nick",
    "title": "Mike Fleming COO Adjustment Questions and research",
    "nextAction": "",
    "additionalInfo": "Mike asking to confirm the COO SPIFs added.",
    "entryDate": "2026-01-15",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Fleming",
    "projectedStartDate": "2026-01-15",
    "projectedEndDate": "2026-01-15",
    "actualStartDate": "2026-01-15",
    "actualEndDate": "2026-01-15",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 1790
  },
  {
    "id": "csv_1059",
    "owner": "Mary",
    "title": "Share opp prods tempate w/ Silas",
    "nextAction": "Shared  - Asked Silas to make a copy of our template and I'll assist with adding information where required.",
    "additionalInfo": "Share template with Silas and assist with any questions",
    "entryDate": "2026-01-15",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "2026-01-16",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 7870
  },
  {
    "id": "csv_1060",
    "owner": "Mary",
    "title": "Refer back to Biju's message on Accelerated Cash Flow as Service",
    "nextAction": "",
    "additionalInfo": "Slack message",
    "entryDate": "2026-01-15",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-15",
    "actualEndDate": "2026-01-15",
    "comment": "Have marching orders  - removing managed chargeback from DH quotes/invoices. Discuss the removing data for tech debt purposes.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 8060
  },
  {
    "id": "csv_1061",
    "owner": "Mary",
    "title": "Sprint Capacity - File Enhancement",
    "nextAction": "PRIORITIZE - seeing a slight discrepancy in estimate numbers",
    "additionalInfo": "Add a few additional reporting points",
    "entryDate": "2026-01-15",
    "type": "General Projects",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "7",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-01",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-01",
    "actualEndDate": "2026-01-29",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 8250
  },
  {
    "id": "csv_1062",
    "owner": "Mary",
    "title": "Population (Update Vo and ambdrs to new otvs)",
    "nextAction": "Updated OTVs for all users. Have updated pop 25 referenced in the planning 2026 file.",
    "additionalInfo": "Update OTVs for Vo (45k)",
    "entryDate": "2026-01-15",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "5",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "2026-01-16",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 8440
  },
  {
    "id": "csv_1063",
    "owner": "Mary",
    "title": "Review December Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-01-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-01-15",
    "projectedEndDate": "2026-01-15",
    "actualStartDate": "2026-01-15",
    "actualEndDate": "2026-01-15",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 8630
  },
  {
    "id": "csv_1064",
    "owner": "Mary",
    "title": "Review January 2026 Commission Payout",
    "nextAction": "Signed Off",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-01-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-02-16",
    "projectedEndDate": "2026-02-16",
    "actualStartDate": "2026-02-13",
    "actualEndDate": "2026-02-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 8820
  },
  {
    "id": "csv_1065",
    "owner": "Mary",
    "title": "Review February 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-02-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-03-16",
    "projectedEndDate": "2026-03-16",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 9010
  },
  {
    "id": "csv_1066",
    "owner": "Mary",
    "title": "Review March 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-03-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-04-15",
    "projectedEndDate": "2026-04-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 9200
  },
  {
    "id": "csv_1067",
    "owner": "Mary",
    "title": "Review April 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-04-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-05-15",
    "projectedEndDate": "2026-05-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 9390
  },
  {
    "id": "csv_1068",
    "owner": "Mary",
    "title": "Review May 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-05-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-06-15",
    "projectedEndDate": "2026-06-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 9580
  },
  {
    "id": "csv_1069",
    "owner": "Mary",
    "title": "Review June 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-06-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-07-15",
    "projectedEndDate": "2026-07-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 9770
  },
  {
    "id": "csv_1070",
    "owner": "Mary",
    "title": "Review July 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-07-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-08-14",
    "projectedEndDate": "2026-08-14",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 9960
  },
  {
    "id": "csv_1071",
    "owner": "Mary",
    "title": "Review August 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-08-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-09-15",
    "projectedEndDate": "2026-09-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 10150
  },
  {
    "id": "csv_1072",
    "owner": "Mary",
    "title": "Review September 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-09-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-10-15",
    "projectedEndDate": "2026-10-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 10340
  },
  {
    "id": "csv_1073",
    "owner": "Mary",
    "title": "Review October 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-10-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-11-16",
    "projectedEndDate": "2026-11-16",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 10530
  },
  {
    "id": "csv_1074",
    "owner": "Mary",
    "title": "Review November 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-11-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-12-15",
    "projectedEndDate": "2026-12-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 10720
  },
  {
    "id": "csv_1075",
    "owner": "Mary",
    "title": "Review December 2026 Commission Payout",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-12-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2027-01-15",
    "projectedEndDate": "2027-01-15",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 10910
  },
  {
    "id": "csv_1076",
    "owner": "Mary",
    "title": "Review January 2026 Commission Payout  -  Estimates",
    "nextAction": "Completed - Sign Off",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-01-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-02-06",
    "projectedEndDate": "2026-02-06",
    "actualStartDate": "2026-02-06",
    "actualEndDate": "2026-02-06",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 11100
  },
  {
    "id": "csv_1077",
    "owner": "Mary",
    "title": "Review February 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-02-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-03-06",
    "projectedEndDate": "2026-03-06",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 11290
  },
  {
    "id": "csv_1078",
    "owner": "Mary",
    "title": "Review March 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-03-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-04-07",
    "projectedEndDate": "2026-04-07",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 11480
  },
  {
    "id": "csv_1079",
    "owner": "Mary",
    "title": "Review April 2026 Commission Payout  - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-04-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-05-07",
    "projectedEndDate": "2026-05-07",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 11670
  },
  {
    "id": "csv_1080",
    "owner": "Mary",
    "title": "Review May 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-05-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-06-08",
    "projectedEndDate": "2026-06-08",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 11860
  },
  {
    "id": "csv_1081",
    "owner": "Mary",
    "title": "Review June 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-06-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-07-07",
    "projectedEndDate": "2026-07-07",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 12050
  },
  {
    "id": "csv_1082",
    "owner": "Mary",
    "title": "Review July 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-07-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-08-07",
    "projectedEndDate": "2026-08-07",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 12240
  },
  {
    "id": "csv_1083",
    "owner": "Mary",
    "title": "Review August 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-08-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-09-07",
    "projectedEndDate": "2026-09-07",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 12430
  },
  {
    "id": "csv_1084",
    "owner": "Mary",
    "title": "Review September 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-09-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-10-07",
    "projectedEndDate": "2026-10-07",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 12620
  },
  {
    "id": "csv_1085",
    "owner": "Mary",
    "title": "Review October 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-10-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-11-06",
    "projectedEndDate": "2026-11-06",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 12810
  },
  {
    "id": "csv_1086",
    "owner": "Mary",
    "title": "Review November 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-11-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-12-07",
    "projectedEndDate": "2026-12-07",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 13000
  },
  {
    "id": "csv_1087",
    "owner": "Mary",
    "title": "Review December 2026 Commission Payout - Estimates",
    "nextAction": "",
    "additionalInfo": "Review and sign off for Nick",
    "entryDate": "2026-12-15",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2027-01-07",
    "projectedEndDate": "2027-01-07",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 13190
  },
  {
    "id": "csv_1088",
    "owner": "Mary",
    "title": "Remove Manage Chargeback from DH invoices/quotes & Accelerated Funding to be added by 2/17/2026",
    "nextAction": "Come back Jan 28th to follow up with Biju",
    "additionalInfo": "Directive from Biju. Need to discuss tech debt implications and trying to clean that data out of SFDC. Offer to perserve data in the event we need it. Additionally find out what we need to do this advanced cash funding.",
    "entryDate": "2026-01-16",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Not Started",
    "statusReason": "Not Started - Clarification Required",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Payments Operations",
    "requesterName": "Biju Nair",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "Clarifying the start dates on this one w/ Peter and BIju",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 13380
  },
  {
    "id": "csv_1089",
    "owner": "Mary",
    "title": "Prepare and Send Quilt Contract",
    "nextAction": "Follow up with 12 month contract.",
    "additionalInfo": "Per Finance",
    "entryDate": "2026-01-16",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Critical",
    "points": "5",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-16",
    "projectedEndDate": "2026-02-16",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 13570
  },
  {
    "id": "csv_1090",
    "owner": "Mary",
    "title": "Summer Written Plan - VL",
    "nextAction": "Sent off for Taylor H. to sign.",
    "additionalInfo": "Summer Commission (confidential).xlsx",
    "entryDate": "2026-01-16",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "5",
    "requester": "",
    "department": "NonSales - Leadership",
    "requesterName": "Clinton Brady",
    "projectedStartDate": "2026-01-19",
    "projectedEndDate": "2026-01-19",
    "actualStartDate": "2026-01-21",
    "actualEndDate": "2026-01-26",
    "comment": "Add to population file?",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 13760
  },
  {
    "id": "csv_1091",
    "owner": "Mary",
    "title": "Tableau format in the quota master sheet",
    "nextAction": "Silas seems good with what was provided. Will be on call if he needs additional data points. Shared initial run with Silas - waiting for feedback on initial quotas that we can offer.",
    "additionalInfo": "Tableau reporting for the individual",
    "entryDate": "2026-01-16",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "NonSales - Leadership",
    "requesterName": "Silas Larson",
    "projectedStartDate": "2026-01-20",
    "projectedEndDate": "2026-01-23",
    "actualStartDate": "2026-01-21",
    "actualEndDate": "2026-01-21",
    "comment": "Sent to Silas - confirmed good",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 13950
  },
  {
    "id": "csv_1092",
    "owner": "Mary",
    "title": "Assist with Cohort Product Upload",
    "nextAction": "Silas has shared the file, go update the template. PRIORITIZE",
    "additionalInfo": "",
    "entryDate": "2026-01-16",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Not Started",
    "statusReason": "Not Started - Prio",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Billing",
    "requesterName": "Yan Strunga",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 14140
  },
  {
    "id": "csv_1093",
    "owner": "Nick",
    "title": "Adjust 2026 SPIFS",
    "nextAction": "Adjust ASI SPIFs to read pre migration software",
    "additionalInfo": "",
    "entryDate": "2026-01-16",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "2026-01-16",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 1980
  },
  {
    "id": "csv_1094",
    "owner": "Mary",
    "title": "Chris Upload - Past Due Invoices",
    "nextAction": "Uploaded. Shared reference with Chris.",
    "additionalInfo": "Moving cases and creating cases in Amber's name",
    "entryDate": "2026-01-16",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Customer Care",
    "requesterName": "Chris Allan",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "2026-01-16",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 14330
  },
  {
    "id": "csv_1095",
    "owner": "Mary",
    "title": "Follow to up on Gina's slack message to Chris",
    "nextAction": "Compose message.",
    "additionalInfo": "Send on Tuesday to warn Chris his stuff will be lost. Support SFDC team in building boundaries.",
    "entryDate": "2026-01-16",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "1",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Gina Beyries",
    "projectedStartDate": "2026-01-19",
    "projectedEndDate": "2026-01-20",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-20",
    "comment": "Chris followed up with Gina  - they're moving forward.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 14520
  },
  {
    "id": "csv_1096",
    "owner": "Mary",
    "title": "Follow up with Taiza to finish up the MID duplicate issue",
    "nextAction": "PRIORITIZE",
    "additionalInfo": "Follow up to see if Jake sent updated information. Schedule meeting with Taiza.",
    "entryDate": "2026-01-16",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Not Started",
    "statusReason": "Not Started - Prio",
    "priority": "High",
    "points": "10",
    "requester": "",
    "department": "Data Warehouse",
    "requesterName": "Jacob Dockter",
    "projectedStartDate": "2026-01-19",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 14710
  },
  {
    "id": "csv_1097",
    "owner": "Mary",
    "title": "Review Performance Workbook Snapshot Tab",
    "nextAction": "Provided Dan feedback",
    "additionalInfo": "Provide feedback to Dan",
    "entryDate": "2026-01-16",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Dan Hall",
    "projectedStartDate": "2026-01-19",
    "projectedEndDate": "2026-01-19",
    "actualStartDate": "2026-01-29",
    "actualEndDate": "2026-01-29",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 14900
  },
  {
    "id": "csv_1098",
    "owner": "Mary",
    "title": "Follow up on EBT request with Tyler/Peter.",
    "nextAction": "PRIORITIZE",
    "additionalInfo": "Need to get feedback on this so we can move forward in development.",
    "entryDate": "2026-01-16",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "2",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Lisa Haigy",
    "projectedStartDate": "2026-01-19",
    "projectedEndDate": "2026-01-21",
    "actualStartDate": "2026-01-21",
    "actualEndDate": "2026-01-21",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 15090
  },
  {
    "id": "csv_1099",
    "owner": "Mary",
    "title": "Review COO Reporting Dashboard  (Nick)",
    "nextAction": "Review for Nick - Check in Tuesday on progress",
    "additionalInfo": "Check in and review any progress made.",
    "entryDate": "2026-01-16",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "8",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-01-19",
    "projectedEndDate": "2026-01-19",
    "actualStartDate": "2026-01-29",
    "actualEndDate": "2026-01-29",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 15280
  },
  {
    "id": "csv_1100",
    "owner": "Mary",
    "title": "Update Support Performance Spreadsheet - discuss passing off to Lisa.",
    "nextAction": "Discuss Lisa owning.",
    "additionalInfo": "Update report",
    "entryDate": "2026-01-16",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Low",
    "points": "3",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-16",
    "projectedEndDate": "2026-01-16",
    "actualStartDate": "2026-01-16",
    "actualEndDate": "2026-01-16",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 15470
  },
  {
    "id": "csv_1101",
    "owner": "Nick",
    "title": "Upload and enter clawbacks",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-01-17",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "",
    "projectedStartDate": "2026-01-17",
    "projectedEndDate": "2026-01-17",
    "actualStartDate": "2026-01-17",
    "actualEndDate": "2026-01-17",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 2170
  },
  {
    "id": "csv_1102",
    "owner": "Mary",
    "title": "Lisa 1on1 Note  - Discuss Daily Stand Up & Managing the Support Performance spreadsheet",
    "nextAction": "Discuss with Lisa",
    "additionalInfo": "Discuss with Lisa on not cancelling that call even when she is out. She needs to hand that off to either Kyle/Neil or Gina to run in her absence. Additionally, need her to own the support performance sheet. Will discuss with her on what needs to be updated.",
    "entryDate": "2026-01-20",
    "type": "Internal To Do",
    "project": "WBDM - Forecast",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-21",
    "projectedEndDate": "2026-01-21",
    "actualStartDate": "2026-02-19",
    "actualEndDate": "2026-02-19",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 15660
  },
  {
    "id": "csv_1103",
    "owner": "Nick",
    "title": "CC team numbers",
    "nextAction": "waiting to get the actual final numbers.\nAdding adjustments for XBU",
    "additionalInfo": "Entered what was given. Now sorting out why the numbers don't align with the plans.",
    "entryDate": "2026-01-20",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "6",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-20",
    "projectedEndDate": "2026-01-20",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-20",
    "comment": "Last minute adjustments to sales plans",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 2360
  },
  {
    "id": "csv_1104",
    "owner": "Nick",
    "title": "Change od Ownership Dash/Excel",
    "nextAction": "",
    "additionalInfo": "Create an excel file/dashboard for change of ownership deals.",
    "entryDate": "2026-01-20",
    "type": "General Support & Requests",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "8",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-20",
    "projectedEndDate": "2026-01-20",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-20",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 2550
  },
  {
    "id": "csv_1105",
    "owner": "Mary",
    "title": "Submit a T4 for Dan to do FD excel update",
    "nextAction": "Submitted",
    "additionalInfo": "",
    "entryDate": "2026-01-20",
    "type": "Internal To Do",
    "project": "WBDM - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-20",
    "projectedEndDate": "2026-01-20",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-20",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 15850
  },
  {
    "id": "csv_1106",
    "owner": "Mary",
    "title": "Mary to send Peter with updates on the forecast sheet.",
    "nextAction": "",
    "additionalInfo": "Updated the sheet to auto calc and set coefficient to run every 4 hours to see how it goes with the lightened load.",
    "entryDate": "2026-01-20",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM- Sales All Hands",
    "status": "Completed",
    "statusReason": "Superseded by New Request",
    "priority": "Low",
    "points": "1",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-21",
    "projectedEndDate": "2026-01-21",
    "actualStartDate": "2026-02-04",
    "actualEndDate": "2026-02-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 16040
  },
  {
    "id": "csv_1107",
    "owner": "Nick",
    "title": "Connor Prindle MBO add to CIQ and final Sheet to Drew",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-01-20",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-20",
    "projectedEndDate": "2026-01-20",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-20",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 2740
  },
  {
    "id": "csv_1108",
    "owner": "Nick",
    "title": "Clawback reminder email and slide deck to AEs",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-01-20",
    "type": "General Support & Requests",
    "project": "",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-20",
    "projectedEndDate": "2026-01-20",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-20",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 2930
  },
  {
    "id": "csv_1109",
    "owner": "Nick",
    "title": "Sales Plans Rewrite",
    "nextAction": "Good to start updating all otv, quota, and rates in all sales plans that require it.",
    "additionalInfo": "",
    "entryDate": "2026-01-20",
    "type": "General Projects",
    "project": "G2025 - Planning H1 2026",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "8",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-20",
    "projectedEndDate": "2026-01-21",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-21",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 3120
  },
  {
    "id": "csv_1110",
    "owner": "Mary",
    "title": "Discuss Automation possibilities with the SFDC team - Thursday",
    "nextAction": "",
    "additionalInfo": "Discuss Kyle's AI tech doc creator and other possibilities for automation",
    "entryDate": "2026-01-21",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-22",
    "projectedEndDate": "2026-01-22",
    "actualStartDate": "2026-01-22",
    "actualEndDate": "2026-01-22",
    "comment": "Good discussion",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 16230
  },
  {
    "id": "csv_1111",
    "owner": "Mary",
    "title": "Finalize EBT question into Dealhub",
    "nextAction": "Sent message about EBT questions to the group. Waiting for response",
    "additionalInfo": "Finalize EBT question",
    "entryDate": "2026-01-21",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "7",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-21",
    "projectedEndDate": "2026-01-28",
    "actualStartDate": "2026-01-23",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 16420
  },
  {
    "id": "csv_1112",
    "owner": "Mary",
    "title": "GrazeCart price changed from 69 to 89 for Starter",
    "nextAction": "Updated Dealhub",
    "additionalInfo": "Need to update pricing sheet.",
    "entryDate": "2026-01-21",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-21",
    "projectedEndDate": "2026-01-21",
    "actualStartDate": "2026-01-21",
    "actualEndDate": "2026-01-21",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 16610
  },
  {
    "id": "csv_1113",
    "owner": "Mary",
    "title": "Help Tyler with best practices in RingDNA",
    "nextAction": "Coordinate with Tyler on best practices in RingDNA",
    "additionalInfo": "",
    "entryDate": "2026-01-21",
    "type": "General Projects",
    "project": "G2026 - Documentation",
    "status": "Not Started",
    "statusReason": "Not Started - Prio",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 16800
  },
  {
    "id": "csv_1114",
    "owner": "Mary",
    "title": "Review FD Ticket 11404",
    "nextAction": "Reviewed and aligned on the merging of the accounts in that ticket",
    "additionalInfo": "",
    "entryDate": "2026-01-21",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Kyle Monteiro",
    "projectedStartDate": "2026-01-21",
    "projectedEndDate": "2026-01-21",
    "actualStartDate": "2026-01-21",
    "actualEndDate": "2026-01-21",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 16990
  },
  {
    "id": "csv_1115",
    "owner": "Mary",
    "title": "Review SOP for FreshDesk",
    "nextAction": "Document was generally good, had only minor feedback. Believe it's set for release amongst the team.",
    "additionalInfo": "",
    "entryDate": "2026-01-21",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Documentation",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Kyle Monteiro",
    "projectedStartDate": "2026-01-21",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-02-11",
    "actualEndDate": "2026-02-11",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 17180
  },
  {
    "id": "csv_1116",
    "owner": "Mary",
    "title": "Submission Date for Dealhub align field in both SBU & XBU",
    "nextAction": "Tested",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "",
    "requesterName": "Lisa Haigy",
    "projectedStartDate": "2026-02-06",
    "projectedEndDate": "2026-02-06",
    "actualStartDate": "2026-02-09",
    "actualEndDate": "2026-02-09",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 17370
  },
  {
    "id": "csv_1117",
    "owner": "Mary",
    "title": "Remove Product for Brian in Dealhub",
    "nextAction": "Product was already made inactive with a 'never' rule - keep an eye on this...",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Brian Sullivan",
    "projectedStartDate": "2026-01-22",
    "projectedEndDate": "2026-01-22",
    "actualStartDate": "2026-01-23",
    "actualEndDate": "2026-01-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 17560
  },
  {
    "id": "csv_1118",
    "owner": "Nick",
    "title": "CC and MAx Gold add to CIQ Master",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-22",
    "projectedEndDate": "2026-01-22",
    "actualStartDate": "2026-01-22",
    "actualEndDate": "2026-01-22",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 3310
  },
  {
    "id": "csv_1119",
    "owner": "Nick",
    "title": "Expand on Adj and Reduction Audit",
    "nextAction": "Pull in missing fields and add to analysis",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "8",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-22",
    "projectedEndDate": "2026-01-26",
    "actualStartDate": "2026-01-22",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 3500
  },
  {
    "id": "csv_1120",
    "owner": "Mary",
    "title": "Add Barb to DS",
    "nextAction": "Added Barb",
    "additionalInfo": "Add barb to DS for Amber",
    "entryDate": "2026-01-22",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Low",
    "points": "1",
    "requester": "",
    "department": "Customer Care",
    "requesterName": "Amber Earles",
    "projectedStartDate": "2026-01-22",
    "projectedEndDate": "2026-01-22",
    "actualStartDate": "2026-01-23",
    "actualEndDate": "2026-01-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 17750
  },
  {
    "id": "csv_1121",
    "owner": "Dan",
    "title": "t95 Pod Green  - Dupe t95 from Pod Red",
    "nextAction": "Make for Expansion pod",
    "additionalInfo": "Pending Chris on how he wants to this structured. Having so many phases/brands make it a very long list.",
    "entryDate": "2026-01-22",
    "type": "Workbook/Document Maintenance",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "10",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-01-09",
    "projectedEndDate": "2026-01-27",
    "actualStartDate": "2026-01-09",
    "actualEndDate": "2026-01-27",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 1410
  },
  {
    "id": "csv_1122",
    "owner": "Mary",
    "title": "Send message to Sales Leadership on Commission sending plan",
    "nextAction": "Sent.",
    "additionalInfo": "Send to sales leadership",
    "entryDate": "2026-01-22",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-22",
    "projectedEndDate": "2026-01-22",
    "actualStartDate": "2026-01-23",
    "actualEndDate": "2026-01-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 17940
  },
  {
    "id": "csv_1123",
    "owner": "Dan",
    "title": "File Repository.xlsx [1009]",
    "nextAction": "Find the file and study the structure",
    "additionalInfo": "Need to add steps and tricks for adding AE to our ecosystem",
    "entryDate": "2026-01-22",
    "type": "General Projects",
    "project": "G2026 - Master Workbooks",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 1600
  },
  {
    "id": "csv_1124",
    "owner": "Dan",
    "title": "LifeSaver License count",
    "nextAction": "fix in XBU Deal Hub",
    "additionalInfo": "one free license for starter, 5 free for core, 10 free for plus\ufffd",
    "entryDate": "2026-01-22",
    "type": "Internal To Do",
    "project": "TS - Dealhub",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Low",
    "points": "4",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Dan Hall",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 1790
  },
  {
    "id": "csv_1125",
    "owner": "Dan",
    "title": "Logo count update",
    "nextAction": "fix in XBU Deal Hub",
    "additionalInfo": "XBU Add Logo count for Payments/Updgrade\ufffdPayments/Upsell\ufffd",
    "entryDate": "2026-01-22",
    "type": "Internal To Do",
    "project": "TS - Dealhub",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Low",
    "points": "4",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Dan Hall",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 1980
  },
  {
    "id": "csv_1126",
    "owner": "Dan",
    "title": "License count fix",
    "nextAction": "fix in SBU deal hub",
    "additionalInfo": "Some MRR products are adding licence count.",
    "entryDate": "2026-01-22",
    "type": "Internal To Do",
    "project": "TS - Dealhub",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Low",
    "points": "4",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Dan Hall",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 2170
  },
  {
    "id": "csv_1127",
    "owner": "Dan",
    "title": "Zap - Internal support performance work book",
    "nextAction": "watch the col Rand col S on the file",
    "additionalInfo": "The fields are there, but maybe the zap wasn't updated? I recall mapping it.\n--> was mapped, but not published. Now published",
    "entryDate": "2026-01-22",
    "type": "Tech Stack Maintenance",
    "project": "TS - Zapier",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "Medium",
    "points": "6",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-08",
    "projectedEndDate": "2026-01-08",
    "actualStartDate": "2026-01-08",
    "actualEndDate": "2026-01-22",
    "comment": "Had it mapped, but did not publihsed the updated flow",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 2360
  },
  {
    "id": "csv_1128",
    "owner": "Mary",
    "title": "Write up plans for Leaders",
    "nextAction": "Lead plans finalized. Put plans together and review with Peter.",
    "additionalInfo": "Finalize plans for leaders (Matthew Jacobus already finalized)",
    "entryDate": "2026-01-22",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "Critical",
    "points": "12",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-23",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-23",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 18130
  },
  {
    "id": "csv_1129",
    "owner": "Mary",
    "title": "Proposal Sent Field Testing",
    "nextAction": "Test Friday",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "5",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Gina Beyries",
    "projectedStartDate": "2026-01-23",
    "projectedEndDate": "2026-01-23",
    "actualStartDate": "2026-01-26",
    "actualEndDate": "2026-01-26",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 18320
  },
  {
    "id": "csv_1130",
    "owner": "Mary",
    "title": "Pre-Migration Picklist",
    "nextAction": "Tested 2/9 - signed off",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Gina Beyries",
    "projectedStartDate": "2026-01-23",
    "projectedEndDate": "2026-01-23",
    "actualStartDate": "2026-02-09",
    "actualEndDate": "2026-02-09",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 18510
  },
  {
    "id": "csv_1131",
    "owner": "Mary",
    "title": "Competitor Picklist Testing",
    "nextAction": "Test Friday",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "5",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Gina Beyries",
    "projectedStartDate": "2026-01-23",
    "projectedEndDate": "2026-01-23",
    "actualStartDate": "2026-01-26",
    "actualEndDate": "2026-01-26",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 18700
  },
  {
    "id": "csv_1132",
    "owner": "Mary",
    "title": "Create Umer's 2026 workbook for commissions excel version",
    "nextAction": "Create on Tuesday",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-27",
    "projectedEndDate": "2026-01-27",
    "actualStartDate": "2026-01-23",
    "actualEndDate": "2026-01-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 18890
  },
  {
    "id": "csv_1133",
    "owner": "Mary",
    "title": "Set up time with Kyle & team to discuss automation processes",
    "nextAction": "Talked with Kyle - going to see what he can come up with",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-23",
    "projectedEndDate": "2026-01-23",
    "actualStartDate": "2026-02-03",
    "actualEndDate": "2026-02-03",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 19080
  },
  {
    "id": "csv_1134",
    "owner": "Mary",
    "title": "Work with Nick on 2026 H1 component write up for finance (send with estimates?)",
    "nextAction": "Follow up with Nick early next week after audit",
    "additionalInfo": "",
    "entryDate": "2026-01-22",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-28",
    "actualStartDate": "2026-02-03",
    "actualEndDate": "2026-02-03",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 19270
  },
  {
    "id": "csv_1135",
    "owner": "Nick",
    "title": "2026 H1 component write up for finance (send with estimates?)",
    "nextAction": "",
    "additionalInfo": "Write up for finance of all components & descriptions on how we measure",
    "entryDate": "2026-01-22",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "10",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-28",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "2026-02-03",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 3690
  },
  {
    "id": "csv_1136",
    "owner": "Mary",
    "title": "Refer to Taiza's upload email from Wednesday",
    "nextAction": "Uploaded residuals per the email.",
    "additionalInfo": "MID & Residual Upload clean up",
    "entryDate": "2026-01-22",
    "type": "General Support & Requests",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Business Ops",
    "requesterName": "Taiza Cole",
    "projectedStartDate": "2026-01-23",
    "projectedEndDate": "2026-01-23",
    "actualStartDate": "2026-01-23",
    "actualEndDate": "2026-01-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 19460
  },
  {
    "id": "csv_1137",
    "owner": "Mary",
    "title": "Got approval  - finalize CC addendums",
    "nextAction": "Sent - will see if Peter/Chris align with suggest payroll.",
    "additionalInfo": "",
    "entryDate": "2026-01-23",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "5",
    "requester": "",
    "department": "Customer Care",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-28",
    "actualStartDate": "2026-02-09",
    "actualEndDate": "2026-02-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 19650
  },
  {
    "id": "csv_1138",
    "owner": "Mary",
    "title": "Review the opportunity per Lisa in SBU Full SB",
    "nextAction": "Review the opportunity - layout reviewed, looks good. Next step work on the 'opp create' button",
    "additionalInfo": "",
    "entryDate": "2026-01-23",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Lisa Haigy",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-26",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 19840
  },
  {
    "id": "csv_1139",
    "owner": "Dan",
    "title": "Make - #quilt-payments-approval-requests \"View Quote\" link fix",
    "nextAction": "Track each step again",
    "additionalInfo": "did some testing, but can't figure out why its not working",
    "entryDate": "2026-01-26",
    "type": "Tech Stack Maintenance",
    "project": "TS - Zapier",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "Medium",
    "points": "8",
    "requester": "",
    "department": "Customer Care",
    "requesterName": "Jaime Malley",
    "projectedStartDate": "2026-01-23",
    "projectedEndDate": "",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 2550
  },
  {
    "id": "csv_1140",
    "owner": "Nick",
    "title": "Clawback Upload",
    "nextAction": "",
    "additionalInfo": "there were 41 clawbacks that needed uploaded so it will take extra time to manually enter the amounts for these. Also created a tracking sheet to share with Tyler and Peter.",
    "entryDate": "2026-01-26",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "6",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-26",
    "actualStartDate": "2026-01-26",
    "actualEndDate": "2026-01-26",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 3880
  },
  {
    "id": "csv_1141",
    "owner": "Nick",
    "title": "Fix TL hierarchy for oBDR and amBDR",
    "nextAction": "Got a video from CIQ for a fix. Will be attempting this soon.",
    "additionalInfo": "",
    "entryDate": "2026-01-26",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-26",
    "actualStartDate": "2026-01-26",
    "actualEndDate": "2026-01-26",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 4070
  },
  {
    "id": "csv_1142",
    "owner": "Mary",
    "title": "Spam free our numbers for RingDNA",
    "nextAction": "Voice Integrity completed",
    "additionalInfo": "",
    "entryDate": "2026-01-26",
    "type": "Tech Stack Maintenance",
    "project": "TS - RingDNA",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-10",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 20030
  },
  {
    "id": "csv_1143",
    "owner": "Nick",
    "title": "Clean up CIQ Plan by Plan",
    "nextAction": "Take over from where Mary and I left off by grouping worksheets and making sure the plans for the AEs are corrected and formatted correctly.",
    "additionalInfo": "",
    "entryDate": "2026-01-26",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-01-27",
    "actualStartDate": "2026-01-26",
    "actualEndDate": "2026-01-28",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 4260
  },
  {
    "id": "csv_1144",
    "owner": "Nick",
    "title": "CIQ Audit",
    "nextAction": "Attempt an early audit of the January sales data.",
    "additionalInfo": "Will require some reconfiguring of the audit sheet.",
    "entryDate": "2026-01-27",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "6",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-27",
    "projectedEndDate": "2026-01-27",
    "actualStartDate": "2026-01-27",
    "actualEndDate": "2026-01-28",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 4450
  },
  {
    "id": "csv_1145",
    "owner": "Nick",
    "title": "Clawback Tracker/Analysis Sheet",
    "nextAction": "Expand on the tracker I built for Peter and Tyler to track clawbacks in 2026",
    "additionalInfo": "Completed but decided it needs to be moved to earnings master.Move to earnings file complete.",
    "entryDate": "2026-01-26",
    "type": "General Support & Requests",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "14",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-26",
    "projectedEndDate": "2026-02-02",
    "actualStartDate": "2026-01-26",
    "actualEndDate": "2026-02-19",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 4640
  },
  {
    "id": "csv_1146",
    "owner": "Dan",
    "title": "t95 Pod Black  - Dupe t95 from Pod Red",
    "nextAction": "done",
    "additionalInfo": "",
    "entryDate": "2026-01-27",
    "type": "Workbook/Document Maintenance",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "10",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 2740
  },
  {
    "id": "csv_1147",
    "owner": "Dan",
    "title": "t95 Pod Blue  - Dupe t95 from Pod Red",
    "nextAction": "done",
    "additionalInfo": "",
    "entryDate": "2026-01-27",
    "type": "Workbook/Document Maintenance",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "15",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 2930
  },
  {
    "id": "csv_1148",
    "owner": "Dan",
    "title": "ZAp - Fix SFDC link pop up",
    "nextAction": "Behavior updated",
    "additionalInfo": "in#-quilt-new-business-sales",
    "entryDate": "2026-01-27",
    "type": "Tech Stack Maintenance",
    "project": "TS - Zapier",
    "status": "Completed",
    "statusReason": "Watching Outcome",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-27",
    "projectedEndDate": "2026-01-27",
    "actualStartDate": "2026-01-27",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 3120
  },
  {
    "id": "csv_1149",
    "owner": "Dan",
    "title": "t95 Pod Expanson",
    "nextAction": "Pending Chris to answer the structrue",
    "additionalInfo": "-",
    "entryDate": "2026-01-27",
    "type": "Workbook/Document Maintenance",
    "project": "GSR - One Offs",
    "status": "In Progress",
    "statusReason": "Not Started - Clarification Required",
    "priority": "Medium",
    "points": "15",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 3310
  },
  {
    "id": "csv_1150",
    "owner": "Dan",
    "title": "Pete wanted Historic Reference source for Forecast - 2026 sheet",
    "nextAction": "done",
    "additionalInfo": "-",
    "entryDate": "2026-01-27",
    "type": "General Support & Requests",
    "project": "G2026 - Master Workbooks",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-27",
    "projectedEndDate": "2026-01-27",
    "actualStartDate": "2026-01-27",
    "actualEndDate": "2026-01-27",
    "comment": "Peter just needed the reference tab and the file",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 3500
  },
  {
    "id": "csv_1151",
    "owner": "Mary",
    "title": "Create quarterly performance review form for the team",
    "nextAction": "Created",
    "additionalInfo": "",
    "entryDate": "2026-01-27",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-06",
    "projectedEndDate": "2026-03-31",
    "actualStartDate": "2026-02-11",
    "actualEndDate": "2026-02-11",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 20220
  },
  {
    "id": "csv_1152",
    "owner": "Mary",
    "title": "Dealhub adjustment  for Leila & Team",
    "nextAction": "Update dealhub by EOW",
    "additionalInfo": "Is it possible to have the Payment Method field in DealHub auto populate to \"No Charge\" for the three Payment Retention opportunity types? (enclosed screenshot) It is currently auto-populated to Credit Card and the team members have to remember to go in and change it.Also wondering if the Shipping Method field may be auto-populated based on the opp type/subtype? (N/A for Adjustment opps and Free Shipping for Processor Switch)Payment Retention opp types/sub types:Adjustment/Payments Modification Adjustment/Payment Reduction Payments/Processor Switch",
    "entryDate": "2026-01-27",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Customer Care",
    "requesterName": "Leila Sahra",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-28",
    "actualEndDate": "2026-01-28",
    "comment": "Pushed evening time",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 20410
  },
  {
    "id": "csv_1153",
    "owner": "Mary",
    "title": "Rezo Good/Better/Best Pricing for POS & Implementation",
    "nextAction": "Completed",
    "additionalInfo": "Urgent - see Tyler/Clinton/Taylor slack",
    "entryDate": "2026-01-28",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "10",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-01-28",
    "projectedEndDate": "2026-01-28",
    "actualStartDate": "2026-01-28",
    "actualEndDate": "2026-01-28",
    "comment": "Pushed evening time",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 20600
  },
  {
    "id": "csv_1154",
    "owner": "Dan",
    "title": "Allocation Target (needs to be mathed, not hard coded)",
    "nextAction": "",
    "additionalInfo": "Everywhere we have allocation weighting. Lead Allocation admin, T95 files",
    "entryDate": "2026-01-27",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "Mary Wike",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 3690
  },
  {
    "id": "csv_1155",
    "owner": "Mary",
    "title": "ThriftCart excel list account upload and opportunity upload",
    "nextAction": "Thrift Upload Reference- Uploaded",
    "additionalInfo": "Refer to provided excel",
    "entryDate": "2026-01-27",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "8",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-29",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 20790
  },
  {
    "id": "csv_1156",
    "owner": "Dan",
    "title": "Shift BDRs to LA4.0",
    "nextAction": "block all Editing and insrt a link to their individual 4.0 file",
    "additionalInfo": "Done for all LA3.0 files. Will keep those files alive for a week, so BDRs have  time to shift",
    "entryDate": "2026-01-27",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "5",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-27",
    "projectedEndDate": "2026-01-27",
    "actualStartDate": "2026-01-27",
    "actualEndDate": "2026-01-27",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 3880
  },
  {
    "id": "csv_1157",
    "owner": "Mary",
    "title": "Payments Pricing Changes  - Prices",
    "nextAction": "Waiting on Chris to confirm list is ready",
    "additionalInfo": "Load as negotiating",
    "entryDate": "2026-01-28",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "7",
    "requester": "",
    "department": "Payments Operations",
    "requesterName": "Chris Allan",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-02",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 20980
  },
  {
    "id": "csv_1158",
    "owner": "Mary",
    "title": "Payments Pricing Changes  - Prices",
    "nextAction": "",
    "additionalInfo": "Move loaded ups to closed on Feb 20th",
    "entryDate": "2026-01-28",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - One Offs",
    "status": "Not Started",
    "statusReason": "Not Started - Prio",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Payments Operations",
    "requesterName": "Chris Allan",
    "projectedStartDate": "2026-02-20",
    "projectedEndDate": "2026-02-20",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 21170
  },
  {
    "id": "csv_1159",
    "owner": "Nick",
    "title": "ASI Tri-Tech SPIF",
    "nextAction": "Meeting on friday to align with Tableau",
    "additionalInfo": "Met with Mike and changed up the formula for the Spif but still not matching Tableau. Need to know exactly what tableau is looking at.Had the meeting with Mike. Need to change the formula to look at opp corhorts and then account cohorts. He wanted to look at BDR Owner but I think that is the wrong move. It should be demo set by.",
    "entryDate": "2026-01-28",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "9",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Flemming",
    "projectedStartDate": "2026-01-28",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-28",
    "actualEndDate": "2026-02-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 4830
  },
  {
    "id": "csv_1160",
    "owner": "Nick",
    "title": "Summer Halstead CIQ Plan",
    "nextAction": "Build in CIQ",
    "additionalInfo": "Written plan in Sharepoint. Build from that.",
    "entryDate": "2026-01-28",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "5",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-28",
    "projectedEndDate": "2026-01-29",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 5020
  },
  {
    "id": "csv_1161",
    "owner": "Nick",
    "title": "Create New SPIF for deals with parent opp ID from Closed Lost List.",
    "nextAction": "Build on to SPIF sheet.",
    "additionalInfo": "",
    "entryDate": "2026-01-28",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Tyler Rhotan",
    "projectedStartDate": "2026-01-29",
    "projectedEndDate": "2026-01-29",
    "actualStartDate": "2026-02-05",
    "actualEndDate": "2026-02-05",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 5210
  },
  {
    "id": "csv_1162",
    "owner": "Mary",
    "title": "Schedule call about locations for Expansion deal wise",
    "nextAction": "Discussed",
    "additionalInfo": "",
    "entryDate": "2026-01-28",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Low",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-28",
    "projectedEndDate": "2026-01-28",
    "actualStartDate": "2026-02-18",
    "actualEndDate": "2026-02-18",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 21360
  },
  {
    "id": "csv_1163",
    "owner": "Mary",
    "title": "Schedule call with Natasha/Cort/Duane about NetSuite process to cross train",
    "nextAction": "Scheduled",
    "additionalInfo": "",
    "entryDate": "2026-01-28",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Fulfillment",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-28",
    "projectedEndDate": "2026-01-28",
    "actualStartDate": "2026-02-19",
    "actualEndDate": "2026-02-19",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 21550
  },
  {
    "id": "csv_1164",
    "owner": "Nick",
    "title": "Update the default hierarchy in CIQ",
    "nextAction": "Update CIQ",
    "additionalInfo": "The default hierarchy is the only one that controls who (TL and managers) can see their teams statements.",
    "entryDate": "2026-01-29",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-01-29",
    "projectedEndDate": "2026-01-29",
    "actualStartDate": "2026-01-29",
    "actualEndDate": "2026-01-29",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 5400
  },
  {
    "id": "csv_1165",
    "owner": "Nick",
    "title": "Explaining attainment kickers to Jordan",
    "nextAction": "No further action required",
    "additionalInfo": "I think he thought he would get kickers on all deals after hitting 100%.",
    "entryDate": "2026-01-29",
    "type": "General Support & Requests",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "CJ Howell",
    "projectedStartDate": "2026-01-29",
    "projectedEndDate": "2026-01-29",
    "actualStartDate": "2026-01-29",
    "actualEndDate": "2026-01-29",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 5590
  },
  {
    "id": "csv_1166",
    "owner": "Mary",
    "title": "SFDC Health Survey & Rules of engagement",
    "nextAction": "",
    "additionalInfo": "Health survey to send out to the entire org.",
    "entryDate": "2026-01-29",
    "type": "Internal To Do",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "5",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Lisa Haigy",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-02",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 21740
  },
  {
    "id": "csv_1167",
    "owner": "Mary",
    "title": "Clean up historicals for Business Type Created",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-01-29",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Business Ops",
    "requesterName": "Silas Larson",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 21930
  },
  {
    "id": "csv_1168",
    "owner": "Mary",
    "title": "Upload clean business addresses in XBU",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-01-29",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Billing",
    "requesterName": "Shawna Steele",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 22120
  },
  {
    "id": "csv_1169",
    "owner": "Nick",
    "title": "Add open and closed lost tables to the COO analysis",
    "nextAction": "Add tables",
    "additionalInfo": "",
    "entryDate": "2026-01-30",
    "type": "Workbook/Document Maintenance",
    "project": "Internal - Team Discussion",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "2026-01-30",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 5780
  },
  {
    "id": "csv_1170",
    "owner": "Dan",
    "title": "#quilt-migration-sales channel not showing SBU wins",
    "nextAction": "Watch behavior",
    "additionalInfo": "Updated SFDC connection on the zap that is meant to do this. Lisa's connection was not working",
    "entryDate": "2026-01-30",
    "type": "Tech Stack Maintenance",
    "project": "TS - Zapier",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Fleming",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "",
    "comment": "It seems like the zap never saw a record that matches the filter. Which seems odd.",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 4070
  },
  {
    "id": "csv_1171",
    "owner": "Dan",
    "title": "total of SA + Non-SA for Liquor",
    "nextAction": "Pete  approves",
    "additionalInfo": "He may want New and Mig separated",
    "entryDate": "2026-01-30",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - One Offs",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "Low",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 4260
  },
  {
    "id": "csv_1172",
    "owner": "Dan",
    "title": "LA 4.0 Payments/Upgrade SBU links update",
    "nextAction": "Done",
    "additionalInfo": "Eva let me know it was not working",
    "entryDate": "2026-01-30",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - LA4.0 Maintenance & Delivery",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "2",
    "requester": "",
    "department": "Sales - BDR",
    "requesterName": "Eva S",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "2026-01-30",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 4450
  },
  {
    "id": "csv_1173",
    "owner": "Dan",
    "title": "Update XBU Calendly events to be schedule-able up to 15-min prior",
    "nextAction": "",
    "additionalInfo": "Nathan, Ryan, and Tyler talked about it",
    "entryDate": "2026-01-30",
    "type": "Tech Stack Maintenance",
    "project": "TS - Calendly",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Low",
    "points": "3",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Nathan Taylor",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 4640
  },
  {
    "id": "csv_1174",
    "owner": "Nick",
    "title": "Review, upload and enter clawbacks.",
    "nextAction": "Get all new Clawback in CIQ",
    "additionalInfo": "Brought in retention case close dates to the clawback tabs to make sure none closed in previous year as well.",
    "entryDate": "2026-01-30",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "6",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "2026-01-30",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 5970
  },
  {
    "id": "csv_1175",
    "owner": "Nick",
    "title": "Explained Kickers to Ali",
    "nextAction": "The are confused thinking the kickers apply to specific deals and not the overal running total. By they I mean she had the same questions as Jordan",
    "additionalInfo": "",
    "entryDate": "2026-01-30",
    "type": "General Support & Requests",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Ali Greer",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "2026-01-30",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 6160
  },
  {
    "id": "csv_1176",
    "owner": "Nick",
    "title": "Correct kicker tiering for amBDRs",
    "nextAction": "The formula was going up to 120 for the first tier and starting at 121 leaving out what was between the two. This is corrected now.",
    "additionalInfo": "",
    "entryDate": "2026-01-30",
    "type": "General Support & Requests",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Bryson Stewart",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "2026-01-30",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 6350
  },
  {
    "id": "csv_1177",
    "owner": "Nick",
    "title": "Clawback Inquiries from Chase",
    "nextAction": "Researched, answered, left notes on cases, and made changes where needed.",
    "additionalInfo": "All clawback inquiries responded to and closed out.",
    "entryDate": "2026-01-30",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Chase Parks",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "2026-01-30",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 6540
  },
  {
    "id": "csv_1178",
    "owner": "Dan",
    "title": "Billing Internal Case Creation Notice",
    "nextAction": "Start it",
    "additionalInfo": "sbu-cc-billing\nxbu-cc-billing",
    "entryDate": "2026-01-30",
    "type": "General Projects",
    "project": "TS - Zapier",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "15",
    "requester": "",
    "department": "Customer Care",
    "requesterName": "Chris Allan",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-16",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 4830
  },
  {
    "id": "csv_1179",
    "owner": "Dan",
    "title": "Billing Internal Case Close Notice",
    "nextAction": "Start it",
    "additionalInfo": "",
    "entryDate": "2026-01-30",
    "type": "General Projects",
    "project": "TS - Zapier",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "15",
    "requester": "",
    "department": "Customer Care",
    "requesterName": "Chris Allan",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 5020
  },
  {
    "id": "csv_1180",
    "owner": "Nick",
    "title": "Override the event tag to the outbound tag for Nathan to get his multiplier",
    "nextAction": "",
    "additionalInfo": "Overriding the lead source in CIQ with the correct lead source will allow the opp to flow right into the outbound spif portion of the AE plans.",
    "entryDate": "2026-01-30",
    "type": "General Support & Requests",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Nathan Taylor",
    "projectedStartDate": "2026-01-30",
    "projectedEndDate": "2026-01-30",
    "actualStartDate": "2026-01-30",
    "actualEndDate": "2026-01-30",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 6730
  },
  {
    "id": "csv_1181",
    "owner": "Nick",
    "title": "Clawback research",
    "nextAction": "remove clawback from chase as a gcx project was attached to his opp that should not have been.",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "General Support & Requests",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Chase Parks",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-02",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 6920
  },
  {
    "id": "csv_1182",
    "owner": "Nick",
    "title": "Update Pop file with leader data",
    "nextAction": "Copy and paste leader infor in for 2026",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Documentation",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-02",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 7110
  },
  {
    "id": "csv_1183",
    "owner": "Mary",
    "title": "Commission Plan for Steve Smeltz",
    "nextAction": "Signed off by Clinton and sent via docusign",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "NonSales - Leadership",
    "requesterName": "Clinton Brady",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-02",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 22310
  },
  {
    "id": "csv_1184",
    "owner": "Dan",
    "title": "Quilt Bookings Summary - Reve Ops Review",
    "nextAction": "High Prio- reference Quilt Bookings Summary v09",
    "additionalInfo": "Silas put together the original",
    "entryDate": "2026-02-02",
    "type": "General Projects",
    "project": "G2026 - Documentation",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "Critical",
    "points": "10",
    "requester": "",
    "department": "Finance",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 5210
  },
  {
    "id": "csv_1185",
    "owner": "Mary",
    "title": "Submit BRD about button - refer to conversation with Silas/Peter",
    "nextAction": "Submitted BRD",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-02",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 22500
  },
  {
    "id": "csv_1186",
    "owner": "Mary",
    "title": "Umer payout for January",
    "nextAction": "Signed off - sent to Candace",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Umer Shahid",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-02",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 22690
  },
  {
    "id": "csv_1187",
    "owner": "Mary",
    "title": "Kyle Payton - aligned in the forecast sheet, get him in a pod? pod green. weekly forecast.",
    "nextAction": "Work with Dan to align Kyle to Pod Green. Get Kyle in the form.",
    "additionalInfo": "Forward him forecast holder",
    "entryDate": "2026-02-02",
    "type": "General Projects",
    "project": "G2026 - Master Workbooks",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-06",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 22880
  },
  {
    "id": "csv_1188",
    "owner": "Dan",
    "title": "Add Kyle Payton - to Consolidated Forecast - 2026",
    "nextAction": "",
    "additionalInfo": "New, Green, Add to ActualLoad",
    "entryDate": "2026-02-02",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - Forecast",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "6",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 5400
  },
  {
    "id": "csv_1189",
    "owner": "Nick",
    "title": "Payroll Process - Jan 2026",
    "nextAction": "- Audit x \n- SPIF/Adj x\n- Preview Sheet- Add Mike and Nicole x\n- Inquires x\n- Merchant Services MBO x\n- Nathan MBO - July x\n- Check with Mike and Matthew on Luke and Roy for adj x\n- Add Estimate to Earnings x\n- Clawbacks x\n- Nicole Jan SPIF x\n- Note to Drew about the clawback bugx\n- Final Sheet to Drew x\n- Add to earnings File x",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "25",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "",
    "projectedStartDate": "2026-02-03",
    "projectedEndDate": "2026-02-13",
    "actualStartDate": "2026-02-03",
    "actualEndDate": "2026-02-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 7300
  },
  {
    "id": "csv_1190",
    "owner": "Nick",
    "title": "Review POC - Clawback Oppty.mov in the SFDC-Sprint-Testers Channel",
    "nextAction": "Review and give feedback",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "General Support & Requests",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Neil Buen",
    "projectedStartDate": "2026-02-04",
    "projectedEndDate": "2026-02-04",
    "actualStartDate": "2026-02-04",
    "actualEndDate": "2026-02-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 7490
  },
  {
    "id": "csv_1191",
    "owner": "Mary",
    "title": "new markt pos products & pricing updates",
    "nextAction": "all products added/updated save or messaging assistant",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "NonSales - Leadership",
    "requesterName": "Luke Henry",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-06",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 23070
  },
  {
    "id": "csv_1192",
    "owner": "Dan",
    "title": "Pod Red - Brain S 0.00 Allocation for Mig. Don't show. When Migration.",
    "nextAction": "Done",
    "additionalInfo": "Blacked out Brian when he shows up for migration",
    "entryDate": "2026-02-03",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - LA4.0 Maintenance & Delivery",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-03",
    "projectedEndDate": "2026-02-03",
    "actualStartDate": "2026-02-03",
    "actualEndDate": "2026-02-03",
    "comment": "Pete request: https://quilt-xbu.slack.com/files/U04BA66H0SD/F0ADJ8WBQ1E/image.png",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 5590
  },
  {
    "id": "csv_1193",
    "owner": "Dan",
    "title": "Connor Prindle - AI Analysis on Demo for Ind specific calls",
    "nextAction": "Confirm with Mary",
    "additionalInfo": "I believe this is requires 1. a net new field, 2. Is better fit for Megan.",
    "entryDate": "2025-10-01",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 5780
  },
  {
    "id": "csv_1194",
    "owner": "Nick",
    "title": "Update COO Analysis into Dashboard",
    "nextAction": "Change from Analysis to dash and add requested items",
    "additionalInfo": "Built into Dash but need to find time to bring in additional data points.",
    "entryDate": "2026-02-04",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - One Offs",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "14",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 7680
  },
  {
    "id": "csv_1195",
    "owner": "Nick",
    "title": "Update All Hands Reference and Deck",
    "nextAction": "Updated the reference sheet and the Slide deck",
    "additionalInfo": "",
    "entryDate": "2026-02-04",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM- Sales All Hands",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-04",
    "projectedEndDate": "2026-02-04",
    "actualStartDate": "2026-02-04",
    "actualEndDate": "2026-02-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 7870
  },
  {
    "id": "csv_1196",
    "owner": "Dan",
    "title": "t95 - \"Next up order\", to the left of their name",
    "nextAction": "Update the daily Slack message wtih coefficient",
    "additionalInfo": "Ranking and Scoring added to all pods",
    "entryDate": "2026-02-04",
    "type": "General Projects",
    "project": "G2026 - LA4.0 Maintenance & Delivery",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "10",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-04",
    "projectedEndDate": "",
    "actualStartDate": "2026-02-04",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 5970
  },
  {
    "id": "csv_1197",
    "owner": "Nick",
    "title": "Update Summer's GRR in CIQ",
    "nextAction": "Update CIQ",
    "additionalInfo": "",
    "entryDate": "2026-02-04",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "",
    "projectedStartDate": "2026-02-04",
    "projectedEndDate": "2026-02-04",
    "actualStartDate": "2026-02-04",
    "actualEndDate": "2026-02-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 8060
  },
  {
    "id": "csv_1198",
    "owner": "Nick",
    "title": "amBDR Adjustments",
    "nextAction": "Discussed with Mike and set up a meeting later today to get all the info needed for Roy, Luke, and Eva's adjustments",
    "additionalInfo": "Meeting this afternoon",
    "entryDate": "2026-02-04",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Flemming",
    "projectedStartDate": "2026-02-04",
    "projectedEndDate": "2026-02-04",
    "actualStartDate": "2026-02-04",
    "actualEndDate": "2026-02-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 8250
  },
  {
    "id": "csv_1199",
    "owner": "Dan",
    "title": "Pod Red  - LA4.0 hourly ranking checker",
    "nextAction": "Completed",
    "additionalInfo": "May end up not needing, as it dupe wtih above",
    "entryDate": "2026-02-04",
    "type": "General Projects",
    "project": "G2026 - LA4.0 Maintenance & Delivery",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "7",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-04",
    "projectedEndDate": "2026-02-04",
    "actualStartDate": "2026-02-04",
    "actualEndDate": "2026-02-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 6160
  },
  {
    "id": "csv_1200",
    "owner": "Dan",
    "title": "LA 4.0 - Mig / Farm ranking not working",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 6350
  },
  {
    "id": "csv_1201",
    "owner": "Mary",
    "title": "Addendum for Amit",
    "nextAction": "Sent & Signed",
    "additionalInfo": "",
    "entryDate": "2026-02-05",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-04",
    "projectedEndDate": "2026-02-04",
    "actualStartDate": "2026-02-09",
    "actualEndDate": "2026-02-09",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 23260
  },
  {
    "id": "csv_1202",
    "owner": "Nick",
    "title": "Mike Payment Adjustment",
    "nextAction": "Added to CIQ and noted to add to comp sheet.",
    "additionalInfo": "Added filters to CIQ and Audit sheet. Turned the coefficients off on the audit sheet to stop from updating.",
    "entryDate": "2026-02-05",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Flemming",
    "projectedStartDate": "2026-02-05",
    "projectedEndDate": "2026-02-05",
    "actualStartDate": "2026-02-05",
    "actualEndDate": "2026-02-05",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 8440
  },
  {
    "id": "csv_1203",
    "owner": "Nick",
    "title": "UAT Testing for Close Date BRD",
    "nextAction": "Test",
    "additionalInfo": "",
    "entryDate": "2026-02-05",
    "type": "Tech Stack Maintenance",
    "project": "TS - SFDC",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Kyle Monteiro",
    "projectedStartDate": "2026-02-06",
    "projectedEndDate": "2026-02-06",
    "actualStartDate": "2026-02-10",
    "actualEndDate": "2026-02-10",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 8630
  },
  {
    "id": "csv_1204",
    "owner": "Dan",
    "title": "LA 4.0 -  output-scoring (math not aligned with LA3.0)",
    "nextAction": "Done",
    "additionalInfo": "The math/ formula was correct and augmentation needed to be aligned.",
    "entryDate": "2026-02-05",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - LA4.0 Maintenance & Delivery",
    "status": "Completed",
    "statusReason": "Closed",
    "priority": "Critical",
    "points": "8",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-05",
    "projectedEndDate": "2026-02-05",
    "actualStartDate": "2026-02-05",
    "actualEndDate": "2026-02-05",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 6540
  },
  {
    "id": "csv_1205",
    "owner": "Nick",
    "title": "Add SPIF sheet to all plans in CIQ",
    "nextAction": "Added to all plans",
    "additionalInfo": "SPIF sheet, Payout summary, added to overall payout, and section in all statements.",
    "entryDate": "2026-02-05",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-05",
    "projectedEndDate": "2026-02-05",
    "actualStartDate": "2026-02-05",
    "actualEndDate": "2026-02-05",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 8820
  },
  {
    "id": "csv_1206",
    "owner": "Dan",
    "title": "LA4.0 - Upgrade/Cross Sell scoring on Output-scoring",
    "nextAction": "This is not working currently",
    "additionalInfo": "Cell CO5 says \"AIM eCommerce\" and wants to match in \"Brand/Industry\" \nThis will not work for sure. \nIdentifying what / how it should reference. Brand & cohort product??",
    "entryDate": "2026-02-05",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - LA4.0 Maintenance & Delivery",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "High",
    "points": "9",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-05",
    "projectedEndDate": "",
    "actualStartDate": "2026-02-05",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 6730
  },
  {
    "id": "csv_1207",
    "owner": "Mary",
    "title": "Productivity Analysis for Sales",
    "nextAction": "Sent final to Kyle J.",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "15",
    "requester": "",
    "department": "Finance",
    "requesterName": "Kyle Johnson",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-06",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-06",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 23450
  },
  {
    "id": "csv_1208",
    "owner": "Mary",
    "title": "Product Export & Analysis",
    "nextAction": "Sent final to Kyle J.",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "20",
    "requester": "",
    "department": "Finance",
    "requesterName": "Kyle Johnson",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-06",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-09",
    "comment": "Add other lines if there continues to be adjustments made",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 23640
  },
  {
    "id": "csv_1209",
    "owner": "Mary",
    "title": "Bookings Cube Review",
    "nextAction": "Signed Off",
    "additionalInfo": "",
    "entryDate": "2026-02-02",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "20",
    "requester": "",
    "department": "Finance",
    "requesterName": "Kyle Johnson",
    "projectedStartDate": "2026-02-02",
    "projectedEndDate": "2026-02-04",
    "actualStartDate": "2026-02-02",
    "actualEndDate": "2026-02-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 23830
  },
  {
    "id": "csv_1210",
    "owner": "Mary",
    "title": "Amit Phander - Addendum",
    "nextAction": "Peter signed off - sent for signature",
    "additionalInfo": "",
    "entryDate": "2026-02-03",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-03",
    "projectedEndDate": "2026-02-06",
    "actualStartDate": "2026-02-03",
    "actualEndDate": "2026-02-09",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 24020
  },
  {
    "id": "csv_1211",
    "owner": "Dan",
    "title": "Update SBUCalendly events to be schedule-able EST 8 am - 7 pm",
    "nextAction": "ended up reverting.",
    "additionalInfo": "",
    "entryDate": "2026-02-06",
    "type": "Tech Stack Maintenance",
    "project": "TS - Calendly",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-06",
    "projectedEndDate": "2026-02-06",
    "actualStartDate": "2026-02-06",
    "actualEndDate": "2026-02-06",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 6920
  },
  {
    "id": "csv_1212",
    "owner": "Dan",
    "title": "Forecast 2026 - Chris comments",
    "nextAction": "Pending Chris' reply.",
    "additionalInfo": "He thinks the percantages are off at pMRR/GPV section, col G",
    "entryDate": "2026-02-06",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - Forecast",
    "status": "In Progress",
    "statusReason": "Clarification Required",
    "priority": "Low",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Chris Allan",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 7110
  },
  {
    "id": "csv_1213",
    "owner": "Nick",
    "title": "Test Clawback Flow",
    "nextAction": "Test clawback creation in sandbox.",
    "additionalInfo": "Running into errors on about every opp type. Taking more time than expected.",
    "entryDate": "2026-02-09",
    "type": "Tech Stack Maintenance",
    "project": "TS - SFDC",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "6",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Neil Buen",
    "projectedStartDate": "2026-02-09",
    "projectedEndDate": "2026-02-09",
    "actualStartDate": "2026-02-09",
    "actualEndDate": "2026-02-09",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 9010
  },
  {
    "id": "csv_1214",
    "owner": "Nick",
    "title": "CIQ Approval build/Test",
    "nextAction": "Build inquiry with approval to Peter",
    "additionalInfo": "Test with Tyler. Sent 15 minute meeting for Wednesday. Tested with Tyler and appears to work.\nNext step, talk through the inquiry form with Mary. we should ask questions separately for adjustments and spifs.\nBuilding in the questions. See related line below.",
    "entryDate": "2026-02-09",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "10",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-09",
    "projectedEndDate": "2026-02-11",
    "actualStartDate": "2026-02-09",
    "actualEndDate": "2026-02-11",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 9200
  },
  {
    "id": "csv_1215",
    "owner": "Nick",
    "title": "Carlie oBDR Calculator check",
    "nextAction": "Went over Carlie's calculator for 2026",
    "additionalInfo": "Onlyt thing I advised was that she was giving the full tier 3 kicker to deal 17 when that would not be true. Only 3/4ths of the deal would receive the top kicker while 1/4th would receive the lower tiered kicker.",
    "entryDate": "2026-02-09",
    "type": "General Support & Requests",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Sales - BDR",
    "requesterName": "Carlie Taylor",
    "projectedStartDate": "2026-02-09",
    "projectedEndDate": "2026-02-09",
    "actualStartDate": "2026-02-09",
    "actualEndDate": "2026-02-09",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 9390
  },
  {
    "id": "csv_1216",
    "owner": "Nick",
    "title": "Update Feb SPIF for ASI Tri Tech Demos",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-02-10",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Flemming",
    "projectedStartDate": "2026-02-10",
    "projectedEndDate": "2026-02-10",
    "actualStartDate": "2026-02-10",
    "actualEndDate": "2026-02-10",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 9580
  },
  {
    "id": "csv_1217",
    "owner": "Nick",
    "title": "Research and fix Eva's call count in CIQ",
    "nextAction": "I updated the created by role to amBDR and now refreshing the CIQ data",
    "additionalInfo": "Nothing pulling in from SBU until the 6th because that is when her role was changed to amBDR",
    "entryDate": "2026-02-10",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - BDR",
    "requesterName": "Eva Skenandore",
    "projectedStartDate": "2026-02-10",
    "projectedEndDate": "2026-02-10",
    "actualStartDate": "2026-02-10",
    "actualEndDate": "2026-02-10",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 9770
  },
  {
    "id": "csv_1218",
    "owner": "Nick",
    "title": "More Clawback Flow testing",
    "nextAction": "Met with Neil on the clawback flow and ironed out what needs to happen.",
    "additionalInfo": "Will wait for his go ahead to test again.",
    "entryDate": "2026-02-10",
    "type": "Tech Stack Maintenance",
    "project": "TS - SFDC",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Neil Buen",
    "projectedStartDate": "2026-02-10",
    "projectedEndDate": "2026-02-10",
    "actualStartDate": "2026-02-10",
    "actualEndDate": "2026-02-10",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 9960
  },
  {
    "id": "csv_1219",
    "owner": "Mary",
    "title": "Help with Sub Clean up MS",
    "nextAction": "Have helped Silas - waiting for merging Direction",
    "additionalInfo": "",
    "entryDate": "2026-02-10",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "Critical",
    "points": "10",
    "requester": "",
    "department": "Finance",
    "requesterName": "Kyle Johnson",
    "projectedStartDate": "2026-02-10",
    "projectedEndDate": "2026-02-12",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 24210
  },
  {
    "id": "csv_1220",
    "owner": "Mary",
    "title": "Make a booking link for all admins",
    "nextAction": "Completed  but need to investigate timings",
    "additionalInfo": "",
    "entryDate": "2026-02-10",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Low",
    "points": "2",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Lisa Haigy",
    "projectedStartDate": "2026-02-10",
    "projectedEndDate": "2026-02-12",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 24400
  },
  {
    "id": "csv_1221",
    "owner": "Mary",
    "title": "Dealhub - Approvals for billing notes",
    "nextAction": "Pushed 2/12/2026",
    "additionalInfo": "",
    "entryDate": "2026-02-10",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-10",
    "projectedEndDate": "2026-02-12",
    "actualStartDate": "2026-02-11",
    "actualEndDate": "2026-02-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 24590
  },
  {
    "id": "csv_1222",
    "owner": "Nick",
    "title": "Clawback Bug",
    "nextAction": "researched the list provided by cx and found the clawbacks that needed moved to closed lost.",
    "additionalInfo": "Updated the opps to closed lost.",
    "entryDate": "2026-02-10",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-10",
    "projectedEndDate": "2026-02-10",
    "actualStartDate": "2026-02-10",
    "actualEndDate": "2026-02-10",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 10150
  },
  {
    "id": "csv_1223",
    "owner": "Nick",
    "title": "COO SPIF for amBDRs",
    "nextAction": "Build the SPIF and enter into CIQ",
    "additionalInfo": "",
    "entryDate": "2026-02-10",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Flemming",
    "projectedStartDate": "2026-02-10",
    "projectedEndDate": "2026-02-11",
    "actualStartDate": "2026-02-10",
    "actualEndDate": "2026-02-11",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 10340
  },
  {
    "id": "csv_1224",
    "owner": "Nick",
    "title": "Tyler's CIQ Build",
    "nextAction": "Build plan in CIQ",
    "additionalInfo": "",
    "entryDate": "2026-02-11",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "15",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-11",
    "projectedEndDate": "2026-02-13",
    "actualStartDate": "2026-02-11",
    "actualEndDate": "2026-02-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 10530
  },
  {
    "id": "csv_1225",
    "owner": "Nick",
    "title": "Mike's CIQ Build",
    "nextAction": "Build plan in CIQ",
    "additionalInfo": "Finish final component and Summary tabs. Build Statement.",
    "entryDate": "2026-02-11",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "15",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-16",
    "projectedEndDate": "2026-02-18",
    "actualStartDate": "2026-02-16",
    "actualEndDate": "2026-02-19",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 10720
  },
  {
    "id": "csv_1226",
    "owner": "Nick",
    "title": "Chris' CIQ Build",
    "nextAction": "Build plan in CIQ",
    "additionalInfo": "Continue building out the rest of ipMRR. Build GRR. Build Statement",
    "entryDate": "2026-02-11",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "15",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-18",
    "projectedEndDate": "2026-02-20",
    "actualStartDate": "2026-02-19",
    "actualEndDate": "2026-02-24",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 10910
  },
  {
    "id": "csv_1227",
    "owner": "Mary",
    "title": "Surcharge Work - March 1",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-02-11",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-11",
    "projectedEndDate": "2026-02-11",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 24780
  },
  {
    "id": "csv_1228",
    "owner": "Mary",
    "title": "Add Product (see Duane message in product channel)",
    "nextAction": "Product added - waiting to see if we get a description but will update that later no problem",
    "additionalInfo": "",
    "entryDate": "2026-02-11",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Fulfillment",
    "requesterName": "Duane Brennan",
    "projectedStartDate": "2026-02-11",
    "projectedEndDate": "2026-02-11",
    "actualStartDate": "2026-02-12",
    "actualEndDate": "2026-02-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 24970
  },
  {
    "id": "csv_1229",
    "owner": "Mary",
    "title": "Reach out to Michael Carroll about RingDNA",
    "nextAction": "Michael scheduled a call for tomorrow",
    "additionalInfo": "",
    "entryDate": "2026-02-12",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-16",
    "projectedEndDate": "2026-02-16",
    "actualStartDate": "2026-02-17",
    "actualEndDate": "2026-02-17",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 25160
  },
  {
    "id": "csv_1230",
    "owner": "Nick",
    "title": "Cleaned up Payout naming conventions to align across all plan",
    "nextAction": "",
    "additionalInfo": "Changing the sames of payout summaries breaks what is in the statements, so also cleaned those up after.",
    "entryDate": "2026-02-12",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-12",
    "projectedEndDate": "2026-02-12",
    "actualStartDate": "2026-02-12",
    "actualEndDate": "2026-02-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 11100
  },
  {
    "id": "csv_1231",
    "owner": "Nick",
    "title": "Enter Mike's additional Adjustments",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-02-12",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Flemming",
    "projectedStartDate": "2026-02-12",
    "projectedEndDate": "2026-02-12",
    "actualStartDate": "2026-02-12",
    "actualEndDate": "2026-02-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 11290
  },
  {
    "id": "csv_1232",
    "owner": "Nick",
    "title": "Created Sales and Non Sales SPIFs",
    "nextAction": "Label on adjustment sheet",
    "additionalInfo": "Labeled for Jan. Need to create the different sheets in the plans next. Additional SPIF sheets and summaries were created in all BDR and AE plans. including TLs.",
    "entryDate": "2026-02-12",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "6",
    "requester": "",
    "department": "Finance",
    "requesterName": "Drew Lewis",
    "projectedStartDate": "2026-02-12",
    "projectedEndDate": "2026-02-12",
    "actualStartDate": "2026-02-12",
    "actualEndDate": "2026-02-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 11480
  },
  {
    "id": "csv_1233",
    "owner": "Mary",
    "title": "Write SOP edit for last section. Announce for team",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-02-12",
    "type": "General Projects",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-12",
    "projectedEndDate": "2026-02-17",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 25350
  },
  {
    "id": "csv_1234",
    "owner": "Mary",
    "title": "Schedule automation UAT meeting",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-02-12",
    "type": "General Projects",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-12",
    "projectedEndDate": "2026-02-17",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 25540
  },
  {
    "id": "csv_1235",
    "owner": "Mary",
    "title": "Review SOP for BRD",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-02-12",
    "type": "General Projects",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-12",
    "projectedEndDate": "2026-02-17",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 25730
  },
  {
    "id": "csv_1236",
    "owner": "Mary",
    "title": "Updated Plan for Tom Vail and Ivy Lease",
    "nextAction": "Completed and sent to Matthew",
    "additionalInfo": "",
    "entryDate": "2026-02-12",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "5",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Matthew Jacobus",
    "projectedStartDate": "2026-02-13",
    "projectedEndDate": "2026-02-13",
    "actualStartDate": "2026-02-13",
    "actualEndDate": "2026-02-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 25920
  },
  {
    "id": "csv_1237",
    "owner": "Mary",
    "title": "do knowb4",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-02-12",
    "type": "Internal To Do",
    "project": "Not Applicable",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-16",
    "projectedEndDate": "2026-02-16",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 26110
  },
  {
    "id": "csv_1238",
    "owner": "Nick",
    "title": "Inform Drew of CC changes and Get input on Managed Chargebacks",
    "nextAction": "Emailed and Slacked Drew",
    "additionalInfo": "Sent Candace a sheet of CC OTV to help with their estimates",
    "entryDate": "2026-02-13",
    "type": "General Support & Requests",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-13",
    "projectedEndDate": "2026-02-13",
    "actualStartDate": "2026-02-13",
    "actualEndDate": "2026-02-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 11670
  },
  {
    "id": "csv_1239",
    "owner": "Nick",
    "title": "Clawback Upload and Audit",
    "nextAction": "",
    "additionalInfo": "Keep an eye on the clawback automation. Seems to be live in xbu but not capturing everything.",
    "entryDate": "2026-02-16",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-16",
    "projectedEndDate": "2026-02-16",
    "actualStartDate": "2026-02-16",
    "actualEndDate": "2026-02-16",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 11860
  },
  {
    "id": "csv_1240",
    "owner": "Mary",
    "title": "SLA Override for Feb 16th and Feb 17th",
    "nextAction": "Completed",
    "additionalInfo": "",
    "entryDate": "2026-02-17",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Sales - BDR",
    "requesterName": "Matthew Jacobus",
    "projectedStartDate": "2026-02-17",
    "projectedEndDate": "2026-02-17",
    "actualStartDate": "2026-02-17",
    "actualEndDate": "2026-02-17",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 26300
  },
  {
    "id": "csv_1241",
    "owner": "Dan",
    "title": "Forecast 2026 - XBU Pod total",
    "nextAction": "Completed",
    "additionalInfo": "Formulas were copied down, while the view was filtered and not penetrate all the way",
    "entryDate": "2026-02-17",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Master Workbooks",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-17",
    "projectedEndDate": "2026-02-17",
    "actualStartDate": "2026-02-17",
    "actualEndDate": "2026-02-17",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 7300
  },
  {
    "id": "csv_1242",
    "owner": "Dan",
    "title": "Migration Non-recuuring , back into Migratoin. Out of \"New\"",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 7490
  },
  {
    "id": "csv_1243",
    "owner": "Mary",
    "title": "Look into amit's opps",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 26490
  },
  {
    "id": "csv_1244",
    "owner": "Nick",
    "title": "Clawback clean up and flow research",
    "nextAction": "Neil is fixing the created date in the flow. I will be fixing the created date on the 2 XBU opps that have past year created dates.",
    "additionalInfo": "",
    "entryDate": "2026-02-17",
    "type": "Tech Stack Maintenance",
    "project": "TS - SFDC",
    "status": "Completed",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Nick Crouch",
    "projectedStartDate": "2026-02-17",
    "projectedEndDate": "2026-02-17",
    "actualStartDate": "2026-02-17",
    "actualEndDate": "2026-02-17",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 12050
  },
  {
    "id": "csv_1245",
    "owner": "Dan",
    "title": "Update \"Team Lead\" to say \"Sales Manager\" in all files",
    "nextAction": "Wait til I'm fully returned from Parental Leave",
    "additionalInfo": "This update will need to be made across multiple files, and possible formulas and referenced cell updates",
    "entryDate": "2026-02-17",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Master Workbooks",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Low",
    "points": "7",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-04-01",
    "projectedEndDate": "",
    "actualStartDate": "2026-02-17",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 7680
  },
  {
    "id": "csv_1246",
    "owner": "Nick",
    "title": "Ali Clawback remove and SPIF add",
    "nextAction": "Removed the clawback and added a the SPIF for the cross sell now",
    "additionalInfo": "",
    "entryDate": "2026-02-17",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-17",
    "projectedEndDate": "2026-02-17",
    "actualStartDate": "2026-02-17",
    "actualEndDate": "2026-02-17",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 12240
  },
  {
    "id": "csv_1247",
    "owner": "Nick",
    "title": "Add SPIF and Adj inquiry fields",
    "nextAction": "Review them on Friday meeting",
    "additionalInfo": "",
    "entryDate": "2026-02-17",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-17",
    "projectedEndDate": "2026-02-17",
    "actualStartDate": "2026-02-17",
    "actualEndDate": "2026-02-17",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 12430
  },
  {
    "id": "csv_1248",
    "owner": "Nick",
    "title": "Payroll SOP",
    "nextAction": "Created a Payroll SOP Word doc",
    "additionalInfo": "Need to review and go over with Mary.",
    "entryDate": "2026-02-17",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-17",
    "projectedEndDate": "2026-02-18",
    "actualStartDate": "2026-02-17",
    "actualEndDate": "2026-02-18",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 12620
  },
  {
    "id": "csv_1249",
    "owner": "Dan",
    "title": "Turn off Payment/Upsell opps being assigned to amBDRs",
    "nextAction": "",
    "additionalInfo": "Mike requested here https://quilt-xbu.slack.com/archives/C098672ESHY/p1771273084401639",
    "entryDate": "",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 7870
  },
  {
    "id": "csv_1250",
    "owner": "Nick",
    "title": "Met with Kyle to confirm Sign Date requirements",
    "nextAction": "Test in sandbox",
    "additionalInfo": "",
    "entryDate": "2026-02-18",
    "type": "Tech Stack Maintenance",
    "project": "TS - SFDC",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Kyle Monteiro",
    "projectedStartDate": "2026-02-18",
    "projectedEndDate": "2026-02-18",
    "actualStartDate": "2026-02-18",
    "actualEndDate": "2026-02-18",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 12810
  },
  {
    "id": "csv_1251",
    "owner": "Nick",
    "title": "Test Sign date Close Date BRD in Sandbox",
    "nextAction": "Test in sandbox",
    "additionalInfo": "Tested SBU. have some errors trying to close in XBU. Will wait for the testing slack message and respond in there.Test again after Kyle finishes fixing errors in XBU",
    "entryDate": "2026-02-18",
    "type": "Tech Stack Maintenance",
    "project": "TS - SFDC",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-18",
    "projectedEndDate": "2026-02-18",
    "actualStartDate": "2026-02-19",
    "actualEndDate": "2026-02-24",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 13000
  },
  {
    "id": "csv_1252",
    "owner": "Mary",
    "title": "Move Hunter to bypass approvals",
    "nextAction": "Completed",
    "additionalInfo": "",
    "entryDate": "2026-02-18",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Low",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-20",
    "projectedEndDate": "2026-02-20",
    "actualStartDate": "2026-02-19",
    "actualEndDate": "2026-02-19",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 26680
  },
  {
    "id": "csv_1253",
    "owner": "Mary",
    "title": "Opp Team and Case Team for SMEs - TEST",
    "nextAction": "Test for Peter",
    "additionalInfo": "",
    "entryDate": "2026-02-19",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 26870
  },
  {
    "id": "csv_1254",
    "owner": "Mary",
    "title": "Send message reminder to testers about how they're risking their requests",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-02-19",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 27060
  },
  {
    "id": "csv_1255",
    "owner": "Nick",
    "title": "Fix Tony's plan",
    "nextAction": "Deleted the test opps that were messing up Tony's calculations",
    "additionalInfo": "Also removed him from peter's SF ID in the user override tab in CIQ",
    "entryDate": "2026-02-19",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Critical",
    "points": "3",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Tony Carly",
    "projectedStartDate": "2026-02-19",
    "projectedEndDate": "2026-02-19",
    "actualStartDate": "2026-02-19",
    "actualEndDate": "2026-02-19",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 13190
  },
  {
    "id": "csv_1256",
    "owner": "Dan",
    "title": "Quilt | GuidCX Tag At Risk Notification | #quilt-onboarding-at-risk",
    "nextAction": "Completed",
    "additionalInfo": "the flow wasn't working when multiple records hit together. This is fixed.",
    "entryDate": "2026-02-19",
    "type": "Tech Stack Maintenance",
    "project": "TS - Zapier",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "6",
    "requester": "",
    "department": "Customer Experience",
    "requesterName": "Will Thomas",
    "projectedStartDate": "2026-02-18",
    "projectedEndDate": "2026-02-19",
    "actualStartDate": "2026-02-18",
    "actualEndDate": "2026-02-19",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 8060
  },
  {
    "id": "csv_1257",
    "owner": "Dan",
    "title": "Master - Performance = FY Quota",
    "nextAction": "",
    "additionalInfo": "COL AA [FY Quota] is nto fully aligned yet.",
    "entryDate": "2026-02-19",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Master Workbooks",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Daniel Hall",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 8250
  },
  {
    "id": "csv_1258",
    "owner": "Nick",
    "title": "Peter's CIQ Build",
    "nextAction": "Build plan in CIQ",
    "additionalInfo": "4 of 5 components built. Need to do GRR next week. GRR and Adjustments added. Statement completed.",
    "entryDate": "2026-02-19",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "17",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-23",
    "projectedEndDate": "2026-02-25",
    "actualStartDate": "2026-02-26",
    "actualEndDate": "2026-03-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 13380
  },
  {
    "id": "csv_1259",
    "owner": "Nick",
    "title": "Clawback upload/management",
    "nextAction": "Make sure all clawbacks that should have been created were/add 2025 clawbacks to the adjustment sheet",
    "additionalInfo": "Fix Clawback formula to return 0 and also add a status column. AE, eAE, and TL plans",
    "entryDate": "2026-02-20",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "6",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-20",
    "projectedEndDate": "2026-02-20",
    "actualStartDate": "2026-02-20",
    "actualEndDate": "2026-02-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 13570
  },
  {
    "id": "csv_1260",
    "owner": "Nick",
    "title": "NRR Analysis",
    "nextAction": "report that shows us NRR $ sold and discount given over time by rep/industry",
    "additionalInfo": "",
    "entryDate": "2026-02-20",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "NonSales - Leadership",
    "requesterName": "Clinton Brady",
    "projectedStartDate": "2026-02-20",
    "projectedEndDate": "2026-02-20",
    "actualStartDate": "2026-02-20",
    "actualEndDate": "2026-02-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 13760
  },
  {
    "id": "csv_1261",
    "owner": "Mary",
    "title": "Carter at Tradeshow",
    "nextAction": "Flip him Wednesday",
    "additionalInfo": "",
    "entryDate": "2025-02-23",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 27250
  },
  {
    "id": "csv_1262",
    "owner": "Nick",
    "title": "Build on payroll SOP",
    "nextAction": "Create word doc 2.0",
    "additionalInfo": "",
    "entryDate": "2025-02-23",
    "type": "General Support & Requests",
    "project": "G2026 - Commissions",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-23",
    "projectedEndDate": "2026-02-23",
    "actualStartDate": "2026-02-23",
    "actualEndDate": "2026-02-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 13950
  },
  {
    "id": "csv_1263",
    "owner": "Nick",
    "title": "Look into clawbacks for Tyler",
    "nextAction": "Both of Ali's clawbacks",
    "additionalInfo": "",
    "entryDate": "2025-02-23",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-23",
    "projectedEndDate": "2026-02-23",
    "actualStartDate": "2026-02-23",
    "actualEndDate": "2026-02-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 14140
  },
  {
    "id": "csv_1264",
    "owner": "Nick",
    "title": "Investigate Closed Lost SPIF",
    "nextAction": "Inspected each closed won opp for feb that had the parent opp field filled in",
    "additionalInfo": "I believe the current spif build is working.",
    "entryDate": "2025-02-23",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-23",
    "projectedEndDate": "2026-02-23",
    "actualStartDate": "2026-02-23",
    "actualEndDate": "2026-02-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 14330
  },
  {
    "id": "csv_1265",
    "owner": "Nick",
    "title": "Build rapid deposit SPIF",
    "nextAction": "Add to SPIF tracker",
    "additionalInfo": "",
    "entryDate": "2025-02-23",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Chris Allan",
    "projectedStartDate": "2026-02-23",
    "projectedEndDate": "2026-02-23",
    "actualStartDate": "2026-02-23",
    "actualEndDate": "2026-02-23",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 14520
  },
  {
    "id": "csv_1266",
    "owner": "Nick",
    "title": "Add Tom Vail to iBDR",
    "nextAction": "added to CIQ",
    "additionalInfo": "He is added in the ibdr plan. Need to go over best step for base rates pulling in the role start and end dates. Will bring up in 1 on 1",
    "entryDate": "2026-02-24",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-23",
    "projectedEndDate": "2026-02-24",
    "actualStartDate": "2026-02-23",
    "actualEndDate": "2026-02-24",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 14710
  },
  {
    "id": "csv_1267",
    "owner": "Nick",
    "title": "NRR Analysis/Imp Fee",
    "nextAction": "Bring in Total and sale price. break out by package, industry and rep",
    "additionalInfo": "Broke out package by industry",
    "entryDate": "2026-02-24",
    "type": "General Support & Requests",
    "project": "GSR - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "7",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Clinton Brady",
    "projectedStartDate": "2026-02-24",
    "projectedEndDate": "2026-02-24",
    "actualStartDate": "2026-02-24",
    "actualEndDate": "2026-02-26",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 14900
  },
  {
    "id": "csv_1268",
    "owner": "Nick",
    "title": "Add seperate tables for ABC decelerator and Response time",
    "nextAction": "Build into statements in CIQ",
    "additionalInfo": "Response time complete. Need to do the same for ABC Decelerator",
    "entryDate": "2026-02-24",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "3",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-25",
    "projectedEndDate": "2026-02-25",
    "actualStartDate": "2026-02-25",
    "actualEndDate": "2026-02-25",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 15090
  },
  {
    "id": "csv_1269",
    "owner": "Nick",
    "title": "Clean out 2025 data in CIQ",
    "nextAction": "Remove all 2025 roles, quota, etc from CIQ",
    "additionalInfo": "",
    "entryDate": "2026-02-24",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-25",
    "projectedEndDate": "2026-02-25",
    "actualStartDate": "2026-02-25",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 15280
  },
  {
    "id": "csv_1270",
    "owner": "Nick",
    "title": "Matthew Inquiry",
    "nextAction": "Researched and fixed inquiry Matthew submitted",
    "additionalInfo": "",
    "entryDate": "2026-02-25",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Matthew Jacobus",
    "projectedStartDate": "2026-02-25",
    "projectedEndDate": "2026-02-25",
    "actualStartDate": "2026-02-25",
    "actualEndDate": "2026-02-25",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 15470
  },
  {
    "id": "csv_1271",
    "owner": "Dan",
    "title": "Consolidated Forecast - 2026.v2",
    "nextAction": "Simplify/Automate formulas for Rep Names currently in pod",
    "additionalInfo": "Use the \"Order\" field",
    "entryDate": "2026-02-25",
    "type": "General Projects",
    "project": "WBDM - Forecast",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "5",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Daniel Hall",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 8440
  },
  {
    "id": "csv_1272",
    "owner": "Dan",
    "title": "Master - Performance.xlsx.v2",
    "nextAction": "A",
    "additionalInfo": "Attainment Sections",
    "entryDate": "2026-02-25",
    "type": "General Projects",
    "project": "G2026 - Master Workbooks",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "18",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Daniel Hall",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 8630
  },
  {
    "id": "csv_1273",
    "owner": "Nick",
    "title": "Carter Inquiry",
    "nextAction": "Research the bookable MRR on Carter's opps",
    "additionalInfo": "Need some sort of documentation showing that the MRR is wrong. Everything was correct. Carter read wrong.",
    "entryDate": "2026-02-25",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Carter Memmott",
    "projectedStartDate": "2026-02-25",
    "projectedEndDate": "2026-02-25",
    "actualStartDate": "2026-02-25",
    "actualEndDate": "2026-03-05",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 15660
  },
  {
    "id": "csv_1274",
    "owner": "Nick",
    "title": "amBDR Call Count review",
    "nextAction": "Waiting on Leo to tell us how Tableau calculated call count",
    "additionalInfo": "Confirmed the call count is accurate. Confirmed Tableau counts all directions. Need to type up a message for Mike Fleming.",
    "entryDate": "2026-02-26",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "5",
    "requester": "",
    "department": "Sales - BDR",
    "requesterName": "Michael Voveris",
    "projectedStartDate": "2026-02-26",
    "projectedEndDate": "2026-02-27",
    "actualStartDate": "2026-02-25",
    "actualEndDate": "2026-02-27",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 15850
  },
  {
    "id": "csv_1275",
    "owner": "Nick",
    "title": "Label All Adjustment, Clawback, and SPIF entries in CIQ",
    "nextAction": "Clawbacks have all been labeled.",
    "additionalInfo": "Need to label all SPIF and Adj next",
    "entryDate": "2026-02-26",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-26",
    "projectedEndDate": "2026-02-26",
    "actualStartDate": "2026-02-26",
    "actualEndDate": "2026-02-26",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 16040
  },
  {
    "id": "csv_1276",
    "owner": "Dan",
    "title": "LA4.0 - Rezo System Insert",
    "nextAction": "",
    "additionalInfo": "Update Pod Black \"Outdoor\" field to be Rezo System. Swap the names, link, etc. out",
    "entryDate": "2026-02-26",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - LA4.0 Maintenance & Delivery",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 8820
  },
  {
    "id": "csv_1277",
    "owner": "Nick",
    "title": "Override Ali Close dates",
    "nextAction": "Override the close dates in CIQ on 4 opps to march",
    "additionalInfo": "",
    "entryDate": "2026-02-26",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-02-26",
    "projectedEndDate": "2026-02-26",
    "actualStartDate": "2026-02-26",
    "actualEndDate": "2026-02-26",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 16230
  },
  {
    "id": "csv_1278",
    "owner": "Nick",
    "title": "2025 Adj data into master earnings",
    "nextAction": "Move labeled data into the master earnings",
    "additionalInfo": "Asked Mary her thoughts on best way to go about.",
    "entryDate": "2026-02-26",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Master Workbooks",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-02-26",
    "projectedEndDate": "2026-02-27",
    "actualStartDate": "2026-02-26",
    "actualEndDate": "2026-02-27",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 16420
  },
  {
    "id": "csv_1279",
    "owner": "Nick",
    "title": "Mike and Mike checking on the ASI Migration SPIF",
    "nextAction": "Went over, again, how the formula is pulling the SPIF",
    "additionalInfo": "My guess is Mike F sent to Mike V and Mike V compared it to tableau for the first time.",
    "entryDate": "2026-02-27",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Flemming",
    "projectedStartDate": "2026-02-27",
    "projectedEndDate": "2026-02-27",
    "actualStartDate": "2026-02-27",
    "actualEndDate": "2026-02-27",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 16610
  },
  {
    "id": "csv_1280",
    "owner": "Nick",
    "title": "Assiting Taiza",
    "nextAction": "Helped her with a closed lost and an upload error",
    "additionalInfo": "Was getting the error that was mentioned in the support hub by Jordan.",
    "entryDate": "2026-02-27",
    "type": "General Support & Requests",
    "project": "TS - SFDC",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Business Ops",
    "requesterName": "Taiza Cole",
    "projectedStartDate": "2026-02-27",
    "projectedEndDate": "2026-02-27",
    "actualStartDate": "2026-02-27",
    "actualEndDate": "2026-02-27",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 16800
  },
  {
    "id": "csv_1281",
    "owner": "Nick",
    "title": "Clawback upload/management",
    "nextAction": "Make sure all clawbacks that should have been created were/add 2025 clawbacks to the adjustment sheet",
    "additionalInfo": "",
    "entryDate": "2026-02-27",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-27",
    "projectedEndDate": "2026-02-27",
    "actualStartDate": "2026-02-27",
    "actualEndDate": "2026-02-27",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 16990
  },
  {
    "id": "csv_1282",
    "owner": "Nick",
    "title": "EOM Commissions Review Reminder",
    "nextAction": "Sent",
    "additionalInfo": "",
    "entryDate": "2026-02-27",
    "type": "Internal To Do",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-02-27",
    "projectedEndDate": "2026-02-27",
    "actualStartDate": "2026-02-27",
    "actualEndDate": "2026-02-27",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 17180
  },
  {
    "id": "csv_1283",
    "owner": "Nick",
    "title": "Ryan Inquiry",
    "nextAction": "Missing outbound multiplier deal",
    "additionalInfo": "Corrected",
    "entryDate": "2026-03-02",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Ryan Christiansen",
    "projectedStartDate": "2026-03-02",
    "projectedEndDate": "2026-03-02",
    "actualStartDate": "2026-03-02",
    "actualEndDate": "2026-03-02",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 17370
  },
  {
    "id": "csv_1284",
    "owner": "Nick",
    "title": "Payroll Process - Feb 2026",
    "nextAction": "- Audit X\n- SPIF/Adj X\n- Preview Sheet X\n- Inquires X\n- Merchant Services MBO X\n- Nathan MBO - For July\n- Check with Mike and Matthew on any adj - X Tom stays as is and Ivy MBO entered\n- Add Estimate to Earnings X\n- Clawbacks X\n- Nicole Feb SPIF X\n- Final Sheet to Drew X\n- Add to earnings File X",
    "additionalInfo": "",
    "entryDate": "2026-03-02",
    "type": "Tech Stack Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "25",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "",
    "projectedStartDate": "2026-03-03",
    "projectedEndDate": "2026-03-13",
    "actualStartDate": "2026-03-03",
    "actualEndDate": "2026-03-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 17560
  },
  {
    "id": "csv_1285",
    "owner": "Dan",
    "title": "LA4.0  - Group setting re-wire",
    "nextAction": "A",
    "additionalInfo": "Any way to make group not nesessary for green, black, red?",
    "entryDate": "",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 9010
  },
  {
    "id": "csv_1286",
    "owner": "Nick",
    "title": "Fix the missing closed won deals for Kyle Inquiry",
    "nextAction": "Result of moving Allie's deals to march",
    "additionalInfo": "Thinking we give an adjustment for the missing opps and override him out as the owner for March.",
    "entryDate": "2026-03-02",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Sales - BDR",
    "requesterName": "Kyle Holcomb",
    "projectedStartDate": "2026-03-03",
    "projectedEndDate": "2026-03-03",
    "actualStartDate": "2026-03-03",
    "actualEndDate": "2026-03-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 17750
  },
  {
    "id": "csv_1287",
    "owner": "Dan",
    "title": "Forecast - Add Michael V",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "",
    "type": "",
    "project": "",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 9200
  },
  {
    "id": "csv_1288",
    "owner": "Dan",
    "title": "Forecast - update quota to be formulated  and not summed from individual",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-03-02",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Not Started",
    "statusReason": "",
    "priority": "Medium",
    "points": "0",
    "requester": "",
    "department": "",
    "requesterName": "",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 9390
  },
  {
    "id": "csv_1289",
    "owner": "Nick",
    "title": "Bryson Inquiry",
    "nextAction": "Researched and found the close date was changed to a feb date.",
    "additionalInfo": "I changed it back to Jan.",
    "entryDate": "2026-03-02",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "1",
    "requester": "",
    "department": "",
    "requesterName": "Bryson Stewart",
    "projectedStartDate": "2026-03-03",
    "projectedEndDate": "2026-03-03",
    "actualStartDate": "2026-03-03",
    "actualEndDate": "2026-03-03",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 17940
  },
  {
    "id": "csv_1290",
    "owner": "Nick",
    "title": "Investigate any others that may be duplicates from previous month",
    "nextAction": "Created reports in each SF BU to compare close date vs signed date",
    "additionalInfo": "Found some one off and an additional 3 for Amit. Correcting all",
    "entryDate": "2026-03-02",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-03",
    "projectedEndDate": "2026-03-03",
    "actualStartDate": "2026-03-03",
    "actualEndDate": "2026-03-03",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 18130
  },
  {
    "id": "csv_1291",
    "owner": "Nick",
    "title": "Brayden and Mike Vo Call Count",
    "nextAction": "They reached out saying the call count was off. I looked into the back end data and found around the amount Brayden said he should have.",
    "additionalInfo": "Seems like they just need to let the data refresh.",
    "entryDate": "2026-03-02",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - BDR",
    "requesterName": "Michael Voveris",
    "projectedStartDate": "2026-03-03",
    "projectedEndDate": "2026-03-03",
    "actualStartDate": "2026-03-03",
    "actualEndDate": "2026-03-03",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 18320
  },
  {
    "id": "csv_1292",
    "owner": "Nick",
    "title": "Refresh SPIFs",
    "nextAction": "Mike and Mike reached out and asked to refresh the SPIF data.",
    "additionalInfo": "Refreshed the coefficients and the formulas. Then explained again that tableau and comp data won't align because they are looking at different things. TBF Mike Vo was not in the initial talks about this with Mike F but this is a trend with this team. Now spot checked the data per Mike's request. After they shared I am now getting a message from Bryson saying he should have 1 more than I am showing for the SPIF. Checked and one that he counted was CRE and not ASI. This team seems to absolutely not trust the data, but the data has been correct every time.",
    "entryDate": "2026-03-02",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM - One Offs",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "5",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Mike Flemming",
    "projectedStartDate": "2026-03-03",
    "projectedEndDate": "2026-03-03",
    "actualStartDate": "2026-03-03",
    "actualEndDate": "2026-03-03",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 18510
  },
  {
    "id": "csv_1293",
    "owner": "Mary",
    "title": "Add Rebate Option for Jewelry in XBU",
    "nextAction": "",
    "additionalInfo": "Rebate option to be included",
    "entryDate": "2026-03-02",
    "type": "Tech Stack Maintenance",
    "project": "TS - Dealhub",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "6",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Clinton Brady",
    "projectedStartDate": "2026-03-02",
    "projectedEndDate": "2026-03-02",
    "actualStartDate": "2026-03-03",
    "actualEndDate": "2026-03-03",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 27440
  },
  {
    "id": "csv_1294",
    "owner": "Mary",
    "title": "Amit February Payout Review",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-03-02",
    "type": "General Projects",
    "project": "G2026 - Commissions",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "3",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Amit Phander",
    "projectedStartDate": "2026-03-02",
    "projectedEndDate": "2026-03-02",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 27630
  },
  {
    "id": "csv_1295",
    "owner": "Mary",
    "title": "Review the following docs:\nCommission Processs\nSprint Process\nFreshDesk Process (Final but would like to announce)",
    "nextAction": "",
    "additionalInfo": "",
    "entryDate": "2026-03-02",
    "type": "General Projects",
    "project": "G2026 - Documentation",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "10",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-03",
    "projectedEndDate": "2026-03-06",
    "actualStartDate": "2026-03-02",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 27820
  },
  {
    "id": "csv_1296",
    "owner": "Mary",
    "title": "Monthly User Review - Send out",
    "nextAction": "March 9th remove users",
    "additionalInfo": "Sent out",
    "entryDate": "2026-03-02",
    "type": "General Projects",
    "project": "G2026 - SFDC Process Enhancement",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "5",
    "requester": "",
    "department": "Internal - SFDC",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-03",
    "projectedEndDate": "2026-03-09",
    "actualStartDate": "2026-03-03",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 50,
    "y": 28010
  },
  {
    "id": "csv_1297",
    "owner": "Nick",
    "title": "All hands slide update",
    "nextAction": "Updated both the reference sheet and slides",
    "additionalInfo": "",
    "entryDate": "2026-03-04",
    "type": "Workbook/Document Maintenance",
    "project": "WBDM- Sales All Hands",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Peter Markland",
    "projectedStartDate": "2026-03-04",
    "projectedEndDate": "2026-03-04",
    "actualStartDate": "2026-03-04",
    "actualEndDate": "2026-03-04",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 18700
  },
  {
    "id": "csv_1298",
    "owner": "Nick",
    "title": "Reminders for Adj and MBO results",
    "nextAction": "Have sent out multiple reminders to leaders to submit adj and MBO results",
    "additionalInfo": "Will send a final reminder on friday",
    "entryDate": "2026-03-05",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-03",
    "projectedEndDate": "2026-03-06",
    "actualStartDate": "2026-03-03",
    "actualEndDate": "2026-03-06",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 18890
  },
  {
    "id": "csv_1299",
    "owner": "Nick",
    "title": "Expansion AE Dash",
    "nextAction": "Began pulling the coefficients",
    "additionalInfo": "need to ask about which fields to pull in for opp info as the ID field seems to be blank no matter which I choose to pull in.\nPulled in the call data coefficients. Need to pull in opportunity coefficients as well.\nWorked with Mary to get the coefficients pulled in that will automatically update. Built new tables and charts.\nNeed additional data pulled in but tables are set up to calculate the data once pulled in.",
    "entryDate": "2026-03-05",
    "type": "General Projects",
    "project": "GSR - One Offs",
    "status": "In Progress",
    "statusReason": "In Progress",
    "priority": "High",
    "points": "10",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-03-05",
    "projectedEndDate": "2026-03-11",
    "actualStartDate": "2026-03-05",
    "actualEndDate": "2026-03-11",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 19080
  },
  {
    "id": "csv_1300",
    "owner": "Nick",
    "title": "Expand on payroll process SOP",
    "nextAction": "Read through Mary's document and make changes",
    "additionalInfo": "",
    "entryDate": "2026-03-05",
    "type": "General Projects",
    "project": "GSR - One Offs",
    "status": "In Progress",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "6",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-11",
    "projectedEndDate": "2026-03-12",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 19270
  },
  {
    "id": "csv_1301",
    "owner": "Dan",
    "title": "Update Zap to include Case Subject + description | #quilt-payments-retention",
    "nextAction": "Have a draft version of updated zap in \"XBU | Payments Retention Case - Reassignment\"",
    "additionalInfo": "Need to log in to Zap as Lisa",
    "entryDate": "2026-03-05",
    "type": "Tech Stack Maintenance",
    "project": "TS - Zapier",
    "status": "In Progress",
    "statusReason": "Awaiting Input",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Payments Operations",
    "requesterName": "Biju Nair",
    "projectedStartDate": "2026-03-05",
    "projectedEndDate": "2026-03-06",
    "actualStartDate": "2026-03-05",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.4,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 9580
  },
  {
    "id": "csv_1302",
    "owner": "Nick",
    "title": "Ali Clawback Dispute",
    "nextAction": "Researched and sent findings to mary and tyler for their input",
    "additionalInfo": "Sent resultst to Ali. Have not received a response.",
    "entryDate": "2026-03-05",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Sales - AEs",
    "requesterName": "Ali Greer",
    "projectedStartDate": "2026-03-05",
    "projectedEndDate": "2026-03-05",
    "actualStartDate": "2026-03-05",
    "actualEndDate": "2026-03-05",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 19460
  },
  {
    "id": "csv_1303",
    "owner": "Nick",
    "title": "Clawbacks",
    "nextAction": "Checking to make sure all clawbacks that should have been created by the SF flow were created. Making sure we never clawed back in the past, and entering any 2025 deals into CIQ.",
    "additionalInfo": "completed. All reps have completed clawbacks for Feb and March. Issues sent to Neil.",
    "entryDate": "2026-03-06",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "5",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-06",
    "projectedEndDate": "2026-03-06",
    "actualStartDate": "2026-03-06",
    "actualEndDate": "2026-03-06",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 19650
  },
  {
    "id": "csv_1304",
    "owner": "Nick",
    "title": "Carter Clawback fix",
    "nextAction": "Reviewed/changed the clawback amount for Carter",
    "additionalInfo": "Reviewed Carters concern and changed to half a clawback based on Tyler and Mary's call.",
    "entryDate": "2026-03-06",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "1",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Tyler Rhoton",
    "projectedStartDate": "2026-03-06",
    "projectedEndDate": "2026-03-06",
    "actualStartDate": "2026-03-06",
    "actualEndDate": "2026-03-06",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 19840
  },
  {
    "id": "csv_1305",
    "owner": "Nick",
    "title": "Ivy's statement",
    "nextAction": "Correct MBO Statement",
    "additionalInfo": "Date start date needed to be changed to feb in the MBO plan",
    "entryDate": "2026-03-11",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "2",
    "requester": "",
    "department": "Sales - Leadership",
    "requesterName": "Matthew Jacobus",
    "projectedStartDate": "2026-03-11",
    "projectedEndDate": "2026-03-11",
    "actualStartDate": "2026-03-11",
    "actualEndDate": "2026-03-11",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 20030
  },
  {
    "id": "csv_1306",
    "owner": "Nick",
    "title": "Remove uploaded clawbacks",
    "nextAction": "Deleted 2 uploaded clawbacks as the automations did make them",
    "additionalInfo": "",
    "entryDate": "2026-03-11",
    "type": "Tech Stack Maintenance",
    "project": "TS - SFDC",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "0",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-11",
    "projectedEndDate": "2026-03-11",
    "actualStartDate": "2026-03-11",
    "actualEndDate": "2026-03-11",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 20220
  },
  {
    "id": "csv_1307",
    "owner": "Dan",
    "title": "Master - Opportunities",
    "nextAction": "Start",
    "additionalInfo": "Consolidate unified file",
    "entryDate": "2026-03-12",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Master Workbooks",
    "status": "Not Started",
    "statusReason": "Not Started",
    "priority": "Medium",
    "points": "14",
    "requester": "",
    "department": "Internal - Personal",
    "requesterName": "Daniel Hall",
    "projectedStartDate": "",
    "projectedEndDate": "",
    "actualStartDate": "",
    "actualEndDate": "",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 0.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 310,
    "y": 9770
  },
  {
    "id": "csv_1308",
    "owner": "Nick",
    "title": "Update Leader Plans in CIQ",
    "nextAction": "Update percentages, quotas, OTVs, and add kickers",
    "additionalInfo": "",
    "entryDate": "2026-03-13",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "Medium",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-12",
    "projectedEndDate": "2026-03-12",
    "actualStartDate": "2026-03-12",
    "actualEndDate": "2026-03-12",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 20410
  },
  {
    "id": "csv_1309",
    "owner": "Nick",
    "title": "Clawbacks",
    "nextAction": "Checking to make sure all clawbacks that should have been created by the SF flow were created. Making sure we never clawed back in the past, and entering any 2025 deals into CIQ.",
    "additionalInfo": "",
    "entryDate": "2026-03-13",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-13",
    "projectedEndDate": "2026-03-13",
    "actualStartDate": "2026-03-13",
    "actualEndDate": "2026-03-13",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 20600
  },
  {
    "id": "csv_1310",
    "owner": "Nick",
    "title": "Base Rate Sheet",
    "nextAction": "Export from CIQ",
    "additionalInfo": "",
    "entryDate": "2026-03-16",
    "type": "Workbook/Document Maintenance",
    "project": "G2026 - Commissions",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "10",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-16",
    "projectedEndDate": "2026-03-18",
    "actualStartDate": "2026-03-16",
    "actualEndDate": "2026-03-18",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 20790
  },
  {
    "id": "csv_1311",
    "owner": "Nick",
    "title": "Clawbacks",
    "nextAction": "Checking to make sure all clawbacks that should have been created by the SF flow were created. Making sure we never clawed back in the past, and entering any 2025 deals into CIQ.",
    "additionalInfo": "",
    "entryDate": "2026-03-20",
    "type": "Tech Stack Maintenance",
    "project": "TS - CIQ",
    "status": "Completed",
    "statusReason": "Completed",
    "priority": "High",
    "points": "4",
    "requester": "",
    "department": "Internal - Ops",
    "requesterName": "Mary Wike",
    "projectedStartDate": "2026-03-20",
    "projectedEndDate": "2026-03-20",
    "actualStartDate": "2026-03-20",
    "actualEndDate": "2026-03-20",
    "comment": "",
    "relatedTasks": [],
    "blockingTasks": [],
    "progress": 1.0,
    "colorOverride": null,
    "subtasks": [],
    "canvasId": "default",
    "x": 570,
    "y": 20980
  }
];



// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const STORAGE_KEY = "orbit_revops_v1";
const POLL_MS = 3500;

const STATUS_OPTIONS = ["Not Started","In Progress","Blocked","Review","Completed","Cancelled"];
const PRIORITY_OPTIONS = ["Critical","High","Medium","Low"];
const TYPE_OPTIONS = ["Automation","Reporting","Admin","Analysis","Documentation","Support","Project","Other"];
const DEPT_OPTIONS = ["Sales","RevOps","Finance","Marketing","Product","Engineering","CS","Other"];
const OWNER_OPTIONS = ["Dan Hall","Mary Wike","Cora"];

const STATUS_COLORS = {
  "Not Started": "#475569",
  "In Progress": "#3b82f6",
  "Blocked": "#ef4444",
  "Review": "#f59e0b",
  "Completed": "#22c55e",
  "Cancelled": "#6b7280",
};

const ALL_FIELDS = [
  { key:"owner", label:"Owner" },
  { key:"nextAction", label:"Next Action" },
  { key:"additionalInfo", label:"Additional Info" },
  { key:"entryDate", label:"Entry Date" },
  { key:"type", label:"Type" },
  { key:"project", label:"Project" },
  { key:"status", label:"Status" },
  { key:"statusReason", label:"Status Reason" },
  { key:"priority", label:"Priority" },
  { key:"points", label:"Points" },
  { key:"requester", label:"Requester" },
  { key:"department", label:"Department" },
  { key:"requesterName", label:"Requester Name" },
  { key:"requestSource", label:"Request Source" },
  { key:"projectedStartDate", label:"Proj. Start Date" },
  { key:"projectedEndDate", label:"Proj. End Date" },
  { key:"actualStartDate", label:"Actual Start Date" },
  { key:"actualEndDate", label:"Actual End Date" },
  { key:"comment", label:"Comment" },
  { key:"relatedTasks", label:"Related Tasks" },
  { key:"blockingTasks", label:"Blocking Tasks" },
];

const DEFAULT_COLOR_RULES = [
  { id:"cr1", min:0,   max:1,   color:"#ef4444", label:"Critical — act now" },
  { id:"cr2", min:1,   max:3,   color:"#f97316", label:"At Risk" },
  { id:"cr3", min:3,   max:6,   color:"#eab308", label:"Watch closely" },
  { id:"cr4", min:6,   max:999, color:"#22c55e", label:"On Track" },
];

const DEFAULT_SETTINGS = {
  colorRules: DEFAULT_COLOR_RULES,
  visibleFields: Object.fromEntries(ALL_FIELDS.map(f => [f.key, true])),
  webhook: { url: '', secret: '', enabled: false, canvasId: 'default' },
  fieldDefs: {
    project:       { label:'Project',        type:'dropdown', values:[], archived:[] },
    department:    { label:'Department',     type:'dropdown', values:[], archived:[] },
    type:          { label:'Type',           type:'dropdown', values:[], archived:[] },
    requestSource: { label:'Request Source', type:'dropdown', values:[], archived:[] },
  },
};

const DEFAULT_DATA = {
  canvases: [{ id:"default", name:"Main Canvas" }],
  tasks: [],
  zones: [],
  settings: DEFAULT_SETTINGS,
};

// ─────────────────────────────────────────────
// ZONE CONSTANTS & UTILITIES
// ─────────────────────────────────────────────
const ZONE_FIELDS = [
  {key:'owner',label:'Owner'},{key:'status',label:'Status'},
  {key:'priority',label:'Priority'},{key:'department',label:'Department'},
  {key:'project',label:'Project'},{key:'type',label:'Type'},
];
const ZONE_COLORS = ['#6366f1','#f59e0b','#22c55e','#ef4444','#3b82f6','#ec4899','#8b5cf6','#14b8a6'];
const DEFAULT_ZONES = [
  {id:'zone_dan',  name:'Dan Hall',   groupBy:'owner',groupValue:'Dan',  x:700,  y:700, color:'#6366f1',canvasId:'default'},
  {id:'zone_nick', name:'Nick Crouch',groupBy:'owner',groupValue:'Nick', x:1900, y:700, color:'#22c55e',canvasId:'default'},
  {id:'zone_mary', name:'Mary Wike',  groupBy:'owner',groupValue:'Mary', x:3400, y:700, color:'#f59e0b',canvasId:'default'},
];
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function sunflowerPos(n, c=54) {
  return Array.from({length:n}, (_,i) => ({
    x: c * Math.sqrt(i+0.5) * Math.cos(i*GOLDEN_ANGLE),
    y: c * Math.sqrt(i+0.5) * Math.sin(i*GOLDEN_ANGLE),
  }));
}
function zoneRadius(n, c=54) {
  return n === 0 ? 120 : c * Math.sqrt(n) + 90;
}
function getZoneTasks(zone, tasks, layers) {
  const val = String(zone.groupValue||'').trim().toLowerCase();
  return tasks.filter(t =>
    t.canvasId === zone.canvasId &&
    layers.includes(t.status) &&
    String(t[zone.groupBy]||'').trim().toLowerCase() === val
  );
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const todayStr = () => new Date().toISOString().split("T")[0];
const SHORT_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
const shortUid = () => 'TB-' + Array.from({length:5}, () => SHORT_CHARS[Math.floor(Math.random()*SHORT_CHARS.length)]).join('');
const getShortId = (task) => task.shortId || ('TB-' + String(task.id||'').slice(0,5).toUpperCase().replace(/[^A-Z0-9]/g,'X'));

function newTask(overrides = {}) {
  return {
    id: uid(), shortId: shortUid(), owner:"", title:"New Task", nextAction:"",
    additionalInfo:"", entryDate: todayStr(), type:"", project:"",
    status:"Not Started", statusReason:"", priority:"Medium",
    points:0, requester:"", department:"", requesterName:"", requestSource:"",
    projectedStartDate:"", projectedEndDate:"",
    actualStartDate:"", actualEndDate:"", comment:"",
    relatedTasks:[], blockingTasks:[],
    progress:0, colorOverride:null, subtasks:[],
    canvasId:"default",
    x: 80 + Math.random() * 500,
    y: 80 + Math.random() * 350,
    ...overrides,
  };
}

function getScore(task) {
  if (!task.projectedEndDate) return null;
  const days = Math.ceil((new Date(task.projectedEndDate) - new Date()) / 86400000);
  if (days <= 0) return 0;
  return task.progress * days;
}

function getBubbleColor(task, rules) {
  if (task.colorOverride) return task.colorOverride;
  if (task.status === "Completed") return "#22c55e";
  if (task.status === "Cancelled") return "#374151";
  const score = getScore(task);
  if (score === null) return "#3b82f6";
  for (const r of rules) {
    if (score >= r.min && score < r.max) return r.color;
  }
  return "#3b82f6";
}

function countDone(subtasks = []) {
  return subtasks.reduce((a, s) => a + (s.done ? 1 : 0) + countDone(s.subtasks), 0);
}
function countTotal(subtasks = []) {
  return subtasks.reduce((a, s) => a + 1 + countTotal(s.subtasks), 0);
}


// ─────────────────────────────────────────────
// MODULE-LEVEL STYLE CONSTANTS (used by TaskField)
// ─────────────────────────────────────────────
const DP_INPUT = {
  width:"100%", background:"#f8fafc",
  border:"1px solid #e2e8f0", borderRadius:6,
  padding:"6px 9px", color:"#475569", fontSize:12,
  outline:"none", fontFamily:"inherit",
};
const DP_LABEL = {
  display:"block", fontSize:10, fontWeight:700,
  letterSpacing:"0.08em", color:"#94a3b8",
  textTransform:"uppercase", marginBottom:3,
};
const DP_WRAP = { marginBottom:12 };

// TaskField must be defined OUTSIDE DetailPanel so React never unmounts/remounts
// the actual input DOM node on parent re-renders (fixes "one char at a time" bug).
function TaskField({ fkey, label, type="text", opts, value, vf, onChange }) {
  if (vf && vf[fkey] === false) return null;
  return (
    <div style={DP_WRAP}>
      <label style={DP_LABEL}>{label}</label>
      {opts
        ? <select value={value||""} onChange={e=>onChange({[fkey]:e.target.value})} style={DP_INPUT}>
            <option value="">—</option>
            {opts.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        : type==="textarea"
          ? <textarea value={value||""} onChange={e=>onChange({[fkey]:e.target.value})} rows={3} style={{...DP_INPUT,resize:"vertical"}} />
          : <input type={type} value={value||""} onChange={e=>onChange({[fkey]:e.target.value})} style={DP_INPUT} />
      }
    </div>
  );
}

// ─────────────────────────────────────────────
// SUBTASK (recursive, max 3 levels)
// ─────────────────────────────────────────────
function SubTaskItem({ st, onChange, onDel, level = 0 }) {
  const [open, setOpen] = useState(false);
  if (level >= 3) return null;
  const hasKids = st.subtasks?.length > 0;
  return (
    <div style={{ marginLeft: level * 14, marginBottom: 3 }}>
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <button onClick={() => setOpen(!open)}
          style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:9, width:14, padding:0, flexShrink:0 }}>
          {hasKids ? (open ? "▼" : "▶") : "·"}
        </button>
        <input type="checkbox" checked={!!st.done}
          onChange={e => onChange({ ...st, done:e.target.checked })}
          style={{ flexShrink:0 }} />
        <input value={st.title || ""}
          onChange={e => onChange({ ...st, title:e.target.value })}
          placeholder="Subtask…"
          style={{ flex:1, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:4, padding:"2px 6px", color: st.done ? "#475569" : "#cbd5e1", fontSize:12, textDecoration: st.done ? "line-through" : "none", outline:"none" }} />
        {level < 2 &&
          <button onClick={() => onChange({ ...st, subtasks:[...(st.subtasks||[]), { id:uid(), title:"", done:false, subtasks:[] }] })}
            style={{ background:"none", border:"none", color:"#6366f1", cursor:"pointer", fontSize:14, padding:"0 2px" }}>+</button>
        }
        <button onClick={onDel}
          style={{ background:"none", border:"none", color:"#7f1d1d", cursor:"pointer", fontSize:13, padding:"0 2px" }}>×</button>
      </div>
      {open && (st.subtasks||[]).map((kid, i) =>
        <SubTaskItem key={kid.id} st={kid} level={level+1}
          onChange={u => onChange({ ...st, subtasks: st.subtasks.map((s,j) => j===i ? u : s) })}
          onDel={() => onChange({ ...st, subtasks: st.subtasks.filter((_,j) => j!==i) })} />
      )}
    </div>
  );
}




// ─────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────
function DetailPanel({ task, allTasks, settings, onUpdate, onClose, onDelete, onAddSubtask, onNavigateTo }) {
  const [t, setT] = useState({ ...task });
  const [confirmDel, setConfirmDel] = useState(false);
  const [delCommentId, setDelCommentId] = useState(null);
  const [draft, setDraft] = useState('');
  const [relSrch, setRelSrch] = useState('');
  const [blkSrch, setBlkSrch] = useState('');
  const [panelWidth, setPanelWidth] = useState(430);
  const resizing = useRef(false);
  const rsStartX = useRef(0);
  const rsStartW = useRef(430);
  const startResize = (e) => {
    resizing.current = true; rsStartX.current = e.clientX; rsStartW.current = panelWidth;
    const move = (ev) => { if(!resizing.current) return; setPanelWidth(Math.max(300,Math.min(900,rsStartW.current+(rsStartX.current-ev.clientX)))); };
    const up   = ()  => { resizing.current = false; window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up); };
    window.addEventListener('mousemove',move); window.addEventListener('mouseup',up); e.preventDefault();
  };
  useEffect(() => setT({ ...task }), [task.id]);

  const set = (patch) => {
    const merged = { ...t, ...patch };
    if (merged.status === 'Completed') merged.progress = 1;
    setT(merged);
    onUpdate(merged);
  };

  const vf = settings.visibleFields;
  const color = getBubbleColor(t, settings.colorRules);
  const score = getScore(t);

  // Styles: DP_INPUT / DP_LABEL / DP_WRAP (module-level). Component: TaskField (module-level).

  return (
    <div className="tb-detail-panel" style={{
      position:"fixed", right:0, top:0, bottom:0, width:panelWidth,
      background:"#f1f5f9", borderLeft:`3px solid ${color}`,
      zIndex:500, display:"flex", flexDirection:"column",
      boxShadow:`-12px 0 50px rgba(0,0,0,0.7)`,
      fontFamily:"'DM Sans', sans-serif",
    }}>
      <div onMouseDown={startResize}
        style={{position:'absolute',left:0,top:0,bottom:0,width:6,cursor:'ew-resize',zIndex:20}}
        onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.25)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'} />
      {/* Header */}
      <div style={{ padding:"18px 18px 14px", borderBottom:"1px solid #e2e8f0", background:"#ffffff", flexShrink:0 }}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
          <div style={{ width:4, minHeight:36, background:color, borderRadius:2, flexShrink:0 }} />
          <input value={t.title} onChange={e=>set({title:e.target.value})}
            style={{ flex:1, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, outline:"none", fontSize:15, fontWeight:700, color:"#0f172a", fontFamily:"'Syne', sans-serif", padding:"5px 10px", transition:"border-color 0.15s" }}
            onFocus={e=>e.target.style.borderColor='#6366f1'}
            onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          <button onClick={onClose}
            style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:22, lineHeight:1, padding:"2px 4px" }}>×</button>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginLeft:14 }}>
          <span style={{ background:STATUS_COLORS[t.status]+"25", color:STATUS_COLORS[t.status], borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:700 }}>{t.status}</span>
          <span style={{ background:"#f8fafc", color:"#64748b", borderRadius:20, padding:"2px 10px", fontSize:10, fontFamily:"'DM Mono', monospace" }}>#{t.id}</span>
          {score !== null &&
            <span style={{ background:`${color}20`, color, borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:700 }}>Score {score.toFixed(1)}</span>
          }
        </div>
        {t.parentId && (() => {
          const parent = allTasks.find(x=>x.id===t.parentId);
          return parent ? (
            <div style={{marginLeft:14,marginTop:6,fontSize:11,color:'#6366f1',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}
              onClick={()=>{ onNavigateTo && onNavigateTo(parent.id); }}>
              <span style={{opacity:0.6}}>Parent:</span>
              <span style={{fontWeight:700,textDecoration:'underline',textDecorationStyle:'dotted'}}>{parent.title}</span>
            </div>
          ) : null;
        })()}
      </div>

      {/* Progress */}
      <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.05)", background:"#ffffff", flexShrink:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={DP_LABEL}>Progress</span>
          <span style={{ fontSize:12, color, fontWeight:700, fontFamily:"'DM Mono', monospace" }}>{Math.round(t.progress*100)}%</span>
        </div>
        <div style={{ position:"relative", height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${t.progress*100}%`, background:`linear-gradient(90deg, ${color}80, ${color})`, borderRadius:3, transition:"width 0.2s" }} />
        </div>
        <input type="range" min={0} max={100} value={Math.round(t.progress*100)}
          onChange={e=>set({progress:e.target.value/100})}
          style={{ width:"100%", marginTop:4, accentColor:color }} />
      </div>

      {/* Fields */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 18px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
          <TaskField fkey="owner" label="Owner" opts={OWNER_OPTIONS} value={t["owner"]||""} vf={vf} onChange={set} />
          <TaskField fkey="priority" label="Priority" opts={PRIORITY_OPTIONS} value={t["priority"]||""} vf={vf} onChange={set} />
          <TaskField fkey="status" label="Status" opts={STATUS_OPTIONS} value={t["status"]||""} vf={vf} onChange={set} />
          <TaskField fkey="type" label="Type" opts={TYPE_OPTIONS} value={t["type"]||""} vf={vf} onChange={set} />
          <TaskField fkey="department" label="Department" opts={DEPT_OPTIONS} value={t["department"]||""} vf={vf} onChange={set} />
          <TaskField fkey="points" label="Points" type="number" value={String(Math.max(0,Number(t["points"])||0))} vf={vf} onChange={(p)=>set({points:Math.max(0,Math.floor(Number(p.points)||0))})} />
          <TaskField fkey="project" label="Project" opts={[...new Set(allTasks.map(x=>x.project).filter(Boolean))].sort()} value={t["project"]||""} vf={vf} onChange={set} />
          <TaskField fkey="projectedStartDate" label="Proj. Start" type="date" value={t["projectedStartDate"]||""} vf={vf} onChange={set} />
          <TaskField fkey="projectedEndDate" label="Proj. End" type="date" value={t["projectedEndDate"]||""} vf={vf} onChange={set} />
          <TaskField fkey="actualStartDate" label="Actual Start" type="date" value={t["actualStartDate"]||""} vf={vf} onChange={set} />
          <TaskField fkey="actualEndDate" label="Actual End" type="date" value={t["actualEndDate"]||""} vf={vf} onChange={set} />
          <TaskField fkey="entryDate" label="Entry Date" type="date" value={t["entryDate"]||""} vf={vf} onChange={set} />
          <TaskField fkey="requesterName" label="Req. Name" value={t["requesterName"]||""} vf={vf} onChange={set} />
        </div>
        <TaskField fkey="statusReason" label="Status Reason" value={t["statusReason"]||""} vf={vf} onChange={set} />
        <TaskField fkey="nextAction" label="Next Action" type="textarea" value={t["nextAction"]||""} vf={vf} onChange={set} />
        <TaskField fkey="additionalInfo" label="Additional Info" type="textarea" value={t["additionalInfo"]||""} vf={vf} onChange={set} />
                {vf.comment !== false && (
          <div style={DP_WRAP}>
            <label style={DP_LABEL}>Comments</label>
            <div style={{display:'flex',gap:6,marginBottom:6}}>
              <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Add a comment..." rows={2}
                style={{...DP_INPUT,flex:1,resize:'vertical'}} />
              <button onClick={()=>{
                if(!draft.trim()) return;
                const d=new Date(), pad=n=>String(n).padStart(2,'0');
                const ts=`${d.getMonth()+1}/${d.getDate()}/${String(d.getFullYear()).slice(2)} ${d.getHours()%12||12}:${pad(d.getMinutes())} ${d.getHours()<12?'AM':'PM'}`;
                set({savedComments:[...(t.savedComments||[]),{id:Math.random().toString(36).slice(2),text:draft.trim(),ts}]});
                setDraft('');
              }} style={{alignSelf:'flex-end',background:'#6366f1',border:'none',borderRadius:6,padding:'6px 12px',color:'#fff',fontWeight:700,fontSize:11,cursor:'pointer',flexShrink:0}}>
                Save
              </button>
            </div>
            {(t.savedComments||[]).map(c=>(
              <div key={c.id} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:7,padding:'7px 10px',marginBottom:4,position:'relative'}}>
                <div style={{fontSize:10,color:'#94a3b8',marginBottom:3,fontFamily:"'DM Mono',monospace"}}>{c.ts}</div>
                <div style={{fontSize:12,color:'#475569',lineHeight:1.5,whiteSpace:'pre-wrap',paddingRight:18}}>{c.text}</div>
                {delCommentId===c.id
                  ? <span style={{position:'absolute',top:4,right:5,display:'flex',gap:3}}>
                      <button onClick={()=>{set({savedComments:(t.savedComments||[]).filter(x=>x.id!==c.id)});setDelCommentId(null);}} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:4,padding:'2px 6px',color:'#ef4444',cursor:'pointer',fontSize:10,fontWeight:700}}>Yes</button>
                      <button onClick={()=>setDelCommentId(null)} style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:4,padding:'2px 6px',color:'#64748b',cursor:'pointer',fontSize:10}}>No</button>
                    </span>
                  : <button onClick={()=>setDelCommentId(c.id)}
                      style={{position:'absolute',top:5,right:6,background:'none',border:'none',color:'#cbd5e1',cursor:'pointer',fontSize:13,padding:'1px 4px'}}>x</button>
                }
              </div>
            ))}
          </div>
        )}

        {/* Related Tasks */}
        {vf.relatedTasks !== false && (
          <div style={DP_WRAP}>
            <label style={DP_LABEL}>Related Tasks</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:4 }}>
              {(t.relatedTasks||[]).map(rid => {
                const rt = allTasks.find(x=>x.id===rid);
                return rt ? (
                  <span key={rid} style={{ background:"rgba(99,102,241,0.15)", color:"#818cf8", borderRadius:4, padding:"2px 8px", fontSize:11, display:"flex", alignItems:"center", gap:4 }}>
                    {rt.title}
                    <button onClick={()=>set({relatedTasks:(t.relatedTasks||[]).filter(x=>x!==rid)})} style={{ background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontSize:12,padding:0,lineHeight:1 }}>×</button>
                  </span>
                ) : null;
              })}
            </div>
            <input value={relSrch} onChange={e=>setRelSrch(e.target.value)} placeholder="Search tasks to link..." style={{...DP_INPUT,marginBottom:2,fontSize:11}} />
            {relSrch.trim() && (
              <div style={{maxHeight:130,overflowY:'auto',border:'1px solid #e2e8f0',borderRadius:6,marginBottom:4,background:'#fff'}}>
                {allTasks.filter(x=>x.id!==t.id && !(t.relatedTasks||[]).includes(x.id) && (x.title.toLowerCase().includes(relSrch.toLowerCase())||(x.shortId||'').toLowerCase().includes(relSrch.toLowerCase()))).slice(0,8).map(x=>(
                  <div key={x.id} onClick={()=>{set({relatedTasks:[...(t.relatedTasks||[]),x.id]});setRelSrch('');}}
                    style={{padding:'5px 10px',cursor:'pointer',fontSize:11,color:'#475569',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:6}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                    onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                    {x.shortId&&<span style={{color:'#6366f1',fontFamily:"'DM Mono',monospace",fontSize:10,flexShrink:0}}>{x.shortId}</span>}
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{x.title}</span>
                  </div>
                ))}
                {!allTasks.filter(x=>x.id!==t.id && !(t.relatedTasks||[]).includes(x.id) && (x.title.toLowerCase().includes(relSrch.toLowerCase())||(x.shortId||'').toLowerCase().includes(relSrch.toLowerCase()))).length&&(
                  <div style={{padding:'8px 10px',fontSize:11,color:'#94a3b8',fontStyle:'italic'}}>No matches</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Blocking Tasks */}
        {vf.blockingTasks !== false && (
          <div style={DP_WRAP}>
            <label style={DP_LABEL}>Blocking</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:4 }}>
              {(t.blockingTasks||[]).map(bid => {
                const bt = allTasks.find(x=>x.id===bid);
                return bt ? (
                  <span key={bid} style={{ background:"rgba(239,68,68,0.12)", color:"#f87171", borderRadius:4, padding:"2px 8px", fontSize:11, display:"flex", alignItems:"center", gap:4 }}>
                    🚫 {bt.title}
                    <button onClick={()=>set({blockingTasks:(t.blockingTasks||[]).filter(x=>x!==bid)})} style={{ background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:12,padding:0,lineHeight:1 }}>×</button>
                  </span>
                ) : null;
              })}
            </div>
            <input value={blkSrch} onChange={e=>setBlkSrch(e.target.value)} placeholder="Search tasks to block..." style={{...DP_INPUT,marginBottom:2,fontSize:11}} />
            {blkSrch.trim() && (
              <div style={{maxHeight:130,overflowY:'auto',border:'1px solid #e2e8f0',borderRadius:6,marginBottom:4,background:'#fff'}}>
                {allTasks.filter(x=>x.id!==t.id && !(t.blockingTasks||[]).includes(x.id) && (x.title.toLowerCase().includes(blkSrch.toLowerCase())||(x.shortId||'').toLowerCase().includes(blkSrch.toLowerCase()))).slice(0,8).map(x=>(
                  <div key={x.id} onClick={()=>{set({blockingTasks:[...(t.blockingTasks||[]),x.id]});setBlkSrch('');}}
                    style={{padding:'5px 10px',cursor:'pointer',fontSize:11,color:'#475569',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:6}}
                    onMouseEnter={e=>e.currentTarget.style.background='#fff5f5'}
                    onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                    {x.shortId&&<span style={{color:'#ef4444',fontFamily:"'DM Mono',monospace",fontSize:10,flexShrink:0}}>{x.shortId}</span>}
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{x.title}</span>
                  </div>
                ))}
                {!allTasks.filter(x=>x.id!==t.id && !(t.blockingTasks||[]).includes(x.id) && (x.title.toLowerCase().includes(blkSrch.toLowerCase())||(x.shortId||'').toLowerCase().includes(blkSrch.toLowerCase()))).length&&(
                  <div style={{padding:'8px 10px',fontSize:11,color:'#94a3b8',fontStyle:'italic'}}>No matches</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Color Override */}
        <div style={DP_WRAP}>
          <label style={DP_LABEL}>Color Override</label>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="color" value={t.colorOverride || color}
              onChange={e=>set({colorOverride:e.target.value})}
              style={{ width:38, height:30, border:"none", borderRadius:6, cursor:"pointer", background:"none" }} />
            <span style={{ fontSize:11, color:"#64748b" }}>
              {t.colorOverride ? "Manual override active" : "Auto (score-based)"}
            </span>
            {t.colorOverride &&
              <button onClick={()=>set({colorOverride:null})}
                style={{ background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:4, padding:"2px 8px", color:"#94a3b8", cursor:"pointer", fontSize:11 }}>
                Reset
              </button>
            }
          </div>
        </div>

        {/* Subtasks */}
        <div style={DP_WRAP}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <label style={DP_LABEL}>Subtasks (3 levels)</label>
            <button onClick={()=>{
                if(onAddSubtask){
                  const st={id:uid(),shortId:shortUid(),title:'New Subtask',status:'Not Started',
                    priority:t.priority||'Medium',owner:t.owner||'',
                    project:t.project||'',department:t.department||'',
                    requesterName:t.requesterName||'',
                    progress:0,points:0,
                    canvasId:t.canvasId||'default',parentId:t.id,
                    relatedTasks:[],blockingTasks:[],subtasks:[],colorOverride:null,
                    entryDate:todayStr(),updatedAt:Date.now(),x:(t.x||500)+80,y:(t.y||500)+120};
                  onAddSubtask(st);
                } else {
                  set({subtasks:[...(t.subtasks||[]),{id:uid(),title:'',done:false,subtasks:[]}]});
                }
              }}
              style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:5, padding:"2px 9px", color:"#818cf8", cursor:"pointer", fontSize:11, fontWeight:600 }}>
              + Add
            </button>
          </div>
          {(t.subtasks||[]).length === 0
            ? <div style={{ fontSize:11, color:"#475569", fontStyle:"italic" }}>No subtasks yet.</div>
            : (t.subtasks||[]).map((st,i)=>
                <SubTaskItem key={st.id} st={st}
                  onChange={u=>set({subtasks:t.subtasks.map((s,j)=>j===i?u:s)})}
                  onDel={()=>set({subtasks:t.subtasks.filter((_,j)=>j!==i)})} />
              )
          }
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:"11px 18px", borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", background:"#ffffff", flexShrink:0 }}>
        {confirmDel
          ? <span style={{display:'flex',gap:4,alignItems:'center'}}>
              <span style={{fontSize:11,color:'#ef4444',fontWeight:600}}>Really delete?</span>
              <button onClick={onDelete} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:5,padding:'4px 10px',color:'#ef4444',cursor:'pointer',fontSize:11,fontWeight:700}}>Yes</button>
              <button onClick={()=>setConfirmDel(false)} style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:5,padding:'4px 10px',color:'#64748b',cursor:'pointer',fontSize:11}}>No</button>
            </span>
          : <button onClick={()=>setConfirmDel(true)}
              style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:7, padding:"6px 14px", color:"#f87171", cursor:"pointer", fontSize:12 }}>
              Delete
            </button>
        }
        <button onClick={()=>{
            const completed = {...t, status:'Completed', progress:1};
            setT(completed); onUpdate(completed);
          }}
          style={{background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:7,padding:'6px 14px',color:'#4ade80',cursor:'pointer',fontSize:12,fontWeight:700}}>
          Complete
        </button>
        <button onClick={onClose}
          style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:7, padding:"6px 16px", color:"#a5b4fc", cursor:"pointer", fontSize:12, fontWeight:600 }}>
          Done
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BUBBLE
// ─────────────────────────────────────────────
function Bubble({ task, active, panRef, scale=1, onSelect, onMove, onDrop, settings }) {
  const elRef = useRef(null);
  const color = getBubbleColor(task, settings.colorRules);
  const score = getScore(task);
  const doneC = countDone(task.subtasks||[]);
  const totC  = countTotal(task.subtasks||[]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const pan = panRef.current;
    // Convert screen → world coords (accounting for pan and scale)
    const toWorld = (cx, cy) => ({
      x: (cx - pan.x) / scale,
      y: (cy - pan.y) / scale,
    });
    const m0 = toWorld(e.clientX, e.clientY);
    const offX = m0.x - task.x;
    const offY = m0.y - task.y;
    let moved = false;

    const onMov = (me) => {
      moved = true;
      const w = toWorld(me.clientX, me.clientY);
      const nx = w.x - offX;
      const ny = w.y - offY;
      if (elRef.current) {
        elRef.current.style.left = nx + "px";
        elRef.current.style.top  = ny + "px";
      }
    };
    const onUp = (me) => {
      window.removeEventListener("mousemove", onMov);
      window.removeEventListener("mouseup", onUp);
      if (moved) {
        const w = toWorld(me.clientX, me.clientY);
        const nx = w.x - offX;
        const ny = w.y - offY;
        if (onDrop) onDrop(task.id, nx, ny);
        else onMove(task.id, nx, ny);
      } else {
        onSelect(task.id);
      }
    };
    window.addEventListener("mousemove", onMov);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div ref={elRef} onMouseDown={handleMouseDown}
      style={{
        position:"absolute", left:task.x, top:task.y,
        width:208, background: active ? "#f8fafc" : "#ffffff",
        border:`2px solid ${active ? color : color+"60"}`,
        borderRadius:13, cursor:"grab", userSelect:"none",
        boxShadow: active
          ? `0 0 0 1px ${color}30, 0 0 24px ${color}30, 0 6px 24px rgba(0,0,0,0.6)`
          : "0 2px 12px rgba(0,0,0,0.5)",
        transition:"border-color 0.15s, box-shadow 0.15s",
        zIndex: active ? 50 : 1,
      }}>
      {/* top color strip */}
      <div style={{ height:4, background:color, borderRadius:"11px 11px 0 0" }} />

      <div style={{ padding:"9px 11px 6px" }}>
        {/* Title */}
        <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", lineHeight:1.35, wordBreak:"break-word", marginBottom:6, fontFamily:"'DM Sans', sans-serif" }}>
          {task.title}
        </div>

        {/* Owner + Priority row */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          {task.owner
            ? <span style={{ fontSize:10, color:"#94a3b8" }}>👤 {task.owner}</span>
            : <span />
          }
          {task.priority &&
            <span style={{ fontSize:10, color:color, fontWeight:700, fontFamily:"'DM Mono', monospace" }}>{task.priority}</span>
          }
        </div>

        {/* Status badge */}
        <div style={{ marginBottom:5 }}>
          <span style={{
            fontSize:9, fontWeight:700, letterSpacing:"0.06em",
            background:STATUS_COLORS[task.status]+"20",
            color:STATUS_COLORS[task.status],
            borderRadius:20, padding:"1px 7px",
            textTransform:"uppercase",
          }}>{task.status}</span>
        </div>

        {/* Deadline + Score */}
        {task.projectedEndDate &&
          <div style={{ fontSize:10, color:"#64748b", marginBottom:3, fontFamily:"'DM Mono', monospace" }}>
            ⏎ {task.projectedEndDate}
            {score !== null &&
              <span style={{ color, marginLeft:5, fontWeight:700 }}>{score.toFixed(1)}</span>
            }
          </div>
        }

        {/* Subtask progress */}
        {totC > 0 &&
          <div style={{ fontSize:10, color:"#64748b", marginBottom:2 }}>☑ {doneC}/{totC}</div>
        }
      </div>

      {/* Progress bar footer */}
      <div style={{ height:3, background:"#f8fafc", borderRadius:"0 0 11px 11px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${task.progress*100}%`, background:color, transition:"width 0.3s" }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CONNECTION LINES (inside SVG transform group, uses world coords)
// ─────────────────────────────────────────────
function ConnectionLines({ tasks, activeId }) {
  const lines = [];
  const seen = new Set();
  tasks.forEach(t => {
    (t.relatedTasks||[]).forEach(rid => {
      const key = [t.id,rid].sort().join(":");
      if (seen.has(key)) return; seen.add(key);
      const other = tasks.find(x=>x.id===rid);
      if (!other) return;
      const active = t.id===activeId || rid===activeId;
      lines.push(<line key={key} x1={t.x+104} y1={t.y+55} x2={other.x+104} y2={other.y+55}
        stroke={active?"#94a3b8":"#e2e8f0"} strokeWidth={active?2:1}
        strokeDasharray={active?"none":"7 5"}/>);
    });
    (t.blockingTasks||[]).forEach(bid => {
      const key=`blk:${t.id}:${bid}`;
      if (seen.has(key)) return; seen.add(key);
      const other = tasks.find(x=>x.id===bid);
      if (!other) return;
      const active = t.id===activeId || bid===activeId;
      lines.push(<line key={key} x1={t.x+104} y1={t.y+55} x2={other.x+104} y2={other.y+55}
        stroke={active?"#f87171":"#fecaca"} strokeWidth={active?2:1}
        strokeDasharray={active?"none":"4 4"} markerEnd="url(#arrowBlock)"/>);
    });
    if (t.parentId) {
      const key=`par:${t.parentId}:${t.id}`;
      if (!seen.has(key)) { seen.add(key);
        const parent = tasks.find(x=>x.id===t.parentId);
        if (parent) {
          const active = t.id===activeId || parent.id===activeId;
          lines.push(<line key={key} x1={parent.x+104} y1={parent.y+55} x2={t.x+104} y2={t.y+55}
            stroke={active?"#a5b4fc":"#c7d2fe"} strokeWidth={active?2:1} strokeDasharray="5 4" opacity={0.7}/>);
        }
      }
    }
  });
  return <>{lines}</>;
}

// ─────────────────────────────────────────────
// ZONE CIRCLE (SVG component)
// ─────────────────────────────────────────────
function ZoneCircle({ zone, tasksInZone, activeTaskId, onSelectTask,
    onUpdate, onDelete, onEdit, onUnzoneTask, settings, scale, panRef }) {

  const n   = tasksInZone.length;
  const r   = zoneRadius(n);
  const [hover, setHover]           = useState(false);
  const [bellyKick, setBellyKick]   = useState(null);
  const [taskPos, setTaskPos]       = useState({});
  const [draggingId, setDraggingId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);

  // ── initialise positions for new tasks ──────────────────────────────────
  useEffect(() => {
    const base = sunflowerPos(n);
    setTaskPos(prev => {
      const next = {};
      tasksInZone.forEach((t, i) => {
        next[t.id] = prev[t.id] || base[i] || {x:0,y:0};
      });
      return next;
    });
  }, [tasksInZone.map(t=>t.id).join(',')]); // eslint-disable-line

  // ── drag the whole zone ──────────────────────────────────────────────────
  const handleZoneDrag = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const offX = (e.clientX - panRef.current.x) / scale - zone.x;
    const offY = (e.clientY - panRef.current.y) / scale - zone.y;
    const onMove = (me) => onUpdate({...zone,
      x:(me.clientX-panRef.current.x)/scale-offX,
      y:(me.clientY-panRef.current.y)/scale-offY});
    const onUp = () => {
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',onUp);
    };
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',onUp);
  };

  // ── drag a task inside the zone ──────────────────────────────────────────
  const handleTaskDrag = (e, taskId) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    const startPos = taskPos[taskId] || {x:0,y:0};
    const toLocal = (me) => ({
      x: (me.clientX - panRef.current.x) / scale - zone.x,
      y: (me.clientY - panRef.current.y) / scale - zone.y,
    });
    const m0   = toLocal(e);
    const offX = m0.x - startPos.x;
    const offY = m0.y - startPos.y;
    let   dragged = false; // true once mouse moves > 5px

    const onMove = (me) => {
      const m  = toLocal(me);
      const nx = m.x - offX;
      const ny = m.y - offY;
      const delta = Math.sqrt((nx-startPos.x)**2 + (ny-startPos.y)**2);

      if (!dragged && delta > 5) {
        dragged = true;
        setDraggingId(taskId);
      }
      if (!dragged) return;

      const dist = Math.sqrt(nx*nx + ny*ny);
      const pct  = dist / r;
      if (pct >= 0.78 && pct <= 1.05) {
        const angle = Math.atan2(ny, nx);
        setBellyKick({ x: Math.cos(angle)*r, y: Math.sin(angle)*r });
      } else {
        setBellyKick(null);
      }
      setTaskPos(prev => applyRepulsion(prev, taskId, nx, ny, r));
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      setBellyKick(null);
      setDraggingId(null);

      if (!dragged) {
        // Simple click — open detail panel
        onSelectTask(taskId);
        return;
      }
      // Drag ended — check if task escaped zone
      setTaskPos(prev => {
        const p    = prev[taskId] || {x:0,y:0};
        const dist = Math.sqrt(p.x*p.x + p.y*p.y);
        if (dist > r * 1.02) {
          const task = tasksInZone.find(t => t.id === taskId);
          if (task) onUnzoneTask(task, zone);
        }
        return prev;
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  };

  return (
    <g transform={`translate(${zone.x},${zone.y})`}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>

      {/* Zone fill + dashed border */}
      <circle r={r} fill={zone.color+'14'} stroke={zone.color}
        strokeWidth={2.5} strokeDasharray="14 6"
        onMouseDown={handleZoneDrag} style={{cursor:'grab'}}/>

      {/* Belly-kick bulge */}
      {bellyKick && (
        <circle cx={bellyKick.x} cy={bellyKick.y} r={22}
          fill={zone.color+'55'} stroke={zone.color} strokeWidth={1.5}
          className="belly-kick" style={{pointerEvents:'none'}}/>
      )}

      {/* Zone header – always visible, close to the zone circle */}
      <text y={-r+30} textAnchor="middle" fontSize={20} fontWeight={800}
        fill={zone.color} fontFamily="'Syne',sans-serif"
        onMouseDown={handleZoneDrag} style={{cursor:'grab',userSelect:'none'}}>
        {zone.name}
      </text>
      <text y={-r+50} textAnchor="middle" fontSize={11} fill="#94a3b8"
        fontFamily="'DM Mono',monospace" style={{userSelect:'none'}}>
        {n} tasks · {zone.groupBy}: {zone.groupValue}
      </text>

      {/* Edit / Delete buttons – appear on hover, just below header inside zone */}
      {hover && !confirmDel && (
        <g>
          <g onClick={e=>{e.stopPropagation();onEdit(zone);}}
            onMouseDown={e=>e.stopPropagation()} style={{cursor:'pointer'}}>
            <rect x={-46} y={-r+56} width={40} height={22} rx={6}
              fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1}/>
            <text x={-26} y={-r+71} textAnchor="middle" fontSize={12}
              fill="#475569" style={{userSelect:'none'}}>✎ Edit</text>
          </g>
          <g onClick={e=>{e.stopPropagation();setConfirmDel(true);}}
            onMouseDown={e=>e.stopPropagation()} style={{cursor:'pointer'}}>
            <rect x={2} y={-r+56} width={44} height={22} rx={6}
              fill="#fef2f2" stroke="#fecaca" strokeWidth={1}/>
            <text x={24} y={-r+71} textAnchor="middle" fontSize={12}
              fill="#ef4444" style={{userSelect:'none'}}>🗑 Del</text>
          </g>
        </g>
      )}

      {/* Delete confirmation overlay */}
      {confirmDel && (
        <g onMouseDown={e=>e.stopPropagation()}>
          <rect x={-80} y={-r+50} width={160} height={52} rx={8}
            fill="#fff1f2" stroke="#fca5a5" strokeWidth={1.5}/>
          <text x={0} y={-r+66} textAnchor="middle" fontSize={11}
            fill="#dc2626" fontWeight="700" style={{userSelect:'none'}}>Delete "{zone.name}"?</text>
          <g onClick={e=>{e.stopPropagation();onDelete(zone.id);}} style={{cursor:'pointer'}}>
            <rect x={-72} y={-r+72} width={52} height={20} rx={5}
              fill="#dc2626"/>
            <text x={-46} y={-r+85} textAnchor="middle" fontSize={11}
              fill="#fff" fontWeight="700" style={{userSelect:'none'}}>Yes</text>
          </g>
          <g onClick={e=>{e.stopPropagation();setConfirmDel(false);}} style={{cursor:'pointer'}}>
            <rect x={14} y={-r+72} width={52} height={20} rx={5}
              fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1}/>
            <text x={40} y={-r+85} textAnchor="middle" fontSize={11}
              fill="#475569" style={{userSelect:'none'}}>Cancel</text>
          </g>
        </g>
      )}

      {/* Task mini circles — dragged task rendered last so it sits on top */}
      {[...tasksInZone].sort((a,b) => a.id===draggingId ? 1 : b.id===draggingId ? -1 : 0).map(task => {
        const p     = taskPos[task.id] || {x:0,y:0};
        const color = getBubbleColor(task, settings.colorRules);
        const isActive = task.id === activeTaskId;
        const circ  = 2 * Math.PI * 28;

        // Two-word label
        const words = task.title.replace(/[^a-zA-Z0-9 ]/g,' ').split(/\s+/).filter(Boolean);
        const w1 = (words[0]||'').slice(0,6);
        const w2 = (words[1]||'').slice(0,5);

        return (
          <g key={task.id} transform={`translate(${p.x},${p.y})`}
            onMouseDown={e => handleTaskDrag(e, task.id)}
            style={{cursor: task.id===draggingId ? 'grabbing' : 'grab'}}>
            <title>{task.title} · {task.status} · {task.priority}</title>

            {/* Circle body */}
            <circle r={38} fill={isActive?color+'30':'#fff'}
              stroke={color} strokeWidth={isActive?3:1.5}
              filter={isActive?`drop-shadow(0 0 6px ${color}80)`:'none'}/>

            {/* Progress ring */}
            <circle r={28} fill="none" stroke={color} strokeWidth={5}
              strokeOpacity={0.45}
              strokeDasharray={`${circ*task.progress} ${circ*(1-task.progress)}`}
              transform="rotate(-90)" strokeLinecap="round"/>

            {/* Two-word label */}
            <text textAnchor="middle" fontSize={11} fontWeight={700}
              fill={isActive?color:'#1e293b'} fontFamily="'DM Sans',sans-serif"
              y={w2 ? -5 : 4} style={{pointerEvents:'none',userSelect:'none'}}>
              {w1}
            </text>
            {w2 && (
              <text textAnchor="middle" fontSize={10} fontWeight={600}
                fill={isActive?color:'#475569'} fontFamily="'DM Sans',sans-serif"
                y={8} style={{pointerEvents:'none',userSelect:'none'}}>
                {w2}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

// ─────────────────────────────────────────────
// ZONE EDITOR MODAL
// ─────────────────────────────────────────────
function ZoneEditorModal({ zone, allTasks, onSave, onClose }) {
  const [name, setName] = useState(zone.name);
  const [groupBy, setGroupBy] = useState(zone.groupBy);
  const [groupValue, setGroupValue] = useState(zone.groupValue);
  const [color, setColor] = useState(zone.color);
  const uniqueVals = useMemo(()=>[...new Set(allTasks.map(t=>t[groupBy]).filter(Boolean))].sort(),[allTasks,groupBy]);
  const iStyle = {width:'100%',border:'1px solid #e2e8f0',borderRadius:8,padding:'7px 11px',fontSize:14,boxSizing:'border-box',outline:'none',fontFamily:"'DM Sans',sans-serif"};
  const lStyle = {display:'block',fontSize:10,fontWeight:700,color:'#64748b',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:4};
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:'#fff',borderRadius:16,padding:28,width:360,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{fontSize:16,fontWeight:800,color:'#1e293b',marginBottom:18,fontFamily:"'Syne',sans-serif"}}>Edit Zone</div>
        <div style={{marginBottom:12}}><label style={lStyle}>Zone Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} style={iStyle}/></div>
        <div style={{marginBottom:12}}><label style={lStyle}>Group By</label>
          <select value={groupBy} onChange={e=>{setGroupBy(e.target.value);setGroupValue('');}} style={iStyle}>
            {ZONE_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select></div>
        <div style={{marginBottom:12}}><label style={lStyle}>Filter Value</label>
          <select value={groupValue} onChange={e=>setGroupValue(e.target.value)} style={iStyle}>
            <option value="">-- all --</option>
            {uniqueVals.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:18}}>
          {ZONE_COLORS.map(c=><div key={c} onClick={()=>setColor(c)}
            style={{width:26,height:26,borderRadius:'50%',background:c,cursor:'pointer',border:color===c?'3px solid #1e293b':'3px solid transparent'}}/>)}</div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,border:'1px solid #e2e8f0',borderRadius:8,padding:9,cursor:'pointer',fontSize:13,background:'#f8fafc'}}>Cancel</button>
          <button onClick={()=>onSave({...zone,name,groupBy,groupValue,color})}
            style={{flex:2,border:'none',borderRadius:8,padding:9,cursor:'pointer',fontSize:13,fontWeight:700,background:'#6366f1',color:'#fff'}}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADD ZONE MODAL
// ─────────────────────────────────────────────
function AddZoneModal({ allTasks, canvasId, existingZones, onAdd, onClose }) {
  const [name, setName] = useState('');
  const [groupBy, setGroupBy] = useState('owner');
  const [groupValue, setGroupValue] = useState('');
  const [color, setColor] = useState(ZONE_COLORS[existingZones.length % ZONE_COLORS.length]);
  const uniqueVals = useMemo(()=>[...new Set(allTasks.map(t=>t[groupBy]).filter(Boolean))].sort(),[allTasks,groupBy]);
  const canAdd = name.trim() && groupValue;
  const iStyle = {width:'100%',border:'1px solid #e2e8f0',borderRadius:8,padding:'7px 11px',fontSize:14,boxSizing:'border-box',outline:'none',fontFamily:"'DM Sans',sans-serif"};
  const lStyle = {display:'block',fontSize:10,fontWeight:700,color:'#64748b',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:4};
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:'#fff',borderRadius:16,padding:28,width:360,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{fontSize:16,fontWeight:800,color:'#1e293b',marginBottom:18,fontFamily:"'Syne',sans-serif"}}>Add Zone</div>
        <div style={{marginBottom:12}}><label style={lStyle}>Zone Name</label>
          <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. My Team" style={iStyle}/></div>
        <div style={{marginBottom:12}}><label style={lStyle}>Group By</label>
          <select value={groupBy} onChange={e=>{setGroupBy(e.target.value);setGroupValue('');}} style={iStyle}>
            {ZONE_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select></div>
        <div style={{marginBottom:12}}><label style={lStyle}>Filter Value</label>
          <select value={groupValue} onChange={e=>setGroupValue(e.target.value)} style={iStyle}>
            <option value="">-- select --</option>
            {uniqueVals.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:18}}>
          {ZONE_COLORS.map(c=><div key={c} onClick={()=>setColor(c)}
            style={{width:26,height:26,borderRadius:'50%',background:c,cursor:'pointer',border:color===c?'3px solid #1e293b':'3px solid transparent'}}/>)}</div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,border:'1px solid #e2e8f0',borderRadius:8,padding:9,cursor:'pointer',fontSize:13,background:'#f8fafc'}}>Cancel</button>
          <button onClick={()=>{if(canAdd){onAdd({name:name.trim(),groupBy,groupValue,color,canvasId});onClose();}}}
            disabled={!canAdd}
            style={{flex:2,border:'none',borderRadius:8,padding:9,cursor:canAdd?'pointer':'not-allowed',fontSize:13,fontWeight:700,background:canAdd?'#6366f1':'#e2e8f0',color:canAdd?'#fff':'#94a3b8'}}>
            Add Zone
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// QUICK ADD
// ─────────────────────────────────────────────
function QuickAdd({ canvasId, onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [type, setType] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(()=>inputRef.current?.focus(), 50); }, []);

  const submit = () => {
    if (!title.trim()) return;
    onAdd(newTask({ title:title.trim(), owner, priority, projectedEndDate:deadline, status, type, canvasId }));
    onClose();
  };

  const chip = (val, cur, set) => (
    <button onClick={() => set(cur===val?"":val)}
      style={{
        padding:"5px 11px", borderRadius:20, fontSize:11, cursor:"pointer", fontWeight:600,
        background: cur===val ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${cur===val ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)"}`,
        color: cur===val ? "#a5b4fc" : "#475569",
        transition:"all 0.12s",
      }}>
      {val}
    </button>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.35)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:16, padding:28, width:440, boxShadow:"0 8px 32px rgba(0,0,0,0.15)", fontFamily:"'DM Sans', sans-serif" }}>
        <div style={{ fontSize:15, fontWeight:800, color:"#0f172a", marginBottom:18, fontFamily:"'Syne', sans-serif", letterSpacing:"-0.3px" }}>
          ⚡ Quick Add
        </div>

        <input ref={inputRef} value={title} onChange={e=>setTitle(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") submit(); if(e.key==="Escape") onClose(); }}
          placeholder="What needs doing?"
          style={{ width:"100%", background:"#f1f5f9", border:"1px solid rgba(99,102,241,0.45)", borderRadius:9, padding:"11px 13px", color:"#0f172a", fontSize:15, outline:"none", marginBottom:16, fontFamily:"inherit" }} />

        {/* Owner */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:"#64748b", textTransform:"uppercase", marginBottom:6 }}>Owner</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {OWNER_OPTIONS.map(o=>chip(o,owner,setOwner))}
          </div>
        </div>

        {/* Priority */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:"#64748b", textTransform:"uppercase", marginBottom:6 }}>Priority</div>
          <div style={{ display:"flex", gap:6 }}>
            {PRIORITY_OPTIONS.map(p=>chip(p,priority,setPriority))}
          </div>
        </div>

        {/* Type */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:"#64748b", textTransform:"uppercase", marginBottom:6 }}>Type</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["Automation","Reporting","Admin","Analysis","Support"].map(tp=>chip(tp,type,setType))}
          </div>
        </div>

        {/* Deadline + Status */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:"#64748b", textTransform:"uppercase", marginBottom:4 }}>Deadline</div>
            <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}
              style={{ width:"100%", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:7, padding:"7px 9px", color:"#475569", fontSize:12, outline:"none" }} />
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:"#64748b", textTransform:"uppercase", marginBottom:4 }}>Status</div>
            <select value={status} onChange={e=>setStatus(e.target.value)}
              style={{ width:"100%", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:7, padding:"7px 9px", color:"#475569", fontSize:12, outline:"none" }}>
              {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose}
            style={{ flex:1, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:9, padding:"10px", color:"#64748b", cursor:"pointer", fontSize:13 }}>
            Esc
          </button>
          <button onClick={submit} disabled={!title.trim()}
            style={{ flex:3, background:title.trim()?"rgba(99,102,241,0.85)":"rgba(99,102,241,0.15)", border:"none", borderRadius:9, padding:"10px", color:title.trim()?"#fff":"#4b5563", cursor:title.trim()?"pointer":"not-allowed", fontSize:13, fontWeight:700, fontFamily:"'DM Sans', sans-serif", transition:"background 0.15s" }}>
            Add Task ↵
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS PANEL
// ─────────────────────────────────────────────
function SettingsPanel({ settings, canvases, onUpdateSettings, onAddCanvas, onRenameCanvas, onDeleteCanvas, onClose }) {
  const [tab, setTab] = useState("fields");
  const [rules, setRules] = useState([...settings.colorRules]);
  const [vf, setVf] = useState({ ...settings.visibleFields });
  const [deleteConfirm, setDeleteConfirm] = useState(null); // canvasId at step 1
  const [deleteConfirm2, setDeleteConfirm2] = useState(null); // canvasId at step 2

  const saveVf = (next) => { setVf(next); onUpdateSettings({ ...settings, visibleFields:next }); };
  const saveRules = (next) => { setRules(next); onUpdateSettings({ ...settings, colorRules:next }); };

  const inputS = { background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:5, padding:"5px 8px", color:"#475569", fontSize:12, outline:"none" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.35)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:16, width:560, maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 8px 32px rgba(0,0,0,0.15)", overflow:"hidden", fontFamily:"'DM Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 24px", borderBottom:"1px solid #e2e8f0", background:"#f1f5f9", flexShrink:0 }}>
          <div style={{ fontSize:15, fontWeight:800, color:"#0f172a", fontFamily:"'Syne', sans-serif" }}>⚙ Settings</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:22 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid #e2e8f0", background:"#f1f5f9", flexShrink:0 }}>
          {[["fields","Fields"],["colors","Color Logic"],["canvases","Canvases"],["fieldmgr","Field Types"]].map(([id,label])=>
            <button key={id} onClick={()=>setTab(id)}
              style={{ flex:1, padding:"10px 0", background:"none", border:"none", borderBottom:`2px solid ${tab===id?"#6366f1":"transparent"}`, color:tab===id?"#a5b4fc":"#475569", cursor:"pointer", fontSize:12, fontWeight:tab===id?700:400, transition:"color 0.15s, border-color 0.15s" }}>
              {label}
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:24 }}>

          {tab==="fields" && (
            <div>
              <p style={{ fontSize:12, color:"#64748b", marginBottom:16, lineHeight:1.6 }}>
                Toggle fields on/off for the task detail panel. Title, Progress, and ID are always shown.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {ALL_FIELDS.map(f=>(
                  <label key={f.key} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"7px 10px", background:"#f8fafc", borderRadius:7, border:"1px solid rgba(255,255,255,0.05)" }}>
                    <input type="checkbox" checked={!!vf[f.key]} onChange={e=>saveVf({...vf,[f.key]:e.target.checked})} style={{ accentColor:"#6366f1" }} />
                    <span style={{ fontSize:12, color:"#94a3b8" }}>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tab==="colors" && (
            <div>
              <div style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:10, padding:14, marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#818cf8", marginBottom:8 }}>📐 How scoring works</div>
                <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.8 }}>
                  <strong style={{color:"#94a3b8"}}>Score = Progress × Days Until Deadline</strong><br/>
                  Progress is a 0–1 value. Days = calendar days to Projected End Date.<br/>
                  <br/>
                  Examples:<br/>
                  · 50% done, 7 days out → 0.5 × 7 = <strong style={{color:"#22c55e"}}>3.5 (On Track)</strong><br/>
                  · 50% done, 2 days out → 0.5 × 2 = <strong style={{color:"#f97316"}}>1.0 (At Risk)</strong><br/>
                  · Past deadline → Score = 0 (always Critical)<br/>
                  · No deadline set → Default blue<br/>
                  <br/>
                  Set ranges below so each score maps to a color. Ranges should not overlap.
                </div>
              </div>

              {rules.map((r,i)=>(
                <div key={r.id} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, background:"#f8fafc", border:"1px solid rgba(255,255,255,0.06)", borderRadius:9, padding:"10px 12px" }}>
                  <input type="color" value={r.color}
                    onChange={e=>{ const n=[...rules]; n[i]={...r,color:e.target.value}; saveRules(n); }}
                    style={{ width:34, height:28, border:"none", borderRadius:4, cursor:"pointer", flexShrink:0 }} />
                  <input value={r.label} onChange={e=>{ const n=[...rules]; n[i]={...r,label:e.target.value}; saveRules(n); }}
                    placeholder="Label…" style={{...inputS, flex:1}} />
                  <span style={{ fontSize:11, color:"#475569", flexShrink:0 }}>score</span>
                  <input type="number" value={r.min} onChange={e=>{ const n=[...rules]; n[i]={...r,min:+e.target.value}; saveRules(n); }}
                    style={{...inputS, width:52, textAlign:"center"}} />
                  <span style={{ color:"#475569", flexShrink:0 }}>–</span>
                  <input type="number" value={r.max} onChange={e=>{ const n=[...rules]; n[i]={...r,max:+e.target.value}; saveRules(n); }}
                    style={{...inputS, width:52, textAlign:"center"}} />
                  <button onClick={()=>saveRules(rules.filter((_,j)=>j!==i))}
                    style={{ background:"none", border:"none", color:"#7f1d1d", cursor:"pointer", fontSize:16, padding:"0 2px" }}>×</button>
                </div>
              ))}
              <button onClick={()=>saveRules([...rules,{id:uid(),min:0,max:10,color:"#6366f1",label:"Custom"}])}
                style={{ background:"rgba(99,102,241,0.08)", border:"1px dashed rgba(99,102,241,0.35)", borderRadius:9, padding:"9px 16px", color:"#6366f1", cursor:"pointer", fontSize:12, width:"100%", marginTop:4 }}>
                + Add Rule
              </button>
            </div>
          )}

          {tab==="canvases" && (
            <div>
              <p style={{ fontSize:12, color:"#64748b", marginBottom:14 }}>Rename canvases or add new ones. Tasks belong to one canvas; you can reference tasks from other canvases via Related Tasks.</p>
              {canvases.map(c=>(
                <div key={c.id} style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <input value={c.name} onChange={e=>onRenameCanvas(c.id,e.target.value)}
                      style={{...inputS, flex:1, padding:"8px 10px", fontSize:13}} />
                    {canvases.length > 1 && (
                      <button
                        onClick={()=>{ setDeleteConfirm(c.id); setDeleteConfirm2(null); }}
                        title="Delete canvas"
                        style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:7, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:14, color:"#f87171", flexShrink:0, transition:"background 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.18)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.08)"}>
                        🗑
                      </button>
                    )}
                  </div>

                  {/* Step 1 confirm */}
                  {deleteConfirm === c.id && deleteConfirm2 !== c.id && (
                    <div style={{ marginTop:6, background:"#fff1f2", border:"1px solid #fca5a5", borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, fontWeight:700, color:"#dc2626", flex:1 }}>Are you sure? This deletes <em>"{c.name}"</em> and all its tasks.</span>
                      <button onClick={()=>setDeleteConfirm2(c.id)}
                        style={{ background:"#dc2626", border:"none", borderRadius:6, padding:"5px 14px", color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                        Yes
                      </button>
                      <button onClick={()=>setDeleteConfirm(null)}
                        style={{ background:"transparent", border:"1px solid #fca5a5", borderRadius:6, padding:"5px 12px", color:"#dc2626", fontSize:11, cursor:"pointer" }}>
                        No
                      </button>
                    </div>
                  )}

                  {/* Step 2 confirm */}
                  {deleteConfirm2 === c.id && (
                    <div style={{ marginTop:6, background:"#fefce8", border:"1px solid #fde047", borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, fontWeight:700, color:"#a16207", flex:1 }}>💛 Did you check your heart? There's no coming back from this.</span>
                      <button onClick={()=>{ onDeleteCanvas(c.id); setDeleteConfirm(null); setDeleteConfirm2(null); }}
                        style={{ background:"#ca8a04", border:"none", borderRadius:6, padding:"5px 14px", color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                        Yes
                      </button>
                      <button onClick={()=>{ setDeleteConfirm(null); setDeleteConfirm2(null); }}
                        style={{ background:"transparent", border:"1px solid #fde047", borderRadius:6, padding:"5px 12px", color:"#a16207", fontSize:11, cursor:"pointer" }}>
                        No
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={onAddCanvas}
                style={{ background:"rgba(99,102,241,0.08)", border:"1px dashed rgba(99,102,241,0.35)", borderRadius:9, padding:"9px 16px", color:"#6366f1", cursor:"pointer", fontSize:12, width:"100%", marginTop:4 }}>
                + New Canvas
              </button>
            </div>
          )}

          {tab==="fieldmgr" && (
            <FieldManagerTab
              fieldDefs={settings.fieldDefs || {}}
              onUpdate={defs => onUpdateSettings({ ...settings, fieldDefs: defs })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FIELD MANAGER TAB
// ─────────────────────────────────────────────
function FieldManagerTab({ fieldDefs, onUpdate, allTasks }) {
  const [activeField, setActiveField] = useState(Object.keys(fieldDefs)[0] || '');
  const [newValue, setNewValue] = useState('');

  const BUILTIN = { department: DEPT_OPTIONS, type: TYPE_OPTIONS, project: [], requestSource: [] };
  const fields = Object.entries(fieldDefs);
  const rawDef = fieldDefs[activeField] || { label:'', values:[], archived:[] };
  const def = { ...rawDef, values: (rawDef.values||[]).length > 0 ? rawDef.values : (BUILTIN[activeField]||[]) };

  const addValue = () => {
    const v = newValue.trim();
    if (!v) return;
    if ((def.values||[]).includes(v) || (def.archived||[]).includes(v)) return;
    onUpdate({ ...fieldDefs, [activeField]: { ...def, values:[...(def.values||[]), v] } });
    setNewValue('');
  };

  const removeValue = (val) => {
    onUpdate({ ...fieldDefs, [activeField]: { ...def, values:(def.values||[]).filter(v=>v!==val), archived:[...(def.archived||[]), val] } });
  };

  const restoreValue = (val) => {
    onUpdate({ ...fieldDefs, [activeField]: { ...def, archived:(def.archived||[]).filter(v=>v!==val), values:[...(def.values||[]), val] } });
  };

  const deleteArchived = (val) => {
    onUpdate({ ...fieldDefs, [activeField]: { ...def, archived:(def.archived||[]).filter(v=>v!==val) } });
  };

  const refreshFromTasks = () => {
    if (!activeField || !allTasks?.length) return;
    const existing = new Set([...(def.values||[]), ...(def.archived||[])]);
    const fresh = [...new Set(allTasks.map(t => t[activeField]).filter(v => v && !existing.has(v)))].sort();
    if (!fresh.length) return;
    onUpdate({ ...fieldDefs, [activeField]: { ...def, values:[...(def.values||[]), ...fresh] } });
  };

  const reorder = (arr, i, dir) => {
    const a = [...arr]; const j = i+dir;
    if (j<0 || j>=a.length) return a;
    [a[i],a[j]] = [a[j],a[i]]; return a;
  };

  return (
    <div style={{ display:'flex', gap:16, minHeight:320 }}>
      {/* Sidebar */}
      <div style={{ width:136, flexShrink:0, borderRight:'1px solid #e2e8f0', paddingRight:12 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Fields</div>
        {fields.map(([key, d]) => (
          <button key={key} onClick={()=>{ setActiveField(key); setNewValue(''); }}
            style={{ width:'100%', textAlign:'left', padding:'7px 10px', borderRadius:7, border:'none',
              background: activeField===key?'rgba(99,102,241,0.12)':'transparent',
              color: activeField===key?'#6366f1':'#475569',
              fontWeight: activeField===key?700:400, fontSize:12, cursor:'pointer', marginBottom:2 }}>
            {d.label}
          </button>
        ))}
      </div>

      {/* Value editor */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <button onClick={refreshFromTasks} title="Scan all tasks and add unique values not already in the list"
            style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:6, padding:'4px 10px', color:'#6366f1', cursor:'pointer', fontSize:11, fontWeight:600 }}>
            ↺ Refresh from Tasks
          </button>
        </div>
        {activeField && (<>
          <div style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:3 }}>{def.label}</div>
          <div style={{ fontSize:11, color:'#64748b', marginBottom:14, lineHeight:1.5 }}>
            Manage dropdown values. Archived values are hidden from new inputs but preserved on existing tasks.
          </div>

          {/* Add */}
          <div style={{ display:'flex', gap:6, marginBottom:16 }}>
            <input value={newValue} onChange={e=>setNewValue(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') addValue(); }}
              placeholder="New value…"
              style={{ flex:1, border:'1px solid #e2e8f0', borderRadius:7, padding:'6px 10px', fontSize:12, outline:'none', color:'#1e293b' }} />
            <button onClick={addValue}
              style={{ background:'#6366f1', border:'none', borderRadius:7, padding:'6px 16px', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              + Add
            </button>
          </div>

          {/* Active values */}
          {(def.values||[]).length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Active</div>
              {(def.values||[]).map((val, i) => (
                <div key={val} style={{ display:'flex', alignItems:'center', gap:6, background:'#f8fafc', border:'1px solid #f1f5f9', borderRadius:7, padding:'6px 10px', marginBottom:3 }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                    <button onClick={()=>onUpdate({...fieldDefs,[activeField]:{...def,values:reorder(def.values,i,-1)}})}
                      style={{ background:'none', border:'none', cursor: i===0?'default':'pointer', color: i===0?'#e2e8f0':'#94a3b8', fontSize:9, padding:'0 2px', lineHeight:1.2 }}>▲</button>
                    <button onClick={()=>onUpdate({...fieldDefs,[activeField]:{...def,values:reorder(def.values,i,1)}})}
                      style={{ background:'none', border:'none', cursor: i===(def.values||[]).length-1?'default':'pointer', color: i===(def.values||[]).length-1?'#e2e8f0':'#94a3b8', fontSize:9, padding:'0 2px', lineHeight:1.2 }}>▼</button>
                  </div>
                  <span style={{ flex:1, fontSize:12, color:'#1e293b' }}>{val}</span>
                  <button onClick={()=>removeValue(val)}
                    style={{ background:'none', border:'1px solid #fecaca', borderRadius:5, padding:'2px 9px', fontSize:10, color:'#ef4444', cursor:'pointer', fontWeight:600 }}>
                    Archive
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Archived */}
          {(def.archived||[]).length > 0 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Archived</div>
              {(def.archived||[]).map(val => (
                <div key={val} style={{ display:'flex', alignItems:'center', gap:6, background:'#fafafa', border:'1px solid #f1f5f9', borderRadius:7, padding:'6px 10px', marginBottom:3, opacity:0.75 }}>
                  <span style={{ flex:1, fontSize:12, color:'#94a3b8', textDecoration:'line-through' }}>{val}</span>
                  <button onClick={()=>restoreValue(val)}
                    style={{ background:'none', border:'1px solid #bbf7d0', borderRadius:5, padding:'2px 9px', fontSize:10, color:'#22c55e', cursor:'pointer', fontWeight:600 }}>
                    Restore
                  </button>
                  <button onClick={()=>deleteArchived(val)}
                    style={{ background:'none', border:'1px solid #fecaca', borderRadius:5, padding:'2px 9px', fontSize:10, color:'#ef4444', cursor:'pointer', fontWeight:600 }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {(def.values||[]).length===0 && (def.archived||[]).length===0 && (
            <div style={{ textAlign:'center', color:'#cbd5e1', fontSize:13, padding:'32px 0' }}>No values yet — add one above.</div>
          )}
        </>)}
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────
// TABLE VIEW
// ─────────────────────────────────────────────
function TableView({ tasks, allTasks, settings, onUpdate, onBulkUpdate, onSelectTask, onDelete, onAdd, onAddMany, onAddSubtask, canvasId, searchQuery }) {
  const [expandedParents, setExpandedParents] = useState(new Set());
  const toggleExpand = (pid) => setExpandedParents(p=>{ const n=new Set(p); n.has(pid)?n.delete(pid):n.add(pid); return n; });
  const [sortCol, setSortCol] = useState('entryDate');
  const [sortDir, setSortDir] = useState('desc');
  const [colFilters, setColFilters] = useState({});
  const [openFilter, setOpenFilter] = useState(null);
  const filterRef = useRef(null);

  // Column visibility
  const ALL_COLS = [
    { key:'shortId',          label:'Task ID',     w:90,  editable:false },
    { key:'title',            label:'Title',       w:220, editable:true,  inputType:'text'   },
    { key:'owner',            label:'Owner',       w:100, editable:true,  inputType:'select', opts:OWNER_OPTIONS },
    { key:'status',           label:'Status',      w:115, editable:true,  inputType:'select', opts:STATUS_OPTIONS },
    { key:'priority',         label:'Priority',    w:90,  editable:true,  inputType:'select', opts:PRIORITY_OPTIONS },
    { key:'points',           label:'Pts',         w:55,  editable:true,  inputType:'number' },
    { key:'project',          label:'Project',     w:130, editable:true,  inputType:'text'   },
    { key:'department',       label:'Dept',        w:100, editable:true,  inputType:'text'   },
    { key:'type',             label:'Type',        w:100, editable:true,  inputType:'text'   },
    { key:'requestSource',    label:'Req. Source', w:110, editable:true,  inputType:'text'   },
    { key:'requesterName',    label:'Requester',   w:110, editable:true,  inputType:'select', opts:OWNER_OPTIONS },
    { key:'projectedEndDate', label:'Due Date',    w:95,  editable:true,  inputType:'date'   },
    { key:'progress',         label:'Progress',    w:80,  editable:false  },
    { key:'entryDate',        label:'Entry Date',  w:95,  editable:false  },
    { key:'nextAction',       label:'Next Action', w:180, editable:true,  inputType:'text'   },
    { key:'additionalInfo',   label:'Add\'l Info', w:180, editable:true,  inputType:'text'   },
    { key:'comment',          label:'Comment',     w:160, editable:true,  inputType:'text'   },
  ];
  const DEFAULT_VISIBLE = new Set(['shortId','title','owner','status','priority','points','project','department','type','requestSource','requesterName','projectedEndDate','progress','entryDate']);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [showFieldsPicker, setShowFieldsPicker] = useState(false);
  const fieldsPickerRef = useRef(null);
  const COLS = ALL_COLS.filter(c => visibleCols.has(c.key));

  // Selection state
  const [selected, setSelected] = useState(new Set());
  const lastSelIdx = useRef(-1);

  // Bulk edit state
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkFields, setBulkFields] = useState({ status:'', priority:'', owner:'', project:'', department:'', type:'' });

  // Bulk add state
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [addRows, setAddRows] = useState([emptyAddRow()]);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Inline edit state: { taskId, col }
  const [inlineEdit, setInlineEdit] = useState(null);
  const [inlineVal, setInlineVal] = useState('');
  const inlineRef = useRef(null);

  function emptyAddRow() {
    return { _id: Math.random().toString(36).slice(2), title:'', owner:'', status:'Not Started', priority:'Medium', points:'', project:'', department:'', type:'', requestSource:'', requesterName:'', projectedEndDate:'' };
  }

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setOpenFilter(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (fieldsPickerRef.current && !fieldsPickerRef.current.contains(e.target)) setShowFieldsPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close inline edit on outside click
  useEffect(() => {
    if (!inlineEdit) return;
    const handler = (e) => {
      if (inlineRef.current && !inlineRef.current.contains(e.target)) commitInline();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [inlineEdit, inlineVal]);

  const uniqueVals = (key) => [...new Set(tasks.map(t => String(t[key]||'')).filter(Boolean))].sort();

  const toggleColFilter = (key, val) => {
    setColFilters(prev => {
      const cur = prev[key] || [];
      const next = cur.includes(val) ? cur.filter(v=>v!==val) : [...cur, val];
      return next.length === 0 ? {...prev, [key]: undefined} : {...prev, [key]: next};
    });
  };
  const clearColFilter = (key) => setColFilters(prev => { const n={...prev}; delete n[key]; return n; });
  const activeFilterCount = Object.values(colFilters).filter(v=>v&&v.length).length;

  let filtered = tasks.filter(t => {
    if (!Object.entries(colFilters).every(([key, vals]) => !vals?.length || vals.includes(String(t[key]||'')))) return false;
    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase();
      if (!COLS.some(col => String(t[col.key]||'').toLowerCase().includes(q))) return false;
    }
    return true;
  });
  filtered = [...filtered].sort((a, b) => {
    let av = a[sortCol] ?? '', bv = b[sortCol] ?? '';
    if (sortCol === 'points' || sortCol === 'progress') { av = Number(av); bv = Number(bv); }
    else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortCol === key) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortCol(key); setSortDir('asc'); }
  };

  // ── SELECTION ──
  const allFilteredIds = filtered.map(t=>t.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id=>selected.has(id));
  const someSelected = allFilteredIds.some(id=>selected.has(id));
  const selectedCount = allFilteredIds.filter(id=>selected.has(id)).length;

  const toggleAll = () => {
    if (allSelected) setSelected(prev => { const n=new Set(prev); allFilteredIds.forEach(id=>n.delete(id)); return n; });
    else setSelected(prev => { const n=new Set(prev); allFilteredIds.forEach(id=>n.add(id)); return n; });
  };
  const toggleRow = (id, shiftKey=false) => {
    const idx = filtered.findIndex(t=>t.id===id);
    if (shiftKey && lastSelIdx.current >= 0) {
      const lo=Math.min(idx,lastSelIdx.current), hi=Math.max(idx,lastSelIdx.current);
      setSelected(prev=>{ const n=new Set(prev); filtered.slice(lo,hi+1).forEach(t=>n.add(t.id)); return n; });
    } else {
      setSelected(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
      lastSelIdx.current = idx;
    }
  };
  const clearSelection = () => setSelected(new Set());

  // ── INLINE EDIT ──
  const startInline = (task, col) => {
    if (!col.editable) return;
    setInlineEdit({ taskId: task.id, colKey: col.key });
    setInlineVal(String(task[col.key] ?? ''));
  };
  const commitInline = () => {
    if (!inlineEdit) return;
    const task = tasks.find(t=>t.id===inlineEdit.taskId);
    if (task) {
      const col = COLS.find(c=>c.key===inlineEdit.colKey);
      let val = inlineVal;
      if (col?.inputType === 'number') val = Number(inlineVal) || 0;
      const updPatch = { [inlineEdit.colKey]: val };
      if (inlineEdit.colKey === 'status' && val === 'Completed') updPatch.progress = 1;
      onUpdate({ ...task, ...updPatch, updatedAt: Date.now() });
    }
    setInlineEdit(null);
    setInlineVal('');
  };

  // ── BULK EDIT ──
  const applyBulkEdit = () => {
    const activeFields = Object.entries(bulkFields).filter(([,v])=>v!=='');
    if (!activeFields.length) { setShowBulkEdit(false); return; }
    const selectedTasks = tasks.filter(t=>selected.has(t.id));
    const updatedTasks = selectedTasks.map(t => {
      const patch = {};
      activeFields.forEach(([k,v]) => { patch[k] = k==='points' ? Number(v)||0 : v; });
      return { ...t, ...patch, updatedAt: Date.now() };
    });
    if (onBulkUpdate) onBulkUpdate(updatedTasks); else updatedTasks.forEach(t => onUpdate(t));
    setBulkFields({ status:'', priority:'', owner:'', project:'', department:'', type:'' });
    setShowBulkEdit(false);
    clearSelection();
  };

  // ── BULK DELETE ──
  const applyBulkDelete = () => {
    selected.forEach(id => onDelete(id));
    clearSelection();
    setShowDeleteConfirm(false);
  };

  // ── BULK ADD ──
  const applyBulkAdd = () => {
    const validRows = addRows.filter(r=>r.title.trim());
    if (!validRows.length) return;
    const built = validRows.map(r => {
      const { _id, ...rest } = r;
      return {
        id: uid(), shortId: shortUid(), canvasId: canvasId || 'default',
        title: rest.title.trim(),
        owner: rest.owner, status: rest.status, priority: rest.priority,
        points: Number(rest.points)||0, project: rest.project,
        department: rest.department, type: rest.type,
        requestSource: rest.requestSource||'',
        requesterName: rest.requesterName,
        projectedEndDate: rest.projectedEndDate,
        entryDate: new Date().toISOString().slice(0,10),
        nextAction:'', additionalInfo:'', progress:0,
        relatedTasks:[], blockingTasks:[], subtasks:[],
        x: 400+Math.random()*600, y: 400+Math.random()*400,
        updatedAt: Date.now(), source:'table',
      };
    });
    onAddMany(built);
    setAddRows([emptyAddRow()]);
    setShowBulkAdd(false);
  };

  // ── CSV IMPORT ──
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvStep, setCsvStep] = useState('upload'); // 'upload' | 'map' | 'preview'
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRawRows, setCsvRawRows] = useState([]);
  const [csvMapping, setCsvMapping] = useState({});
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvError, setCsvError] = useState('');
  const csvFileRef = useRef(null);

  const TASK_FIELDS = [
    { key:'title',            label:'Title *'       },
    { key:'owner',            label:'Owner'         },
    { key:'status',           label:'Status'        },
    { key:'priority',         label:'Priority'      },
    { key:'points',           label:'Points'        },
    { key:'project',          label:'Project'       },
    { key:'department',       label:'Department'    },
    { key:'type',             label:'Type'          },
    { key:'requesterName',    label:'Requester Name'},
    { key:'nextAction',       label:'Next Action'   },
    { key:'additionalInfo',   label:'Additional Info'},
    { key:'projectedEndDate', label:'Due Date'      },
    { key:'entryDate',        label:'Entry Date'    },
  ];

  const parseCSV = (text) => {
    const lines = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').trim().split('\n');
    if (lines.length < 2) return { headers:[], rows:[] };
    const parseRow = (line) => {
      const cells = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch==='"' && !inQ) { inQ=true; continue; }
        if (ch==='"' && inQ && line[i+1]==='"') { cur+='"'; i++; continue; }
        if (ch==='"' && inQ) { inQ=false; continue; }
        if (ch===',' && !inQ) { cells.push(cur.trim()); cur=''; continue; }
        cur += ch;
      }
      cells.push(cur.trim());
      return cells;
    };
    const headers = parseRow(lines[0]);
    const rows = lines.slice(1).filter(l=>l.trim()).map(parseRow).filter(r=>r.some(c=>c.trim()));
    return { headers, rows };
  };

  const autoMap = (headers) => {
    const mapping = {};
    const norm = s => s.toLowerCase().replace(/[\s_\-]/g,'');
    const aliases = {
      title:            ['title','name','task','subject','taskname'],
      owner:            ['owner','assignee','assigned','assignedto'],
      status:           ['status','state'],
      priority:         ['priority','pri'],
      points:           ['points','pts','storypoints','effort','size'],
      project:          ['project','projectname','proj'],
      department:       ['department','dept','team'],
      type:             ['type','tasktype','category','cat'],
      requesterName:    ['requestername','requester','reporter','reportername','requestedby'],
      nextAction:       ['nextaction','next','action','description','desc'],
      additionalInfo:   ['additionalinfo','notes','info','body','details'],
      projectedEndDate: ['projectedenddate','duedate','due','deadline','enddate'],
      entryDate:        ['entrydate','created','createdat','date','startdate'],
    };
    headers.forEach(h => {
      const n = norm(h);
      for (const [field, aliasList] of Object.entries(aliases)) {
        if (aliasList.includes(n) && !mapping[field]) {
          mapping[field] = h;
          break;
        }
      }
    });
    return mapping;
  };

  const buildPreview = (rows, headers, mapping) => {
    return rows.slice(0, 200).map(row => {
      const obj = {};
      headers.forEach((h,i) => { obj[h] = row[i] || ''; });
      const task = {};
      TASK_FIELDS.forEach(f => {
        const srcCol = mapping[f.key];
        task[f.key] = srcCol ? obj[srcCol] : '';
      });
      // Normalise status/priority
      const normStatus = STATUS_OPTIONS.find(s => s.toLowerCase() === (task.status||'').toLowerCase()) || 'Not Started';
      const normPriority = PRIORITY_OPTIONS.find(p => p.toLowerCase() === (task.priority||'').toLowerCase()) || 'Medium';
      task.status = normStatus;
      task.priority = normPriority;
      task.points = Number(task.points) || 0;
      return task;
    }).filter(task => Object.values(task).some(v => typeof v === 'string' ? v.trim() : v));
  };

  const handleCsvFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { headers, rows } = parseCSV(ev.target.result);
      if (!headers.length) { setCsvError('Could not parse CSV — make sure it has a header row and comma-separated values.'); return; }
      setCsvHeaders(headers);
      setCsvRawRows(rows);
      const mapping = autoMap(headers);
      setCsvMapping(mapping);
      setCsvPreview(buildPreview(rows, headers, mapping));
      setCsvStep('map');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleMappingChange = (field, csvCol) => {
    const newMapping = { ...csvMapping, [field]: csvCol || undefined };
    if (!csvCol) delete newMapping[field];
    setCsvMapping(newMapping);
    setCsvPreview(buildPreview(csvRawRows, csvHeaders, newMapping));
  };

  const applyCSVImport = () => {
    const validRows = csvPreview.filter(r => r.title?.trim());
    if (!validRows.length) { setCsvError('No rows have a Title — map the Title column before importing.'); return; }
    const built = validRows.map(r => ({
      id: uid(), shortId: shortUid(), canvasId: canvasId || 'default',
      title: r.title.trim(),
      owner: r.owner || '', status: r.status, priority: r.priority,
      points: r.points, project: r.project || '',
      department: r.department || '', type: r.type || '',
      requesterName: r.requesterName || '',
      requestSource: r.requestSource || '',
      nextAction: r.nextAction || '', additionalInfo: r.additionalInfo || '',
      projectedEndDate: r.projectedEndDate || '',
      entryDate: r.entryDate || new Date().toISOString().slice(0,10),
      progress: 0, statusReason:'', comment:'',
      relatedTasks:[], blockingTasks:[], subtasks:[],
      x: 400+Math.random()*600, y: 400+Math.random()*400,
      updatedAt: Date.now(), source:'csv-import',
    }));
    onAddMany(built);
    setShowCsvImport(false);
    setCsvStep('upload');
    setCsvHeaders([]); setCsvRawRows([]); setCsvMapping({}); setCsvPreview([]); setCsvError('');
  };

  const closeCsvImport = () => {
    setShowCsvImport(false);
    setCsvStep('upload');
    setCsvHeaders([]); setCsvRawRows([]); setCsvMapping({}); setCsvPreview([]); setCsvError('');
  };

  const priorityColor = { Critical:'#ef4444', High:'#f97316', Medium:'#f59e0b', Low:'#22c55e' };
  const today = new Date().toISOString().slice(0,10);

  const BtnPrimary = ({onClick,children,style={}}) => (
    <button onClick={onClick} style={{ background:'#6366f1', border:'none', borderRadius:7, padding:'5px 12px', color:'#fff', cursor:'pointer', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:5, ...style }}>{children}</button>
  );
  const BtnGhost = ({onClick,children,style={}}) => (
    <button onClick={onClick} style={{ background:'transparent', border:'1px solid #e2e8f0', borderRadius:7, padding:'5px 12px', color:'#64748b', cursor:'pointer', fontSize:11, fontWeight:600, display:'flex', alignItems:'center', gap:5, ...style }}>{children}</button>
  );
  const BtnDanger = ({onClick,children,style={}}) => (
    <button onClick={onClick} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:7, padding:'5px 12px', color:'#ef4444', cursor:'pointer', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:5, ...style }}>{children}</button>
  );

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#f8fafc' }}>

      {/* ── CSV IMPORT MODAL ── */}
      {showCsvImport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={e=>{ if(e.target===e.currentTarget) closeCsvImport(); }}>
          <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 24px 64px rgba(0,0,0,0.22)', width:'100%', maxWidth:860, maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Modal header */}
            <div style={{ padding:'18px 24px 14px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
              <span style={{ fontSize:18, fontWeight:800, color:'#1e293b', fontFamily:"'Syne',sans-serif" }}>📥 Import CSV</span>
              {csvStep !== 'upload' && (<>
                {['upload','map','preview'].map((s,i)=>(<>
                  <span key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:22, height:22, borderRadius:'50%', background: csvStep===s||(['map','preview'].includes(csvStep)&&i===0)||('preview'===csvStep&&i===1)?'#6366f1':'#e2e8f0', color: csvStep===s||(['map','preview'].includes(csvStep)&&i===0)||('preview'===csvStep&&i===1)?'#fff':'#94a3b8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                    <span style={{ fontSize:11, fontWeight: csvStep===s?700:400, color: csvStep===s?'#6366f1':'#94a3b8' }}>{['Upload','Map Columns','Preview'][i]}</span>
                  </span>
                  {i<2 && <span key={'arr'+i} style={{ color:'#d1d5db', fontSize:12 }}>›</span>}
                </>))}
              </>)}
              <div style={{ flex:1 }} />
              <button onClick={closeCsvImport} style={{ background:'#f1f5f9', border:'none', borderRadius:7, width:28, height:28, cursor:'pointer', fontSize:16, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>

            {/* Modal body */}
            <div style={{ flex:1, overflowY:'auto', padding:24 }}>

              {/* ── STEP 1: UPLOAD ── */}
              {csvStep === 'upload' && (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
                  <div
                    onClick={()=>csvFileRef.current?.click()}
                    style={{ border:'2px dashed #c7d2fe', borderRadius:14, padding:'48px 32px', textAlign:'center', cursor:'pointer', background:'#f8faff', width:'100%', transition:'border-color 0.15s, background 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#6366f1';e.currentTarget.style.background='#eff6ff';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#c7d2fe';e.currentTarget.style.background='#f8faff';}}>
                    <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
                    <div style={{ fontSize:15, fontWeight:700, color:'#1e293b', marginBottom:6 }}>Drop a CSV file or click to browse</div>
                    <div style={{ fontSize:12, color:'#64748b' }}>First row must be headers · UTF-8 encoding · comma or quoted-comma separated</div>
                  </div>
                  <input ref={csvFileRef} type="file" accept=".csv,text/csv" onChange={handleCsvFile} style={{ display:'none' }} />
                  {csvError && <div style={{ color:'#ef4444', fontSize:12, fontWeight:600 }}>⚠ {csvError}</div>}

                  {/* Template download */}
                  <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'14px 18px', width:'100%' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#475569', marginBottom:8 }}>Need a template?</div>
                    <div style={{ fontSize:11, color:'#64748b', marginBottom:10 }}>Download a pre-formatted CSV with all supported column headers.</div>
                    <button onClick={()=>{
                      const headers = TASK_FIELDS.map(f=>f.key).join(',');
                      const example = ['Example Task','Dan','Not Started','High','3','RevOps','Sales','Feature','Mary Wike','Review contract','Check with legal','2025-12-31','2025-01-01'].join(',');
                      const blob = new Blob([headers+'\n'+example], {type:'text/csv'});
                      const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='taskbub_import_template.csv'; a.click();
                    }} style={{ background:'#6366f1', border:'none', borderRadius:7, padding:'6px 14px', color:'#fff', cursor:'pointer', fontSize:11, fontWeight:700 }}>
                      ↓ Download Template
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: MAP COLUMNS ── */}
              {csvStep === 'map' && (
                <div>
                  <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>
                    Found <strong style={{ color:'#1e293b' }}>{csvRawRows.length} rows</strong> and <strong style={{ color:'#1e293b' }}>{csvHeaders.length} columns</strong> in your CSV.
                    Map each TaskBub field to the matching CSV column. Fields left unmapped will be blank or use defaults.
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {TASK_FIELDS.map(f => (
                      <div key={f.key} style={{ display:'flex', alignItems:'center', gap:10, background:'#f8fafc', borderRadius:8, padding:'8px 12px', border: f.key==='title'&&!csvMapping[f.key]?'1px solid #fca5a5':'1px solid #f1f5f9' }}>
                        <span style={{ fontSize:11, fontWeight:600, color:'#475569', width:120, flexShrink:0 }}>{f.label}</span>
                        <span style={{ color:'#d1d5db', fontSize:12 }}>←</span>
                        <select value={csvMapping[f.key]||''} onChange={e=>handleMappingChange(f.key, e.target.value)}
                          style={{ flex:1, border:'1px solid #e2e8f0', borderRadius:6, padding:'4px 6px', fontSize:11, background:'#fff', cursor:'pointer', color: csvMapping[f.key]?'#1e293b':'#94a3b8' }}>
                          <option value="">— skip —</option>
                          {csvHeaders.map(h=>(
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        {csvMapping[f.key] && (
                          <span style={{ fontSize:10, color:'#22c55e', fontWeight:700, flexShrink:0 }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {csvError && <div style={{ color:'#ef4444', fontSize:12, fontWeight:600, marginTop:12 }}>⚠ {csvError}</div>}
                </div>
              )}

              {/* ── STEP 3: PREVIEW ── */}
              {csvStep === 'preview' && (
                <div>
                  <div style={{ fontSize:13, color:'#64748b', marginBottom:12 }}>
                    Previewing <strong style={{ color:'#1e293b' }}>{csvPreview.filter(r=>r.title?.trim()).length} valid tasks</strong> ready to import
                    {csvPreview.filter(r=>!r.title?.trim()).length > 0 && <span style={{ color:'#f59e0b' }}> · {csvPreview.filter(r=>!r.title?.trim()).length} rows skipped (no title)</span>}.
                  </div>
                  <div style={{ overflowX:'auto', borderRadius:8, border:'1px solid #e2e8f0' }}>
                    <table style={{ borderCollapse:'collapse', width:'max-content', minWidth:'100%', fontSize:11 }}>
                      <thead>
                        <tr style={{ background:'#f1f5f9' }}>
                          {['#','Title','Owner','Status','Priority','Pts','Project','Dept','Type','Requester','Due Date'].map(h=>(
                            <th key={h} style={{ padding:'6px 10px', borderBottom:'1px solid #e2e8f0', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:10, textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, i) => {
                          const valid = !!row.title?.trim();
                          return (
                            <tr key={i} style={{ background: !valid?'#fff7ed':i%2===0?'#fff':'#f8fafc', opacity: valid?1:0.5 }}>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', color:'#94a3b8' }}>{i+1}</td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', fontWeight:600, color: valid?'#1e293b':'#ef4444', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.title||'⚠ missing title'}</td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', color:'#475569' }}>{row.owner}</td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9' }}>
                                <span style={{ background:(STATUS_COLORS[row.status]||'#94a3b8')+'20', color:STATUS_COLORS[row.status]||'#64748b', borderRadius:20, padding:'1px 7px', fontSize:10, fontWeight:700 }}>{row.status}</span>
                              </td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', fontWeight:700, color:priorityColor[row.priority]||'#64748b' }}>{row.priority}</td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', color:'#475569', textAlign:'right' }}>{row.points||0}</td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', color:'#475569' }}>{row.project}</td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', color:'#475569' }}>{row.department}</td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', color:'#475569' }}>{row.type}</td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', color:'#475569' }}>{row.requesterName}</td>
                              <td style={{ padding:'5px 10px', borderBottom:'1px solid #f1f5f9', color:'#475569' }}>{row.projectedEndDate}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {csvError && <div style={{ color:'#ef4444', fontSize:12, fontWeight:600, marginTop:12 }}>⚠ {csvError}</div>}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding:'14px 24px', borderTop:'1px solid #e2e8f0', display:'flex', gap:8, justifyContent:'flex-end', flexShrink:0, background:'#f8fafc' }}>
              {csvStep === 'map' && (<>
                <BtnGhost onClick={()=>setCsvStep('upload')}>← Back</BtnGhost>
                <BtnPrimary onClick={()=>{ setCsvPreview(buildPreview(csvRawRows,csvHeaders,csvMapping)); setCsvStep('preview'); }}>
                  Preview {csvRawRows.length} rows →
                </BtnPrimary>
              </>)}
              {csvStep === 'preview' && (<>
                <BtnGhost onClick={()=>setCsvStep('map')}>← Back to Mapping</BtnGhost>
                <BtnPrimary onClick={applyCSVImport} style={{ background:'#22c55e' }}>
                  ✓ Import {csvPreview.filter(r=>r.title?.trim()).length} tasks
                </BtnPrimary>
              </>)}
              {csvStep === 'upload' && <BtnGhost onClick={closeCsvImport}>Cancel</BtnGhost>}
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:8, padding:'0 14px', flexShrink:0, flexWrap:'wrap', minHeight:44 }}>
        <span style={{ fontSize:11, color:'#64748b', fontWeight:600, whiteSpace:'nowrap' }}>{filtered.length} of {tasks.length} tasks</span>
        {activeFilterCount > 0 && <span style={{ background:'#6366f1', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:10, fontWeight:700 }}>{activeFilterCount} filter{activeFilterCount>1?'s':''}</span>}
        {activeFilterCount > 0 && <button onClick={()=>setColFilters({})} style={{ background:'transparent', border:'1px solid #e2e8f0', borderRadius:5, padding:'2px 8px', fontSize:10, color:'#64748b', cursor:'pointer' }}>✕ Clear filters</button>}

        <div style={{ width:1, height:20, background:'#e2e8f0', margin:'0 2px' }} />

        {/* Selection count + bulk actions */}
        {selectedCount > 0 ? (<>
          <span style={{ fontSize:11, fontWeight:700, color:'#6366f1', background:'rgba(99,102,241,0.08)', borderRadius:6, padding:'3px 8px' }}>
            {selectedCount} selected
          </span>
          <BtnPrimary onClick={()=>{ setShowBulkEdit(true); setShowBulkAdd(false); setShowDeleteConfirm(false); }}>✏ Bulk Edit</BtnPrimary>
          <BtnDanger onClick={()=>{ setShowDeleteConfirm(true); setShowBulkEdit(false); setShowBulkAdd(false); }}>🗑 Delete {selectedCount}</BtnDanger>
          <BtnGhost onClick={clearSelection}>✕ Deselect</BtnGhost>
        </>) : (<>
          <BtnPrimary onClick={()=>{ setShowBulkAdd(true); setShowBulkEdit(false); setShowDeleteConfirm(false); }}>+ Bulk Add</BtnPrimary>

          {/* Fields picker button */}
          <div style={{ position:'relative' }} ref={fieldsPickerRef}>
            <BtnGhost onClick={()=>setShowFieldsPicker(v=>!v)}>
              ⊞ Fields {visibleCols.size < ALL_COLS.length ? <span style={{ background:'#6366f1', color:'#fff', borderRadius:9, padding:'0 5px', fontSize:9, fontWeight:700 }}>{visibleCols.size}</span> : ''}
            </BtnGhost>
            {showFieldsPicker && (
              <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:500, padding:12, minWidth:200 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Show / Hide Columns</div>
                <div style={{ display:'flex', flexDirection:'column', gap:3, maxHeight:280, overflowY:'auto' }}>
                  {ALL_COLS.map(col => (
                    <label key={col.key} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 6px', borderRadius:6, cursor:'pointer', fontSize:11, color:'#1e293b' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <input type="checkbox" checked={visibleCols.has(col.key)}
                        onChange={()=>setVisibleCols(prev => {
                          const n = new Set(prev);
                          if (n.has(col.key)) { if(n.size>1) n.delete(col.key); } else n.add(col.key);
                          return n;
                        })}
                        style={{ accentColor:'#6366f1', cursor:'pointer' }} />
                      {col.label}
                    </label>
                  ))}
                </div>
                <button onClick={()=>setVisibleCols(new Set(ALL_COLS.map(c=>c.key)))}
                  style={{ marginTop:8, fontSize:10, color:'#6366f1', background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:0 }}>Show all</button>
                <span style={{ color:'#d1d5db', margin:'0 6px' }}>·</span>
                <button onClick={()=>setVisibleCols(DEFAULT_VISIBLE)}
                  style={{ fontSize:10, color:'#64748b', background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:0 }}>Reset</button>
              </div>
            )}
          </div>
        </>)}

        <div style={{ flex:1 }} />
        <button onClick={()=>{ setShowCsvImport(true); setCsvStep('upload'); }} style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:7, padding:'4px 10px', color:'#64748b', cursor:'pointer', fontSize:11, fontWeight:600 }}>
          📥 Import CSV
        </button>
        <button onClick={()=>exportCSV(filtered)} style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:7, padding:'4px 10px', color:'#64748b', cursor:'pointer', fontSize:11, fontWeight:600 }}>
          ↓ Export CSV{activeFilterCount>0?' (filtered)':''}
        </button>
      </div>

      {/* ── BULK EDIT PANEL ── */}
      {showBulkEdit && (
        <div style={{ background:'#eff6ff', borderBottom:'2px solid #6366f1', padding:'12px 16px', display:'flex', flexWrap:'wrap', gap:10, alignItems:'flex-end', flexShrink:0 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'#6366f1', marginRight:4, alignSelf:'center' }}>✏ Bulk Edit — {selectedCount} tasks</span>
          {[
            { key:'status',     label:'Status',     opts:STATUS_OPTIONS },
            { key:'priority',   label:'Priority',   opts:PRIORITY_OPTIONS },
            { key:'owner',      label:'Owner',      opts:null },
            { key:'project',    label:'Project',    opts:null },
            { key:'department', label:'Department', opts:null },
            { key:'type',       label:'Type',       opts:null },
          ].map(f => (
            <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:3 }}>
              <label style={{ fontSize:10, fontWeight:700, color:'#6366f1', textTransform:'uppercase' }}>{f.label}</label>
              {f.opts ? (
                <select value={bulkFields[f.key]} onChange={e=>setBulkFields(p=>({...p,[f.key]:e.target.value}))}
                  style={{ border:'1px solid #c7d2fe', borderRadius:6, padding:'5px 8px', fontSize:11, background:'#fff', color:'#1e293b', minWidth:110, cursor:'pointer' }}>
                  <option value="">— no change —</option>
                  {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input value={bulkFields[f.key]} onChange={e=>setBulkFields(p=>({...p,[f.key]:e.target.value}))}
                  placeholder="no change"
                  style={{ border:'1px solid #c7d2fe', borderRadius:6, padding:'5px 8px', fontSize:11, background:'#fff', color:'#1e293b', width:110, outline:'none' }} />
              )}
            </div>
          ))}
          <div style={{ display:'flex', gap:6, alignSelf:'flex-end' }}>
            <BtnPrimary onClick={applyBulkEdit}>Apply to {selectedCount}</BtnPrimary>
            <BtnGhost onClick={()=>setShowBulkEdit(false)}>Cancel</BtnGhost>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM PANEL ── */}
      {showDeleteConfirm && (
        <div style={{ background:'#fff1f2', borderBottom:'2px solid #ef4444', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#ef4444' }}>🗑 Delete {selectedCount} task{selectedCount>1?'s':''}?</span>
          <span style={{ fontSize:11, color:'#64748b' }}>This cannot be undone.</span>
          <BtnDanger onClick={applyBulkDelete}>Yes, delete {selectedCount}</BtnDanger>
          <BtnGhost onClick={()=>setShowDeleteConfirm(false)}>Cancel</BtnGhost>
        </div>
      )}

      {/* ── BULK ADD PANEL ── */}
      {showBulkAdd && (
        <div style={{ background:'#f0fdf4', borderBottom:'2px solid #22c55e', padding:'12px 16px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#15803d' }}>+ Bulk Add Tasks</span>
            <button onClick={()=>setAddRows(r=>[...r, emptyAddRow()])}
              style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.4)', borderRadius:6, padding:'3px 9px', fontSize:11, fontWeight:700, color:'#15803d', cursor:'pointer' }}>+ Row</button>
            <div style={{ flex:1 }} />
            <BtnPrimary onClick={applyBulkAdd} style={{ background:'#22c55e' }}>
              ✓ Add {addRows.filter(r=>r.title.trim()).length} task{addRows.filter(r=>r.title.trim()).length!==1?'s':''}
            </BtnPrimary>
            <BtnGhost onClick={()=>{ setShowBulkAdd(false); setAddRows([emptyAddRow()]); }}>Cancel</BtnGhost>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', fontSize:11 }}>
              <thead>
                <tr style={{ background:'rgba(34,197,94,0.08)' }}>
                  {['Title *','Owner','Status','Priority','Pts','Project','Dept','Type','Requester','Due Date',''].map((h,i)=>(
                    <th key={i} style={{ padding:'4px 8px', textAlign:'left', fontSize:10, fontWeight:700, color:'#15803d', textTransform:'uppercase', whiteSpace:'nowrap', borderBottom:'1px solid rgba(34,197,94,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {addRows.map((row, ri) => (
                  <tr key={row._id}>
                    {[
                      { k:'title',            w:180, type:'text'   },
                      { k:'owner',            w:90,  type:'text'   },
                      { k:'status',           w:110, type:'select', opts:STATUS_OPTIONS },
                      { k:'priority',         w:90,  type:'select', opts:PRIORITY_OPTIONS },
                      { k:'points',           w:50,  type:'number' },
                      { k:'project',          w:110, type:'text'   },
                      { k:'department',       w:90,  type:'text'   },
                      { k:'type',             w:90,  type:'text'   },
                      { k:'requesterName',    w:100, type:'text'   },
                      { k:'projectedEndDate', w:105, type:'date'   },
                    ].map(f => (
                      <td key={f.k} style={{ padding:'3px 4px', borderBottom:'1px solid rgba(34,197,94,0.15)' }}>
                        {f.type === 'select' ? (
                          <select value={row[f.k]} onChange={e=>setAddRows(rows=>rows.map((r,i2)=>i2===ri?{...r,[f.k]:e.target.value}:r))}
                            style={{ border:'1px solid #bbf7d0', borderRadius:5, padding:'4px 5px', fontSize:11, width:f.w, background:'#fff', cursor:'pointer' }}>
                            {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type={f.type} value={row[f.k]} onChange={e=>setAddRows(rows=>rows.map((r,i2)=>i2===ri?{...r,[f.k]:e.target.value}:r))}
                            style={{ border:'1px solid #bbf7d0', borderRadius:5, padding:'4px 6px', fontSize:11, width:f.w, outline:'none', background: row[f.k]||f.k!=='title'?'#fff':'#fef2f2' }} />
                        )}
                      </td>
                    ))}
                    <td style={{ padding:'3px 4px' }}>
                      <button onClick={()=>setAddRows(rows=>rows.filter((_,i2)=>i2!==ri))}
                        style={{ background:'transparent', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:14, padding:'2px 4px' }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      <div style={{ flex:1, overflow:'auto' }}>
        <table style={{ borderCollapse:'collapse', width:'max-content', minWidth:'100%', fontSize:12 }}>
          <thead>
            <tr style={{ background:'#f1f5f9', position:'sticky', top:0, zIndex:10 }}>
              {/* Select-all checkbox */}
              <th style={{ width:36, padding:'6px 10px', borderBottom:'2px solid #e2e8f0', borderRight:'1px solid #e2e8f0', textAlign:'center' }}>
                <input type="checkbox" checked={allSelected} ref={el=>{ if(el) el.indeterminate=someSelected&&!allSelected; }}
                  onChange={toggleAll} style={{ accentColor:'#6366f1', cursor:'pointer', width:14, height:14 }} />
              </th>
              {COLS.map(col => {
                const hasFilter = colFilters[col.key]?.length > 0;
                const isSorted = sortCol === col.key;
                return (
                  <th key={col.key} style={{ width:col.w, minWidth:col.w, textAlign:'left', padding:'6px 8px', borderBottom:'2px solid #e2e8f0', borderRight:'1px solid #e2e8f0', position:'relative', userSelect:'none', whiteSpace:'nowrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                      <span onClick={()=>handleSort(col.key)} style={{ cursor:'pointer', color:isSorted?'#6366f1':'#475569', fontWeight:isSorted?700:600, fontSize:11, flex:1 }}>
                        {col.label} {isSorted?(sortDir==='asc'?'↑':'↓'):''}
                      </span>
                      <button onClick={()=>setOpenFilter(openFilter===col.key?null:col.key)}
                        style={{ background:hasFilter?'#6366f1':'transparent', border:hasFilter?'none':'1px solid #e2e8f0', borderRadius:4, width:17, height:17, cursor:'pointer', fontSize:9, color:hasFilter?'#fff':'#94a3b8', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        ▾
                      </button>
                    </div>
                    {openFilter === col.key && (
                      <div ref={filterRef} style={{ position:'absolute', top:'100%', left:0, minWidth:170, background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:1000, padding:8 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                          <span style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>{col.label}</span>
                          {hasFilter && <button onClick={()=>clearColFilter(col.key)} style={{ fontSize:9, color:'#6366f1', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Clear</button>}
                        </div>
                        <div style={{ maxHeight:200, overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
                          {uniqueVals(col.key).map(val => (
                            <label key={val} style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 4px', borderRadius:4, cursor:'pointer', fontSize:11, color:'#1e293b' }}>
                              <input type="checkbox" checked={(colFilters[col.key]||[]).includes(val)} onChange={()=>toggleColFilter(col.key, val)} style={{ accentColor:'#6366f1', cursor:'pointer' }} />
                              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val||'(empty)'}</span>
                            </label>
                          ))}
                          {uniqueVals(col.key).length === 0 && <span style={{ fontSize:10, color:'#94a3b8' }}>No values</span>}
                        </div>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.flatMap((task, i) => {
              const isSelected = selected.has(task.id);
              const isOverdue = task.projectedEndDate && task.projectedEndDate < today && task.status !== 'Completed' && task.status !== 'Cancelled';
              const mainRow = (
                <tr key={task.id}
                  style={{ background: isSelected?'#eff6ff':i%2===0?'#fff':'#f8fafc', transition:'background 0.08s' }}
                  onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background='#f8faff'; }}
                  onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background=i%2===0?'#fff':'#f8fafc'; }}>

                  {/* Checkbox */}
                  <td style={{ padding:'6px 10px', borderBottom:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', textAlign:'center', cursor:'pointer' }}
                    onClick={e=>{ e.stopPropagation(); toggleRow(task.id, e.shiftKey); }}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}>
                      <input type="checkbox" checked={isSelected} onChange={e=>toggleRow(task.id, e.nativeEvent?.shiftKey||false)}
                        style={{ accentColor:'#6366f1', cursor:'pointer', width:14, height:14, pointerEvents:'none' }} />
                    </div>
                  </td>

                  {/* Data cells — double-click to inline edit */}
                  {COLS.map(col => {
                    const isEditing = inlineEdit?.taskId===task.id && inlineEdit?.colKey===col.key;
                    const val = task[col.key];
                    return (
                      <td key={col.key}
                        style={{ padding:'6px 8px', borderBottom:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', maxWidth:col.w, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor: col.editable?'text':'default', position:'relative' }}
                        onDoubleClick={()=>{ if(col.editable){ startInline(task,col); } else { onSelectTask(task.id); } }}
                        onClick={()=>{ if(!col.editable) onSelectTask(task.id); }}>

                        {isEditing ? (
                          <div ref={inlineRef} style={{ position:'absolute', inset:0, zIndex:50, display:'flex' }}>
                            {col.inputType==='select' ? (
                              <select autoFocus value={inlineVal} onChange={e=>setInlineVal(e.target.value)} onBlur={commitInline}
                                onKeyDown={e=>{ if(e.key==='Enter'||e.key==='Tab') commitInline(); if(e.key==='Escape'){setInlineEdit(null);} }}
                                style={{ width:'100%', border:'2px solid #6366f1', borderRadius:4, padding:'0 4px', fontSize:11, background:'#fff', outline:'none' }}>
                                {col.opts.map(o=><option key={o} value={o}>{o}</option>)}
                              </select>
                            ) : (() => {
                              const fdef = settings?.fieldDefs?.[col.key];
                              const managed = fdef?.values?.length > 0;
                              return managed ? (
                                <select autoFocus value={inlineVal} onChange={e=>setInlineVal(e.target.value)} onBlur={commitInline}
                                  onKeyDown={e=>{ if(e.key==='Enter'||e.key==='Tab') commitInline(); if(e.key==='Escape'){setInlineEdit(null);} }}
                                  style={{ width:'100%', border:'2px solid #6366f1', borderRadius:4, padding:'0 4px', fontSize:11, background:'#fff', outline:'none' }}>
                                  <option value="">— none —</option>
                                  {fdef.values.map(o=><option key={o} value={o}>{o}</option>)}
                                </select>
                              ) : (
                                <input autoFocus type={col.inputType||'text'} value={inlineVal}
                                  onChange={e=>setInlineVal(e.target.value)}
                                  onBlur={commitInline}
                                  onKeyDown={e=>{ if(e.key==='Enter'||e.key==='Tab') commitInline(); if(e.key==='Escape'){setInlineEdit(null);} }}
                                  style={{ width:'100%', border:'2px solid #6366f1', borderRadius:4, padding:'0 5px', fontSize:11, outline:'none', background:'#fff' }} />
                              );
                            })()}
                          </div>
                        ) : (
                          <>
                            {col.key==='shortId'      && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#6366f1', fontWeight:700, letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{getShortId(task)}</span>}
                            {col.key==='title'        && (() => {
                              const hasChildren = allTasks.some(x=>x.parentId===task.id);
                              const isOpen = expandedParents.has(task.id);
                              return (
                                <span style={{display:'flex',alignItems:'center',gap:4}}>
                                  {hasChildren && (
                                    <button onClick={e=>{e.stopPropagation();toggleExpand(task.id);}}
                                      style={{background:'none',border:'1px solid #c7d2fe',borderRadius:3,width:16,height:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#6366f1',flexShrink:0,padding:0}}>
                                      {isOpen?'-':'+'}
                                    </button>
                                  )}
                                  <span style={{fontWeight:600,color:'#1e293b'}}>{val||'Untitled'}</span>
                                </span>
                              );
                            })()}
                            {col.key==='owner'        && <span style={{ color:'#475569' }}>{val||''}</span>}
                            {col.key==='status'       && <span style={{ background:(STATUS_COLORS[val]||'#94a3b8')+'20', color:STATUS_COLORS[val]||'#64748b', borderRadius:20, padding:'2px 7px', fontSize:10, fontWeight:700 }}>{val}</span>}
                            {col.key==='priority'     && <span style={{ color:priorityColor[val]||'#64748b', fontWeight:700, fontSize:11 }}>{val||''}</span>}
                            {col.key==='points'       && <span style={{ color:'#475569' }}>{val||0}</span>}
                            {col.key==='project'      && <span style={{ color:'#475569' }}>{val||''}</span>}
                            {col.key==='department'   && <span style={{ color:'#475569' }}>{val||''}</span>}
                            {col.key==='type'         && <span style={{ color:'#475569' }}>{val||''}</span>}
                            {col.key==='requestSource'&& <span style={{ color:'#475569' }}>{val||''}</span>}
                            {col.key==='requesterName'&& <span style={{ color:'#475569' }}>{val||''}</span>}
                            {col.key==='nextAction'   && <span style={{ color:'#475569' }}>{val||''}</span>}
                            {col.key==='additionalInfo'&&<span style={{ color:'#475569' }}>{val||''}</span>}
                            {col.key==='comment'      && <span style={{ color:'#475569' }}>{val||''}</span>}
                            {col.key==='projectedEndDate' && <span style={{ color:isOverdue?'#ef4444':'#475569', fontWeight:isOverdue?700:400 }}>{val||''}</span>}
                            {col.key==='progress'  && (
                              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                <div style={{ flex:1, height:5, background:'#e2e8f0', borderRadius:3 }}>
                                  <div style={{ height:'100%', width:`${Math.round((val||0)*100)}%`, background:'#6366f1', borderRadius:3 }} />
                                </div>
                                <span style={{ fontSize:10, color:'#64748b', width:26, textAlign:'right' }}>{Math.round((val||0)*100)}%</span>
                              </div>
                            )}
                            {col.key==='entryDate' && <span style={{ color:'#94a3b8' }}>{val||''}</span>}
                            {col.editable && <span style={{ position:'absolute', right:3, top:'50%', transform:'translateY(-50%)', fontSize:8, color:'#c7d2fe', opacity:0 }} className="edit-hint">✎</span>}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
              // If this parent is expanded, also render child rows
              const children = expandedParents.has(task.id) ? allTasks.filter(x=>x.parentId===task.id) : [];
              return [mainRow, ...children.map((child,ci)=>(
                <tr key={`child-${child.id}`} style={{background:'#f0f4ff'}}>
                  <td style={{padding:'4px 10px',borderBottom:'1px solid #f1f5f9',borderRight:'1px solid #f1f5f9',textAlign:'center'}}>
                    <input type="checkbox" checked={selected.has(child.id)} onChange={()=>toggleRow(child.id)}
                      style={{accentColor:'#6366f1',cursor:'pointer',width:13,height:13}} />
                  </td>
                  {COLS.map(col=>(
                    <td key={col.key} style={{padding:'4px 8px',borderBottom:'1px solid #f1f5f9',borderRight:'1px solid #f1f5f9',fontSize:11,color:'#64748b',cursor:'pointer'}}
                      onClick={()=>onSelectTask(child.id)}
                      onDoubleClick={()=>onSelectTask(child.id)}>
                      {col.key==='title' ? <span style={{paddingLeft:18,color:'#4b5563',fontStyle:'italic'}}>{child.title||'Untitled subtask'}</span>
                       : col.key==='status' ? <span style={{background:(STATUS_COLORS[child.status]||'#94a3b8')+'20',color:STATUS_COLORS[child.status]||'#64748b',borderRadius:20,padding:'1px 6px',fontSize:10,fontWeight:700}}>{child.status}</span>
                       : col.key==='progress' ? <span>{Math.round((child.progress||0)*100)}%</span>
                       : <span>{child[col.key]||''}</span>}
                    </td>
                  ))}
                </tr>
              ))];
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={COLS.length+1} style={{ padding:40, textAlign:'center', color:'#94a3b8', fontSize:13 }}>No tasks match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      <div style={{ height:28, background:'#fff', borderTop:'1px solid #e2e8f0', display:'flex', alignItems:'center', padding:'0 14px', gap:10, flexShrink:0 }}>
        <span style={{ fontSize:10, color:'#94a3b8' }}>{filtered.length} rows shown · {selectedCount} selected · double-click a cell to edit inline</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────
function DashboardView({ tasks }) {
  const [timeRange, setTimeRange] = useState('30d');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [exp, setExp] = useState(null);
  const [dashDetail, setDashDetail] = useState(null);
  const toggle = (k) => setExp(p=>p===k?null:k);

  const today = new Date();
  const cutoff = timeRange === '7d' ? new Date(today - 7*864e5)
    : timeRange === '30d' ? new Date(today - 30*864e5)
    : timeRange === '90d' ? new Date(today - 90*864e5)
    : null;

  const inRange = (t) => {
    if (!cutoff) return true;
    const d = new Date(t.entryDate || t.updatedAt || 0);
    return d >= cutoff;
  };

  const owners = [...new Set(tasks.map(t=>t.owner).filter(Boolean))].sort();
  const baseTasks = tasks.filter(t => inRange(t) && (ownerFilter === 'all' || t.owner === ownerFilter));

  // Metrics
  const totalPoints = baseTasks.reduce((s,t)=>s+(t.points||0), 0);
  const completedTasks = baseTasks.filter(t=>t.status==='Completed');
  const completedPoints = completedTasks.reduce((s,t)=>s+(t.points||0), 0);
  const notStartedTasks = baseTasks.filter(t=>t.status==='Not Started');
  const inProgressTasks = baseTasks.filter(t=>t.status==='In Progress');
  const blockedTasks = baseTasks.filter(t=>t.status==='Blocked');
  const reviewTasks = baseTasks.filter(t=>t.status==='Review');
  const cancelledTasks = baseTasks.filter(t=>t.status==='Cancelled');
  const overdueTasks = baseTasks.filter(t => t.projectedEndDate && t.projectedEndDate < today.toISOString().slice(0,10) && t.status !== 'Completed' && t.status !== 'Cancelled');

  // By status
  const byStatus = STATUS_OPTIONS.map(s => ({ label:s, count:baseTasks.filter(t=>t.status===s).length, pts:baseTasks.filter(t=>t.status===s).reduce((s,t)=>s+(t.points||0),0) }));

  // By project
  const projectMap = {};
  baseTasks.filter(t=>t.status!=='Completed').forEach(t => {
    const p = t.project || '(No Project)';
    if (!projectMap[p]) projectMap[p] = { tasks:0, pts:0 };
    projectMap[p].tasks++;
    projectMap[p].pts += t.points||0;
  });
  const byProject = Object.entries(projectMap).sort((a,b)=>b[1].pts-a[1].pts).slice(0,10);

  // By owner (when showing all)
  const ownerMap = {};
  tasks.filter(inRange).forEach(t => {
    const o = t.owner || '(Unassigned)';
    if (!ownerMap[o]) ownerMap[o] = { tasks:0, pts:0, completed:0, blocked:0, inProgress:0 };
    ownerMap[o].tasks++;
    ownerMap[o].pts += t.points||0;
    if (t.status==='Completed') ownerMap[o].completed++;
    if (t.status==='Blocked') ownerMap[o].blocked++;
    if (t.status==='In Progress') ownerMap[o].inProgress++;
  });
  const byOwner = Object.entries(ownerMap).sort((a,b)=>b[1].pts-a[1].pts);

  // Priority breakdown
  const priorityMap = {};
  baseTasks.filter(t=>t.status!=='Completed').forEach(t => {
    const p = t.priority || 'Unknown';
    if (!priorityMap[p]) priorityMap[p] = 0;
    priorityMap[p]++;
  });

  // Weekly velocity (last 8 weeks, completed tasks)
  const weeklyVelocity = [];
  for (let i = 7; i >= 0; i--) {
    const wEnd = new Date(today - i*7*864e5);
    const wStart = new Date(wEnd - 7*864e5);
    const count = tasks.filter(t => {
      if (t.status !== 'Completed') return false;
      const d = new Date(t.actualEndDate || t.updatedAt || 0);
      return d >= wStart && d < wEnd;
    }).length;
    const label = `W${8-i}`;
    weeklyVelocity.push({ label, count });
  }
  const maxVel = Math.max(...weeklyVelocity.map(w=>w.count), 1);

  const Card = ({ children, style={}, onClick }) => (
    <div onClick={onClick} style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', padding:'24px 22px', minHeight:110, cursor:onClick?'pointer':'default', ...style }}>{children}</div>
  );
  const Label = ({ children }) => <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{children}</div>;
  const Big = ({ children, color='#1e293b' }) => <div style={{ fontSize:32, fontWeight:800, color, fontFamily:"'Syne', sans-serif", lineHeight:1.1 }}>{children}</div>;

  const TaskRow = ({t}) => (
    <div onClick={()=>setDashDetail(t)} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 8px',borderRadius:6,cursor:'pointer',marginBottom:2,background:'#f8fafc'}}
      onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'} onMouseLeave={e=>e.currentTarget.style.background='#f8fafc'}>
      <div style={{width:7,height:7,borderRadius:'50%',background:STATUS_COLORS[t.status]||'#94a3b8',flexShrink:0}}/>
      <span style={{flex:1,fontSize:11,color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</span>
      <span style={{fontSize:10,color:'#94a3b8'}}>{t.owner}</span>
    </div>
  );
  const Expand = ({k,tasks:ts}) => exp!==k?null:(
    <div style={{marginTop:10,borderTop:'1px solid #f1f5f9',paddingTop:8}}>
      {ts.length===0?<div style={{fontSize:11,color:'#94a3b8',fontStyle:'italic'}}>No tasks</div>:ts.map(t=><TaskRow key={t.id} t={t}/>)}
    </div>
  );

  const priorityColors = { Critical:'#ef4444', High:'#f97316', Medium:'#f59e0b', Low:'#22c55e', Unknown:'#94a3b8' };
  const completionRate = baseTasks.length > 0 ? Math.round((completedTasks.length / baseTasks.length) * 100) : 0;
  const avgProgress = baseTasks.length > 0 ? Math.round(baseTasks.reduce((s,t)=>s+(t.progress||0),0)/baseTasks.length*100) : 0;

  if (dashDetail) return (
    <div style={{flex:1,overflowY:'auto',background:'#f8fafc',padding:'20px'}}>
      <button onClick={()=>setDashDetail(null)} style={{background:'#6366f1',color:'#fff',border:'none',borderRadius:7,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',marginBottom:16}}>
        Back to Dashboard
      </button>
      <div style={{background:'#fff',borderRadius:12,border:'1px solid #e2e8f0',padding:'20px 24px'}}>
        <div style={{fontSize:17,fontWeight:800,color:'#1e293b',marginBottom:8,fontFamily:"'Syne',sans-serif"}}>{dashDetail.title}</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14}}>
          {dashDetail.status&&<span style={{background:(STATUS_COLORS[dashDetail.status]||'#94a3b8')+'25',color:STATUS_COLORS[dashDetail.status]||'#64748b',borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:700}}>{dashDetail.status}</span>}
          {dashDetail.owner&&<span style={{background:'#f1f5f9',color:'#64748b',borderRadius:20,padding:'2px 10px',fontSize:11}}>{dashDetail.owner}</span>}
          {dashDetail.priority&&<span style={{background:'rgba(99,102,241,0.1)',color:'#6366f1',borderRadius:20,padding:'2px 10px',fontSize:11}}>{dashDetail.priority}</span>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,fontSize:12,color:'#475569',marginBottom:12}}>
          {dashDetail.project&&<div><strong>Project:</strong> {dashDetail.project}</div>}
          {dashDetail.department&&<div><strong>Dept:</strong> {dashDetail.department}</div>}
          {dashDetail.projectedEndDate&&<div><strong>Due:</strong> {dashDetail.projectedEndDate}</div>}
          {dashDetail.points&&<div><strong>Points:</strong> {dashDetail.points}</div>}
        </div>
        {dashDetail.additionalInfo&&<div style={{fontSize:12,color:'#64748b',marginTop:8,lineHeight:1.6}}>{dashDetail.additionalInfo}</div>}
        {dashDetail.nextAction&&<div style={{fontSize:12,color:'#475569',marginTop:8}}><strong>Next:</strong> {dashDetail.nextAction}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ flex:1, overflowY:'auto', background:'#f8fafc', padding:'20px 20px 40px' }}>
      {/* Dashboard toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <span style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>Dashboard</span>
        <div style={{ display:'flex', gap:3, background:'#f1f5f9', borderRadius:8, padding:3 }}>
          {[['7d','7 Days'],['30d','30 Days'],['90d','90 Days'],['all','All Time']].map(([v,l])=>(
            <button key={v} onClick={()=>setTimeRange(v)}
              style={{ background:timeRange===v?'#fff':'transparent', border:timeRange===v?'1px solid #e2e8f0':'1px solid transparent', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:timeRange===v?700:500, color:timeRange===v?'#6366f1':'#64748b', cursor:'pointer', transition:'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'#f1f5f9', borderRadius:8, padding:'4px 10px' }}>
          <span style={{ fontSize:11, color:'#64748b' }}>Owner:</span>
          <select value={ownerFilter} onChange={e=>setOwnerFilter(e.target.value)}
            style={{ border:'none', background:'transparent', fontSize:11, fontWeight:600, color:'#1e293b', cursor:'pointer', outline:'none' }}>
            <option value="all">All</option>
            {owners.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <span style={{ fontSize:11, color:'#94a3b8' }}>{baseTasks.length} tasks in range</span>
      </div>

      {/* KPI row — ordered to match STATUS_OPTIONS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))', gap:12, marginBottom:exp?8:18 }}>
        <Card onClick={()=>toggle('notstarted')}>
          <Label>Not Started</Label>
          <Big color="#475569">{notStartedTasks.length}</Big>
        </Card>
        <Card onClick={()=>toggle('inprog')}>
          <Label>In Progress</Label>
          <Big color="#3b82f6">{inProgressTasks.length}</Big>
        </Card>
        <Card onClick={()=>toggle('blocked')}>
          <Label>Blocked</Label>
          <Big color="#ef4444">{blockedTasks.length}</Big>
        </Card>
        <Card onClick={()=>toggle('review')}>
          <Label>Review</Label>
          <Big color="#f59e0b">{reviewTasks.length}</Big>
        </Card>
        <Card onClick={()=>toggle('completed')}>
          <Label>Completed</Label>
          <Big color="#22c55e">{completedTasks.length}</Big>
          <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{completionRate}% rate</div>
        </Card>
        <Card onClick={()=>toggle('cancelled')}>
          <Label>Cancelled</Label>
          <Big color="#6b7280">{cancelledTasks.length}</Big>
        </Card>
        <Card onClick={()=>toggle('overdue')}>
          <Label>Overdue</Label>
          <Big color={overdueTasks.length>0?"#f97316":"#94a3b8"}>{overdueTasks.length}</Big>
        </Card>
        <Card onClick={()=>toggle('totalpts')}>
          <Label>Total Points</Label>
          <Big>{totalPoints}</Big>
          <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{completedPoints} completed</div>
        </Card>
        <Card>
          <Label>Avg Progress</Label>
          <Big color="#6366f1">{avgProgress}%</Big>
          <div style={{ height:4, background:'#e2e8f0', borderRadius:2, marginTop:6 }}>
            <div style={{ height:'100%', width:`${avgProgress}%`, background:'#6366f1', borderRadius:2 }} />
          </div>
        </Card>
      </div>
      {/* Full-width KPI expand */}
      {exp && ['notstarted','inprog','blocked','review','completed','cancelled','overdue','totalpts'].includes(exp) && (() => {
        const kpiMap = { notstarted:notStartedTasks, inprog:inProgressTasks, blocked:blockedTasks, review:reviewTasks, completed:completedTasks, cancelled:cancelledTasks, overdue:overdueTasks, totalpts:baseTasks };
        const kpiLabel = { notstarted:'Not Started', inprog:'In Progress', blocked:'Blocked', review:'Review', completed:'Completed', cancelled:'Cancelled', overdue:'Overdue', totalpts:'All Tasks' };
        const kpiTasks = kpiMap[exp] || [];
        return (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #e2e8f0',padding:'14px 18px',marginBottom:18}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:700,color:'#1e293b'}}>{kpiLabel[exp]} — {kpiTasks.length} tasks</div>
              <button onClick={()=>setExp(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:'#94a3b8',lineHeight:1}}>✕</button>
            </div>
            <div style={{maxHeight:300,overflowY:'auto'}}>
              {kpiTasks.length===0?<div style={{fontSize:11,color:'#94a3b8',fontStyle:'italic'}}>No tasks</div>:kpiTasks.map(t=><TaskRow key={t.id} t={t}/>)}
            </div>
          </div>
        );
      })()}

      {/* Main charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>

        {/* Status breakdown */}
        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:'#1e293b', marginBottom:14 }}>Status Breakdown</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {byStatus.filter(s=>s.count>0).map(({label,count,pts}) => (
              <div key={label}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'#475569', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:STATUS_COLORS[label]||'#94a3b8', display:'inline-block' }} />
                    {label}
                  </span>
                  <span style={{ fontSize:11, color:'#64748b' }}>{count} tasks · {pts} pts</span>
                </div>
                <div style={{ height:6, background:'#f1f5f9', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${baseTasks.length>0?Math.round(count/baseTasks.length*100):0}%`, background:STATUS_COLORS[label]||'#94a3b8', borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly velocity */}
        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:'#1e293b', marginBottom:4 }}>Completion Velocity <span style={{ fontSize:11, color:'#94a3b8', fontWeight:400 }}>(tasks completed / week)</span></div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:100, paddingTop:10 }}>
            {weeklyVelocity.map((w,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div style={{ width:'100%', background: w.count>0?'#6366f1':'#e2e8f0', borderRadius:'3px 3px 0 0', height:`${Math.max(w.count/maxVel*80,w.count>0?10:4)}px`, transition:'height 0.3s', position:'relative' }}>
                  {w.count > 0 && <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)', fontSize:9, fontWeight:700, color:'#6366f1', whiteSpace:'nowrap' }}>{w.count}</div>}
                </div>
                <span style={{ fontSize:8, color:'#94a3b8' }}>{w.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Projects + Owner rows */}
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:12, marginBottom:12 }}>

        {/* By project */}
        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:'#1e293b', marginBottom:14 }}>Top Projects by Points</div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {byProject.length === 0 && <span style={{ fontSize:12, color:'#94a3b8' }}>No project data</span>}
            {byProject.map(([proj, d]) => (
              <div key={proj}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>{proj}</span>
                  <div style={{ display:'flex', gap:10, flexShrink:0 }}>
                    <span style={{ fontSize:10, color:'#64748b' }}>{d.tasks} tasks</span>
                    <span style={{ fontSize:10, color:'#6366f1', fontWeight:700 }}>{d.pts} pts</span>
  
                  </div>
                </div>
                <div style={{ height:5, background:'#f1f5f9', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${byProject[0][1].pts>0?Math.round(d.pts/byProject[0][1].pts*100):0}%`, background:'#6366f1', borderRadius:3, opacity:0.7 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Priority mix */}
        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:'#1e293b', marginBottom:14 }}>Priority Mix</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {Object.entries(priorityMap).sort((a,b)=>['Critical','High','Medium','Low'].indexOf(a[0])-['Critical','High','Medium','Low'].indexOf(b[0])).map(([p,count])=>(
              <div key={p}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:priorityColors[p]||'#94a3b8' }}>{p}</span>
                  <span style={{ fontSize:11, color:'#64748b' }}>{count} ({baseTasks.length>0?Math.round(count/baseTasks.length*100):0}%)</span>
                </div>
                <div style={{ height:6, background:'#f1f5f9', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${baseTasks.length>0?Math.round(count/baseTasks.length*100):0}%`, background:priorityColors[p]||'#94a3b8', borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Owner comparison table */}
      {ownerFilter === 'all' && byOwner.length > 0 && (
        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:'#1e293b', marginBottom:14 }}>Owner Productivity Comparison <span style={{ fontSize:11, color:'#94a3b8', fontWeight:400 }}>({timeRange === 'all' ? 'All Time' : timeRange})</span></div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
                {['Owner','Tasks','Completed','In Progress','Blocked','Points','Completed Pts','Completion Rate'].map(h=>(
                  <th key={h} style={{ padding:'4px 10px', textAlign: h==='Owner'?'left':'right', fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byOwner.map(([owner, d]) => {
                const ownerComplPts = tasks.filter(inRange).filter(t=>t.owner===owner&&t.status==='Completed').reduce((s,t)=>s+(t.points||0),0);
                const rate = d.tasks > 0 ? Math.round(d.completed/d.tasks*100) : 0;
                return (
                  <tr key={owner} style={{ borderBottom:'1px solid #f8fafc' }} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'8px 10px', fontWeight:700, color:'#1e293b' }}>{owner}</td>
                    <td style={{ padding:'8px 10px', textAlign:'right', color:'#475569' }}>{d.tasks}</td>
                    <td style={{ padding:'8px 10px', textAlign:'right', color:'#22c55e', fontWeight:700 }}>{d.completed}</td>
                    <td style={{ padding:'8px 10px', textAlign:'right', color:'#6366f1' }}>{d.inProgress}</td>
                    <td style={{ padding:'8px 10px', textAlign:'right', color: d.blocked>0?'#ef4444':'#94a3b8', fontWeight: d.blocked>0?700:400 }}>{d.blocked}</td>
                    <td style={{ padding:'8px 10px', textAlign:'right', color:'#475569' }}>{d.pts}</td>
                    <td style={{ padding:'8px 10px', textAlign:'right', color:'#6366f1', fontWeight:700 }}>{ownerComplPts}</td>
                    <td style={{ padding:'8px 10px', textAlign:'right' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' }}>
                        <div style={{ width:50, height:5, background:'#e2e8f0', borderRadius:3 }}>
                          <div style={{ height:'100%', width:`${rate}%`, background: rate>=75?'#22c55e':rate>=40?'#f59e0b':'#ef4444', borderRadius:3 }} />
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color: rate>=75?'#22c55e':rate>=40?'#f59e0b':'#ef4444', minWidth:30 }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function exportCSV(tasks) {
  const headers = ["id","owner","title","nextAction","additionalInfo","entryDate","type","project","status","statusReason","priority","points","requester","department","requesterName","projectedStartDate","projectedEndDate","actualStartDate","actualEndDate","comment","progress","canvasId"];
  const rows = tasks.map(t => headers.map(h => {
    const v = t[h];
    if (Array.isArray(v)) return `"${v.join(";")}"`;
    if (typeof v === "string" && v.includes(",")) return `"${v}"`;
    return v ?? "";
  }).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `orbit_tasks_${todayStr()}.csv`;
  a.click();
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(null);
  const [activeCanvas, setActiveCanvas] = useState("default");
  // Keep refs in sync so async callbacks never close over stale values
  useEffect(() => { activeCanvasRef.current = activeCanvas; }, [activeCanvas]);
  useEffect(() => { dataRef.current = data; }, [data]);
  const [activeTask, setActiveTask] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [layers, setLayers] = useState(["Not Started","In Progress","Blocked","Review"]);
  const [filters, setFilters] = useState({ owners:[], priorities:[], projects:[], departments:[], dueDateFrom:'', dueDateTo:'' });
  const [showFilters, setShowFilters] = useState(false);
  const [syncStatus, setSyncStatus] = useState("loading");
  const [lastSync, setLastSync] = useState(null);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [showWebhook, setShowWebhook] = useState(false);
  const [showAiParse, setShowAiParse] = useState(false);
  const [viewMode, setViewMode] = useState('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const webhookPollRef = useRef(null);

  // Pan state
  const [pan, setPan] = useState({ x:0, y:0 });
  const panRef = useRef({ x:0, y:0 });
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const canvasElRef = useRef(null);
  const isPanning = useRef(false);
  const panStart = useRef({mx:0,my:0,px:0,py:0});
  const spaceDown = useRef(false);
  const hasInitialized = useRef(false);   // true after first successful storage read
  const activeCanvasRef = useRef('default');
  const dataRef = useRef(null);           // always-current copy of data (avoids stale closures)

  // ── LOAD / POLL ──
  const loadData = useCallback(async () => {
    try {
      const res = await storage.get(STORAGE_KEY, true);
      if (res?.value) {
        const remote = JSON.parse(res.value);
        if (!hasInitialized.current) {
          // First load — take storage as-is
          setData(remote);
          hasInitialized.current = true;
        } else {
          // Subsequent polls — smart merge, never blow away active work
          setData(curr => curr ? mergeData(curr, remote, activeCanvasRef.current) : remote);
        }
        setSyncStatus("synced");
        setLastSync(new Date());
      } else if (!hasInitialized.current) {
        // Nothing saved yet — start fresh AND write the key so future polls don't 404
        hasInitialized.current = true;
        setData(DEFAULT_DATA);
        try {
          await storage.set(STORAGE_KEY, JSON.stringify(DEFAULT_DATA), true);
        } catch { /* ignore — will retry next poll */ }
        setSyncStatus("synced");
        setLastSync(new Date());
      }
      // If poll returns empty but already initialized: keep current data — never clear!
    } catch {
      if (!hasInitialized.current) {
        // Storage key doesn't exist yet — initialize it so polls stop returning 404
        hasInitialized.current = true;
        setData(DEFAULT_DATA);
        try {
          await storage.set(STORAGE_KEY, JSON.stringify(DEFAULT_DATA), true);
          setSyncStatus("synced");
          setLastSync(new Date());
        } catch {
          setSyncStatus("offline");
        }
      } else {
        // Transient error on a poll — keep current data, don't clear anything
        setSyncStatus("offline");
      }
    }
  }, []);

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, POLL_MS);
    return () => clearInterval(iv);
  }, []);

  // ── SAVE (read-modify-write with per-canvas, per-task isolation) ──
  const save = useCallback(async (next) => {
    // Stamp updatedAt on tasks that changed vs the previous local state
    const now = Date.now();
    const prevMap = new Map((dataRef.current?.tasks||[]).map(t=>[t.id,t]));
    const stamped = {
      ...next,
      tasks: (next.tasks||[]).map(t => {
        const prev = prevMap.get(t.id);
        if (!prev) return { ...t, updatedAt: now };          // new task
        const { updatedAt: _a, ...pRest } = prev;
        const { updatedAt: _b, ...tRest } = t;
        const changed = JSON.stringify(pRest) !== JSON.stringify(tRest);
        return changed ? { ...t, updatedAt: now } : t;      // changed → new stamp; unchanged → keep old
      }),
    };

    setData(stamped);
    setSyncStatus("saving");
    try {
      // Read remote, merge, then write — so we never overwrite another canvas
      const res = await storage.get(STORAGE_KEY, true);
      let toWrite = stamped;
      if (res?.value) {
        const remote = JSON.parse(res.value);
        const merged = mergeData(stamped, remote, activeCanvasRef.current);
        // For the active canvas our local copy is authoritative (we just saved it)
        const ac = activeCanvasRef.current;
        toWrite = {
          ...merged,
          tasks: [
            ...merged.tasks.filter(t => t.canvasId !== ac),
            ...stamped.tasks.filter(t => t.canvasId === ac),
          ],
          zones: [
            ...(merged.zones||[]).filter(z => z.canvasId !== ac),
            ...(stamped.zones||[]).filter(z => z.canvasId === ac),
          ],
        };
      }
      await storage.set(STORAGE_KEY, JSON.stringify(toWrite), true);
      setSyncStatus("synced");
      setLastSync(new Date());
    } catch {
      setSyncStatus("error");
    }
  }, []);

  // ── WHEEL ZOOM

  // ── WEBHOOK POLLING ──
  const addTasksFromWebhook = useCallback((incoming) => {
    if (!incoming?.length) return;
    const now = Date.now();
    const fresh = incoming.map(t => ({
      ...t,
      id: t.id || `wh_${now.toString(36)}_${Math.random().toString(36).slice(2,5)}`,
      canvasId: t.canvasId || activeCanvas,
      updatedAt: now,
      relatedTasks: t.relatedTasks || [],
      blockingTasks: t.blockingTasks || [],
      subtasks: t.subtasks || [],
      colorOverride: t.colorOverride || null,
      progress: Number(t.progress || 0),
      x: Number(t.x) || 500 + Math.random()*500,
      y: Number(t.y) || 400 + Math.random()*300,
    }));
    save({ ...data, tasks: [...(data?.tasks || []), ...fresh] });
  }, [data, activeCanvas]);

  // ── POSTMESSAGE LISTENER — receives tasks from the browser bookmarklet ──
  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type !== 'TASKBUB_INTAKE') return;
      const incoming = event.data?.tasks;
      if (!Array.isArray(incoming) || !incoming.length) return;
      addTasksFromWebhook(incoming);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [addTasksFromWebhook]);

  // Start/stop background webhook polling when config changes
  useEffect(() => {
    const wh = data?.settings?.webhook;
    if (!wh?.enabled || !wh?.url || !wh?.secret) {
      if (webhookPollRef.current) clearInterval(webhookPollRef.current);
      webhookPollRef.current = null;
      return;
    }
    const poll = async () => {
      try {
        const r = await fetch(
          `${wh.url}/poll?secret=${encodeURIComponent(wh.secret)}&canvas=${wh.canvasId || activeCanvas}`
        );
        const d = await r.json();
        if (d.tasks?.length) addTasksFromWebhook(d.tasks);
      } catch { /* network error — ignore, try again next interval */ }
    };
    poll(); // immediate first poll
    webhookPollRef.current = setInterval(poll, 8000);
    return () => { if (webhookPollRef.current) clearInterval(webhookPollRef.current); };
  }, [data?.settings?.webhook?.enabled, data?.settings?.webhook?.url]);

  // ── ZONE OPERATIONS ──
  const addZone = (zone) => {
    const newZone = {...zone, id:uid(), x:500 + (data.zones||[]).length*300, y:700, canvasId:activeCanvas};
    save({...data, zones:[...(data.zones||[]), newZone]});
  };
  const updateZone = (updated) => {
    save({...data, zones:(data.zones||[]).map(z=>z.id===updated.id?updated:z)});
  };
  const deleteZone = (id) => {
    save({...data, zones:(data.zones||[]).filter(z=>z.id!==id)});
  };
  const fitZones = () => {
    const el = canvasElRef.current;
    const W = el?.clientWidth||1200, H = el?.clientHeight||800;
    const zones = (data.zones||[]).filter(z=>z.canvasId===activeCanvas);
    const tasks = (data.tasks||[]).filter(t=>t.canvasId===activeCanvas);
    if (!zones.length && !tasks.length) return;
    const allX = [...zones.map(z=>z.x), ...tasks.map(t=>t.x||0)];
    const allY = [...zones.map(z=>z.y), ...tasks.map(t=>t.y||0)];
    const pad = 200;
    const minX=Math.min(...allX)-pad, maxX=Math.max(...allX)+pad;
    const minY=Math.min(...allY)-pad, maxY=Math.max(...allY)+pad;
    const newScale = Math.min(3, Math.max(0.08, Math.min(W/(maxX-minX||1), H/(maxY-minY||1))*0.9));
    const newPanX = W/2 - ((minX+maxX)/2)*newScale;
    const newPanY = H/2 - ((minY+maxY)/2)*newScale;
    panRef.current = {x:newPanX, y:newPanY};
    scaleRef.current = newScale;
    setPan({x:newPanX, y:newPanY});
    setScale(newScale);
  };

  // ── WHEEL ZOOM (callback ref — fires when element mounts) ──
  const wheelListenerRef = useRef(null);
  const canvasCallbackRef = (el) => {
    // Clean up previous listener
    if (wheelListenerRef.current) {
      wheelListenerRef.current.el.removeEventListener('wheel', wheelListenerRef.current.fn);
      wheelListenerRef.current = null;
    }
    if (!el) return;
    canvasElRef.current = el;
    const fn = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(4, Math.max(0.15, scaleRef.current * delta));
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const ratio = newScale / scaleRef.current;
      const newPanX = mx - ratio * (mx - panRef.current.x);
      const newPanY = my - ratio * (my - panRef.current.y);
      panRef.current = { x: newPanX, y: newPanY };
      scaleRef.current = newScale;
      setPan({ x: newPanX, y: newPanY });
      setScale(newScale);
    };
    el.addEventListener('wheel', fn, { passive: false });
    wheelListenerRef.current = { el, fn };
  };

  // ── KEYBOARD ──
  useEffect(() => {
    const down = (e) => {
      if (e.key === " " && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        spaceDown.current = true; e.preventDefault();
      }
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "n" || e.key === "N") setShowQuickAdd(true);
      if (e.key === "Escape") { setActiveTask(null); setShowQuickAdd(false); setShowSettings(false); }
    };
    const up = (e) => { if (e.key===" ") spaceDown.current=false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown",down); window.removeEventListener("keyup",up); };
  }, []);

  // ── PAN HANDLERS ──
  const onCanvasMouseDown = (e) => {
    if (e.button === 1 || e.button === 0) {
      isPanning.current = true;
      panStart.current = { mx:e.clientX, my:e.clientY, px:panRef.current.x, py:panRef.current.y };
      if (e.button===0 && e.target===e.currentTarget) setActiveTask(null);
      e.preventDefault();
    }
  };
  const onCanvasMouseMove = (e) => {
    if (!isPanning.current) return;
    const nx = panStart.current.px + (e.clientX - panStart.current.mx);
    const ny = panStart.current.py + (e.clientY - panStart.current.my);
    panRef.current = { x:nx, y:ny };
    setPan({ x:nx, y:ny });
  };
  const onCanvasMouseUp = () => { isPanning.current=false; };

  if (!data) return (
    <div style={{ height:"100vh", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", color:"#0f172a", fontFamily:"'DM Mono', monospace", fontSize:13 }}>
      Loading TaskBub…
    </div>
  );

  const applyFilters = (tasks) => tasks.filter(t => {
    if (!layers.includes(t.status)) return false;
    if (filters.owners.length     && !filters.owners.includes(t.owner))           return false;
    if (filters.priorities.length && !filters.priorities.includes(t.priority))    return false;
    if (filters.projects.length   && !filters.projects.includes(t.project))       return false;
    if (filters.departments.length&& !filters.departments.includes(t.department)) return false;
    if (filters.dueDateFrom && t.projectedEndDate && t.projectedEndDate < filters.dueDateFrom) return false;
    if (filters.dueDateTo   && t.projectedEndDate && t.projectedEndDate > filters.dueDateTo)   return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const searchable = ['title','shortId','owner','nextAction','additionalInfo','project','department','type','requesterName','requestSource','status','priority','comment','statusReason'];
      if (!searchable.some(k => String(t[k]||'').toLowerCase().includes(q))) return false;
    }
    return true;
  });
  const canvasTasks = applyFilters(data.tasks.filter(t => t.canvasId===activeCanvas));
  const allCanvasTasks = data.tasks.filter(t => t.canvasId===activeCanvas);
  const activeTaskObj = data.tasks.find(t=>t.id===activeTask);

  const updateTask = (updated) => save({ ...data, tasks:data.tasks.map(t=>t.id===updated.id?updated:t) });
  const deleteTask = (id) => { setActiveTask(null); save({ ...data, tasks:data.tasks.filter(t=>t.id!==id) }); };
  const addTask = (t) => save({ ...data, tasks:[...data.tasks, t] });
  const addManyTasks = (newTasks) => save({ ...data, tasks:[...data.tasks, ...newTasks] });
  // moveTask: plain position update (used during live drag for visual feedback)
  const moveTask = (id,x,y) => {
    // Just update position — no zone check during drag, only on drop
    save({ ...data, tasks: data.tasks.map(t => t.id===id ? {...t, x, y} : t) });
  };

  // dropTask: called on mouseUp — checks if the bubble landed inside a zone
  const dropTask = (id, x, y) => {
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;
    const activeZones = (data.zones||[]).filter(z => z.canvasId === activeCanvas);
    const landed = activeZones.find(zone => {
      const dx = x - zone.x, dy = y - zone.y;
      const n = (data.tasks||[]).filter(t =>
        t.canvasId === zone.canvasId &&
        String(t[zone.groupBy]||'').trim().toLowerCase() === String(zone.groupValue||'').trim().toLowerCase()
      ).length;
      return Math.sqrt(dx*dx + dy*dy) < zoneRadius(n);
    });
    const updated = landed
      ? { ...task, x, y, [landed.groupBy]: landed.groupValue, updatedAt: Date.now() }
      : { ...task, x, y, updatedAt: Date.now() };
    save({ ...data, tasks: data.tasks.map(t => t.id === id ? updated : t) });
  };

  // unzoneTask: called when task is dragged out of a zone circle
  const unzoneTask = (task, zone) => {
    // Clear the field that the zone groups by → task becomes a free card
    // Place it just outside the zone so it appears near where it escaped
    const angle = Math.atan2(task.y || 0, task.x || 0);
    const r = zoneRadius(tasksInZoneCount(zone, data));
    const updated = {
      ...task,
      [zone.groupBy]: '',
      x: zone.x + Math.cos(angle) * (r + 160),
      y: zone.y + Math.sin(angle) * (r + 160),
      updatedAt: Date.now(),
    };
    save({ ...data, tasks: data.tasks.map(t => t.id === task.id ? updated : t) });
  };
  const toggleLayer = (s) => setLayers(prev => prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);

  const syncDot = { synced:"#22c55e", saving:"#f59e0b", error:"#ef4444", offline:"#ef4444", loading:"#475569" }[syncStatus];

  // Stats
  const statCounts = STATUS_OPTIONS.map(s=>({ s, count:allCanvasTasks.filter(t=>t.status===s).length })).filter(x=>x.count>0);

  return (
    <div style={{ height:"100vh", background:"#f8fafc", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"'DM Sans', sans-serif" }}>

      {/* ── TOPBAR ── */}
      <div style={{ height:48, background:"#ffffff", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10, padding:"0 14px", flexShrink:0, zIndex:200 }}>
        {/* Logo */}
        <div style={{ fontSize:16, fontWeight:800, color:"#6366f1", fontFamily:"'Syne', sans-serif", letterSpacing:"-0.5px", flexShrink:0 }}>TaskBub</div>
        <div style={{ width:1, height:18, background:"rgba(255,255,255,0.07)" }} />

        {/* Canvas tabs */}
        {data.canvases.map(c=>(
          <button key={c.id} onClick={()=>setActiveCanvas(c.id)}
            style={{
              padding:"3px 11px", borderRadius:6, fontSize:12, cursor:"pointer", fontWeight:activeCanvas===c.id?700:400,
              background:activeCanvas===c.id?"rgba(99,102,241,0.18)":"transparent",
              border:`1px solid ${activeCanvas===c.id?"rgba(99,102,241,0.4)":"transparent"}`,
              color:activeCanvas===c.id?"#a5b4fc":"#475569",
            }}>
            {c.name}
          </button>
        ))}

        {/* View mode switcher */}
        <div style={{ display:'flex', gap:2, background:'#f1f5f9', borderRadius:7, padding:3, marginLeft:4 }}>
          {[['canvas','⬡ Canvas'],['table','⊟ Table'],['dashboard','◈ Dashboard'],['keys','⊞ Keys']].map(([v,l])=>(
            <button key={v} onClick={()=>setViewMode(v)}
              style={{ background:viewMode===v?'#fff':'transparent', border:viewMode===v?'1px solid #e2e8f0':'1px solid transparent', borderRadius:5, padding:'3px 9px', fontSize:11, fontWeight:viewMode===v?700:500, color:viewMode===v?'#6366f1':'#64748b', cursor:'pointer', transition:'all 0.12s', whiteSpace:'nowrap' }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── SHARED SEARCH BAR ── */}
        <div style={{ position:'relative', marginLeft:6 }}>
          <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'#94a3b8', pointerEvents:'none' }}>⌕</span>
          <input
            value={searchQuery}
            onChange={e=>setSearchQuery(e.target.value)}
            placeholder="Search tasks…"
            style={{ paddingLeft:26, paddingRight: searchQuery?26:10, paddingTop:5, paddingBottom:5, border:'1px solid #e2e8f0', borderRadius:8, fontSize:11, color:'#1e293b', background:'#f8fafc', outline:'none', width:180, transition:'border-color 0.15s, width 0.2s', borderColor: searchQuery?'#6366f1':'#e2e8f0' }}
            onFocus={e=>e.target.style.width='220px'}
            onBlur={e=>e.target.style.width=searchQuery?'220px':'180px'}
          />
          {searchQuery && (
            <button onClick={()=>setSearchQuery('')} style={{ position:'absolute', right:7, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#94a3b8', padding:0, lineHeight:1 }}>✕</button>
          )}
        </div>


        {viewMode==='canvas' && <>
          <button onClick={fitZones} style={{background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:7,padding:"4px 10px",color:"#64748b",cursor:"pointer",fontSize:11,flexShrink:0}}>
            Fit
          </button>
          <button onClick={()=>setShowAddZone(true)} style={{background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:7,padding:"4px 10px",color:"#64748b",cursor:"pointer",fontSize:11,fontWeight:600,flexShrink:0}}>
            + Zone
          </button>
        </>}

        <div style={{ flex:1 }} />

        {/* Filter button */}
        <div style={{position:'relative'}}>
          <button onClick={()=>setShowFilters(f=>!f)}
            style={{
              background: showFilters||layers.length<STATUS_OPTIONS.length||(filters.owners.length+filters.priorities.length+filters.projects.length+filters.departments.length+(filters.dueDateFrom?1:0)+(filters.dueDateTo?1:0))>0 ? "rgba(99,102,241,0.12)" : "#f1f5f9",
              border: showFilters||layers.length<STATUS_OPTIONS.length||(filters.owners.length+filters.priorities.length+filters.projects.length+filters.departments.length+(filters.dueDateFrom?1:0)+(filters.dueDateTo?1:0))>0 ? "1px solid rgba(99,102,241,0.4)" : "1px solid #e2e8f0",
              borderRadius:7, padding:"4px 11px", cursor:"pointer", fontSize:11, fontWeight:600,
              color: showFilters||layers.length<STATUS_OPTIONS.length||(filters.owners.length+filters.priorities.length+filters.projects.length+filters.departments.length+(filters.dueDateFrom?1:0)+(filters.dueDateTo?1:0))>0 ? "#6366f1" : "#64748b",
              display:'flex', alignItems:'center', gap:5,
            }}>
            ⊞ Filters
            {(layers.length<STATUS_OPTIONS.length||(filters.owners.length+filters.priorities.length+filters.projects.length+filters.departments.length+(filters.dueDateFrom?1:0)+(filters.dueDateTo?1:0))>0) && (
              <span style={{background:'#6366f1',color:'#fff',borderRadius:9,padding:'0 5px',fontSize:10,fontWeight:700}}>
                {layers.filter(l=>!["Not Started","In Progress","Blocked","Review","Completed","Cancelled"].includes(l)).length + (STATUS_OPTIONS.length-layers.length) + (filters.owners.length+filters.priorities.length+filters.projects.length+filters.departments.length+(filters.dueDateFrom?1:0)+(filters.dueDateTo?1:0))}
              </span>
            )}
          </button>
          {showFilters && (
            <FilterPanel
              allTasks={allCanvasTasks}
              layers={layers}
              filters={filters}
              onLayersChange={toggleLayer}
              onFiltersChange={setFilters}
              onClose={()=>setShowFilters(false)}
            />
          )}
        </div>

        {/* AI Parse shortcut */}
        <button onClick={()=>setShowAiParse(true)}
          style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:7,padding:'4px 10px',color:'#818cf8',cursor:'pointer',fontSize:11,fontWeight:600,flexShrink:0}}
          title="AI Parse - paste text, Claude creates a task">
          AI Parse
        </button>

        <div style={{ width:1, height:18, background:"rgba(255,255,255,0.07)" }} />

        {/* Load Test Data — only visible when canvas is named "Load Test Data" */}
        {(data.canvases.find(c=>c.id===activeCanvas)?.name === 'Load Test Data') && (
          !showLoadConfirm
          ? <button onClick={()=>setShowLoadConfirm(true)}
              style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:7, padding:"4px 10px", color:"#818cf8", cursor:"pointer", fontSize:11, fontWeight:600 }}>
              📥 Load Test Data
            </button>
          : <span style={{ display:"flex", gap:4, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#f59e0b" }}>Replace canvas tasks?</span>
              <button onClick={()=>{
                const seeded = SEED_TASKS.map(t=>({...t, canvasId: activeCanvas}));
                const zoned  = DEFAULT_ZONES.map(z=>({...z, canvasId: activeCanvas}));
                save({
                  ...data,
                  tasks: [...data.tasks.filter(t=>t.canvasId!==activeCanvas), ...seeded],
                  zones: [...(data.zones||[]).filter(z=>z.canvasId!==activeCanvas), ...zoned],
                });
                setShowLoadConfirm(false);
              }} style={{ background:"rgba(34,197,94,0.2)", border:"1px solid rgba(34,197,94,0.4)", borderRadius:5, padding:"3px 8px", color:"#4ade80", cursor:"pointer", fontSize:11, fontWeight:700 }}>Yes</button>
              <button onClick={()=>setShowLoadConfirm(false)}
                style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:5, padding:"3px 8px", color:"#f87171", cursor:"pointer", fontSize:11 }}>No</button>
            </span>
        )}

        {/* Webhook intake */}
        <button onClick={()=>setShowWebhook(true)}
          style={{ background: data?.settings?.webhook?.enabled ? "rgba(99,102,241,0.1)" : "#f1f5f9",
            border: data?.settings?.webhook?.enabled ? "1px solid rgba(99,102,241,0.4)" : "1px solid #e2e8f0",
            borderRadius:7, padding:"4px 10px",
            color: data?.settings?.webhook?.enabled ? "#6366f1" : "#64748b",
            cursor:"pointer", fontSize:11, fontWeight:600 }}>
          {data?.settings?.webhook?.enabled ? '🔌 Live' : '🔌 Webhook'}
        </button>

        {/* Export */}
        <button onClick={()=>exportCSV(data.tasks)}
          style={{ background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:7, padding:"4px 10px", color:"#64748b", cursor:"pointer", fontSize:11 }}>
          ↓ CSV
        </button>

        {/* New + Settings */}
        <button onClick={()=>setShowQuickAdd(true)}
          style={{ background:"rgba(99,102,241,0.75)", border:"none", borderRadius:7, padding:"5px 13px", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700 }}>
          + New <span style={{ opacity:0.55, fontSize:10 }}>N</span>
        </button>
        <button onClick={()=>setShowSettings(true)}
          style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:7, padding:"5px 9px", color:"#64748b", cursor:"pointer", fontSize:14 }}>
          ⚙
        </button>

        {/* Sync indicator */}
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:syncDot, boxShadow:`0 0 6px ${syncDot}` }} />
          {lastSync && <span style={{ fontSize:9, color:"#475569", fontFamily:"'DM Mono', monospace" }}>{lastSync.toLocaleTimeString()}</span>}
        </div>
      </div>

      {/* ── KEYS VIEW ── */}
      {viewMode === 'keys' && data && (
        <div style={{ flex:1, overflowY:'auto', background:'#f8fafc', padding:'24px' }}>
          <div style={{ maxWidth:960, margin:'0 auto' }}>
            <div style={{ fontSize:17, fontWeight:800, color:'#1e293b', marginBottom:20, fontFamily:"'Syne',sans-serif" }}>Keys</div>
            <FieldManagerTab
              fieldDefs={data.settings.fieldDefs || {}}
              allTasks={data.tasks}
              onUpdate={defs => save({...data, settings:{...data.settings, fieldDefs: defs}})}
            />
          </div>
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <TableView
          tasks={allCanvasTasks}
          allTasks={data.tasks}
          settings={data.settings}
          onUpdate={updateTask}
          onBulkUpdate={updatedTasks => save({ ...data, tasks: data.tasks.map(t => { const u = updatedTasks.find(x=>x.id===t.id); return u||t; }) })}
          onSelectTask={setActiveTask}
          onDelete={id => save({ ...data, tasks: data.tasks.filter(t => t.id !== id) })}
          onAdd={addTask}
          onAddMany={addManyTasks}
          onAddSubtask={st=>{addTask(st);setActiveTask(st.id);}}
          canvasId={activeCanvas}
          searchQuery={searchQuery}
        />
      )}

      {/* ── DASHBOARD VIEW ── */}
      {viewMode === 'dashboard' && (
        <DashboardView tasks={allCanvasTasks} />
      )}

      {/* ── CANVAS ── */}
      {viewMode === 'canvas' && (
      <div ref={canvasCallbackRef} style={{ flex:1, position:"relative", overflow:"hidden", cursor:"default", touchAction:"none" }}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
        onMouseLeave={onCanvasMouseUp}>

        {/* Zones + connections in SVG, free tasks as divs */}
        {(() => {
          const zones = (data.zones||[]).filter(z=>z.canvasId===activeCanvas);
          const zonedIds = new Set(zones.flatMap(z=>applyFilters(getZoneTasks(z,data.tasks,layers)).map(t=>t.id)));
          const freeTasks = canvasTasks.filter(t=>!zonedIds.has(t.id));
          return (<>
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible"}}>
              <defs>
                <pattern id="dots" x={pan.x%40} y={pan.y%40} width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#d1d5db"/>
                </pattern>
                <marker id="arrowBlock" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <path d="M0,0 L7,3.5 L0,7 Z" fill="#f87171"/>
                </marker>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" style={{pointerEvents:"none"}}/>
              <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`} style={{pointerEvents:"all"}}>
                <ConnectionLines tasks={freeTasks} activeId={activeTask}/>
                {zones.map(zone=>(
                  <ZoneCircle key={zone.id} zone={zone}
                    tasksInZone={applyFilters(getZoneTasks(zone,data.tasks,layers))}
                    activeTaskId={activeTask} onSelectTask={setActiveTask}
                    onUpdate={updateZone} onDelete={deleteZone} onEdit={setEditingZone}
                    onUnzoneTask={unzoneTask}
                    settings={data.settings} scale={scale} panRef={panRef}/>
                ))}
              </g>
            </svg>
            <div style={{position:"absolute",transform:`translate(${pan.x}px,${pan.y}px) scale(${scale})`,transformOrigin:"0 0",width:0,height:0}}>
              {freeTasks.map(t=>(
                <Bubble key={t.id} task={t} active={t.id===activeTask}
                  panRef={panRef} settings={data.settings} scale={scale}
                  onSelect={setActiveTask} onMove={moveTask} onDrop={dropTask}/>
              ))}
            </div>
          </>);
        })()}

                {/* Empty state */}
        {allCanvasTasks.length===0 && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", gap:10 }}>
            <div style={{ fontSize:72, color:"#cbd5e1" }}>◎</div>
            <div style={{ fontSize:14, color:"#94a3b8", fontWeight:600, fontFamily:"'Syne', sans-serif" }}>Press N to add your first task</div>
            <div style={{ fontSize:11, color:"#d1d5db" }}>Space+drag to pan · scroll to zoom • Click bubble to open</div>
          </div>
        )}

        {/* Layer filtered empty */}
        {allCanvasTasks.length>0 && canvasTasks.length===0 && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
            <div style={{ fontSize:12, color:"#0f172a" }}>All tasks in hidden layers. Toggle a status above.</div>
          </div>
        )}

        {/* Bottom stats bar */}
        {statCounts.length>0 && (
          <div style={{ position:"absolute", bottom:14, left:14, display:"flex", gap:6, pointerEvents:"none" }}>
            {statCounts.map(({s,count})=>(
              <div key={s} style={{ background:"rgba(255,255,255,0.95)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:6, padding:"3px 10px", fontSize:10, color:"#64748b", display:"flex", gap:5, alignItems:"center" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:STATUS_COLORS[s] }} />
                {s}: <strong style={{ color:"#94a3b8" }}>{count}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Pan hint */}
        <div style={{ position:"absolute", bottom:14, right:16, fontSize:10, color:"#0f1a2e", pointerEvents:"none", fontFamily:"'DM Mono', monospace" }}>
          Space+drag to pan · scroll to zoom
        </div>
      </div>
      )}

      {/* ── DETAIL PANEL ── */}
      {activeTaskObj && (
        <>
          <div style={{position:'fixed',inset:0,zIndex:499}} onClick={()=>setActiveTask(null)} />
          <DetailPanel
            task={activeTaskObj}
            allTasks={data.tasks}
            settings={data.settings}
            onUpdate={updateTask}
            onClose={()=>setActiveTask(null)}
            onDelete={()=>deleteTask(activeTask)}
            onAddSubtask={st=>{addTask(st);setActiveTask(st.id);}} onNavigateTo={setActiveTask} />
        </>
      )}

      {/* ── QUICK ADD ── */}
      {showQuickAdd && (
        <QuickAdd canvasId={activeCanvas} onAdd={addTask} onClose={()=>setShowQuickAdd(false)} />
      )}

      {/* ── WEBHOOK PANEL ── */}
      {showWebhook && data && (
        <WebhookPanel
          settings={data.settings}
          allTasks={data.tasks}
          activeCanvas={activeCanvas}
          onSaveSettings={s => save({...data, settings:s})}
          onAddTasks={addTasksFromWebhook}
          onClose={()=>setShowWebhook(false)}/>
      )}

      {/* ── AI PARSE MODAL ── */}
      {showAiParse && data && (
        <WebhookPanel
          settings={data.settings}
          allTasks={data.tasks}
          activeCanvas={activeCanvas}
          onSaveSettings={s => save({...data, settings:s})}
          onAddTasks={addTasksFromWebhook}
          defaultTab="ai"
          onClose={()=>setShowAiParse(false)}/>
      )}

      {/* ── ZONE EDITOR ── */}
      {editingZone && (
        <ZoneEditorModal zone={editingZone} allTasks={data.tasks}
          onSave={updated=>{updateZone(updated);setEditingZone(null);}}
          onClose={()=>setEditingZone(null)}/>
      )}

      {/* ── ADD ZONE ── */}
      {showAddZone && (
        <AddZoneModal allTasks={data.tasks} canvasId={activeCanvas}
          existingZones={data.zones||[]}
          onAdd={addZone} onClose={()=>setShowAddZone(false)}/>
      )}

      {/* ── SETTINGS ── */}
      {showSettings && (
        <SettingsPanel
          settings={data.settings}
          canvases={data.canvases}
          onUpdateSettings={s=>save({...data,settings:s})}
          onAddCanvas={()=>{
            const c={id:uid(),name:`Canvas ${data.canvases.length+1}`};
            save({...data,canvases:[...data.canvases,c]});
          }}
          onRenameCanvas={(id,name)=>save({...data,canvases:data.canvases.map(c=>c.id===id?{...c,name}:c)})}
          onDeleteCanvas={(id)=>{
            const remaining = data.canvases.filter(c=>c.id!==id);
            const newActive = remaining[0]?.id || 'default';
            save({
              ...data,
              canvases: remaining,
              tasks: data.tasks.filter(t=>t.canvasId!==id),
              zones: (data.zones||[]).filter(z=>z.canvasId!==id),
            });
            if(activeCanvas===id) setActiveCanvas(newActive);
          }}
          onClose={()=>setShowSettings(false)} />
      )}
    </div>
  );
}
// Simple repulsion: push task circles apart when one is dragged near another
// Multi-pass cascading repulsion.
// MIN_DIST = 2*38*0.8 = 60.8 → max 20% overlap (circles share at most 15px of their 76px diameter).
// Each pass: first resolve dragged-vs-others, then all peer-pairs — repeating until cascade settles.
function applyRepulsion(positions, draggedId, dx, dy, maxR, PASSES=7) {
  const MIN  = 62;          // 20% max overlap
  const WALL = maxR - 42;   // keep circles fully inside zone

  const clamp = (x, y) => {
    const d = Math.sqrt(x*x + y*y) || 0.001;
    return d > WALL ? {x: x*WALL/d, y: y*WALL/d} : {x, y};
  };

  // Start from current positions, lock the dragged circle at (dx,dy)
  let pos = {};
  for (const [id, p] of Object.entries(positions)) {
    pos[id] = id === draggedId ? {x:dx, y:dy} : {...p};
  }
  const others = Object.keys(pos).filter(id => id !== draggedId);

  for (let pass = 0; pass < PASSES; pass++) {
    // ── Step A: push every non-dragged circle away from the dragged one ──
    for (const id of others) {
      const p = pos[id];
      const ex = p.x - dx, ey = p.y - dy;
      const dist = Math.sqrt(ex*ex + ey*ey) || 0.001;
      if (dist < MIN) {
        const push = (MIN - dist) / dist;
        pos[id] = clamp(p.x + ex*push*0.65, p.y + ey*push*0.65);
      }
    }

    // ── Step B: resolve overlaps between non-dragged circles (peer-to-peer) ──
    for (let i = 0; i < others.length; i++) {
      for (let j = i + 1; j < others.length; j++) {
        const a = pos[others[i]], b = pos[others[j]];
        const ex = a.x - b.x, ey = a.y - b.y;
        const dist = Math.sqrt(ex*ex + ey*ey) || 0.001;
        if (dist < MIN) {
          const half = (MIN - dist) / dist * 0.5;
          pos[others[i]] = clamp(a.x + ex*half, a.y + ey*half);
          pos[others[j]] = clamp(b.x - ex*half, b.y - ey*half);
        }
      }
    }
  }

  return pos;
}


// ─────────────────────────────────────────────
// MERGE UTILITY  (per-canvas, per-task isolation)
// Rules:
//   • Tasks on OTHER canvases  → always keep the remote version
//   • Tasks on THIS canvas     → winner = higher updatedAt timestamp
//   • Zones on OTHER canvases  → always keep the remote version
//   • Zones on THIS canvas     → keep local (user just moved/edited them)
//   • canvases list + settings → local wins (structural edits travel with the user)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// FILTER PANEL
// ─────────────────────────────────────────────
function FilterPanel({ allTasks, layers, filters, onLayersChange, onFiltersChange, onClose }) {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();
  const owners      = uniq(allTasks.map(t=>t.owner));
  const priorities  = uniq(allTasks.map(t=>t.priority));
  const projects    = uniq(allTasks.map(t=>t.project));
  const departments = uniq(allTasks.map(t=>t.department));

  const toggle = (field, val) => {
    const cur = filters[field];
    onFiltersChange({ ...filters, [field]: cur.includes(val) ? cur.filter(x=>x!==val) : [...cur,val] });
  };

  const activeCount =
    filters.owners.length + filters.priorities.length +
    filters.projects.length + filters.departments.length +
    (filters.dueDateFrom?1:0) + (filters.dueDateTo?1:0);

  const chipStyle = (active, color='#6366f1') => ({
    padding:'3px 10px', borderRadius:20, fontSize:11, cursor:'pointer', fontWeight:600,
    border:`1px solid ${active ? color+'60' : '#e2e8f0'}`,
    background: active ? color+'18' : '#f8fafc',
    color: active ? color : '#64748b',
    transition:'all 0.1s', userSelect:'none',
  });

  const Section = ({title, children}) => (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}>{title}</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:5}}>{children}</div>
    </div>
  );

  return (
    <div style={{
      position:'absolute', top:52, right:14, width:340, background:'#fff',
      borderRadius:14, boxShadow:'0 8px 40px rgba(0,0,0,0.15)', zIndex:600,
      padding:20, fontFamily:"'DM Sans',sans-serif",
      border:'1px solid #e2e8f0',
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <span style={{fontSize:14,fontWeight:800,color:'#1e293b',fontFamily:"'Syne',sans-serif"}}>
          Filters {activeCount>0 && <span style={{background:'#6366f1',color:'#fff',borderRadius:10,padding:'1px 7px',fontSize:11,marginLeft:6}}>{activeCount}</span>}
        </span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {activeCount>0 && (
            <button onClick={()=>onFiltersChange({owners:[],priorities:[],projects:[],departments:[],dueDateFrom:'',dueDateTo:''})}
              style={{border:'none',background:'none',cursor:'pointer',fontSize:11,color:'#ef4444',fontWeight:600}}>
              Clear all
            </button>
          )}
          <button onClick={onClose} style={{border:'none',background:'none',cursor:'pointer',fontSize:18,color:'#94a3b8',lineHeight:1}}>✕</button>
        </div>
      </div>

      {/* Status / Layers */}
      <Section title="Status">
        {STATUS_OPTIONS.map(s=>(
          <span key={s} onClick={()=>onLayersChange(s)} style={chipStyle(layers.includes(s), STATUS_COLORS[s])}>
            {s}
          </span>
        ))}
      </Section>

      {/* Owner */}
      {owners.length>0 && (
        <Section title="Owner">
          {owners.map(o=>(
            <span key={o} onClick={()=>toggle('owners',o)} style={chipStyle(filters.owners.includes(o))}>
              {o}
            </span>
          ))}
        </Section>
      )}

      {/* Priority */}
      {priorities.length>0 && (
        <Section title="Priority">
          {['Critical','High','Medium','Low'].filter(p=>priorities.includes(p)).map(p=>(
            <span key={p} onClick={()=>toggle('priorities',p)} style={chipStyle(filters.priorities.includes(p),
              p==='Critical'?'#ef4444':p==='High'?'#f59e0b':p==='Medium'?'#6366f1':'#22c55e')}>
              {p}
            </span>
          ))}
        </Section>
      )}

      {/* Due Date Range */}
      <Section title="Due Date Range">
        <div style={{display:'flex',gap:8,alignItems:'center',width:'100%'}}>
          <input type="date" value={filters.dueDateFrom}
            onChange={e=>onFiltersChange({...filters,dueDateFrom:e.target.value})}
            style={{flex:1,border:'1px solid #e2e8f0',borderRadius:7,padding:'5px 9px',fontSize:12,outline:'none'}}/>
          <span style={{color:'#94a3b8',fontSize:12}}>to</span>
          <input type="date" value={filters.dueDateTo}
            onChange={e=>onFiltersChange({...filters,dueDateTo:e.target.value})}
            style={{flex:1,border:'1px solid #e2e8f0',borderRadius:7,padding:'5px 9px',fontSize:12,outline:'none'}}/>
        </div>
      </Section>

      {/* Project */}
      {projects.length>0 && (
        <Section title="Project">
          <div style={{display:'flex',flexWrap:'wrap',gap:5,maxHeight:80,overflowY:'auto'}}>
            {projects.map(p=>(
              <span key={p} onClick={()=>toggle('projects',p)} style={chipStyle(filters.projects.includes(p),'#3b82f6')}>
                {p||'—'}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Department */}
      {departments.length>0 && (
        <Section title="Department">
          <div style={{display:'flex',flexWrap:'wrap',gap:5,maxHeight:80,overflowY:'auto'}}>
            {departments.map(d=>(
              <span key={d} onClick={()=>toggle('departments',d)} style={chipStyle(filters.departments.includes(d),'#8b5cf6')}>
                {d||'—'}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}


function tasksInZoneCount(zone, data) {
  const val = String(zone.groupValue||'').trim().toLowerCase();
  return (data.tasks||[]).filter(t =>
    t.canvasId === zone.canvasId &&
    String(t[zone.groupBy]||'').trim().toLowerCase() === val
  ).length;
}

function mergeData(local, remote, activeCanvas) {
  if (!local) return remote;
  if (!remote) return local;

  // ── tasks ──
  const lMap = new Map((local.tasks||[]).map(t=>[t.id,t]));
  const rMap = new Map((remote.tasks||[]).map(t=>[t.id,t]));
  const taskIds = new Set([...lMap.keys(), ...rMap.keys()]);
  const tasks = [];
  for (const id of taskIds) {
    const l = lMap.get(id), r = rMap.get(id);
    if (!l) { tasks.push(r); continue; }
    if (!r) { tasks.push(l); continue; }
    if (l.canvasId === activeCanvas) {
      // Active canvas: higher updatedAt wins
      tasks.push((l.updatedAt||0) >= (r.updatedAt||0) ? l : r);
    } else {
      // Other canvas: remote always wins
      tasks.push(r);
    }
  }

  // ── zones ──
  const lzMap = new Map((local.zones||[]).map(z=>[z.id,z]));
  const rzMap = new Map((remote.zones||[]).map(z=>[z.id,z]));
  const zoneIds = new Set([...lzMap.keys(), ...rzMap.keys()]);
  const zones = [];
  for (const id of zoneIds) {
    const l = lzMap.get(id), r = rzMap.get(id);
    if (!l) { zones.push(r); continue; }
    if (!r) { zones.push(l); continue; }
    zones.push(l.canvasId === activeCanvas ? l : r);
  }

  return {
    canvases: local.canvases || remote.canvases,
    settings:  local.settings  || remote.settings,
    zones,
    tasks,
  };
}


// ─────────────────────────────────────────────
// WEBHOOK PANEL
// ─────────────────────────────────────────────
function WebhookPanel({ settings, allTasks, activeCanvas, onSaveSettings, onAddTasks, onClose, defaultTab }) {
  const wh = settings.webhook || {};
  const [url,    setUrl]    = useState(wh.url    || '');
  const [secret, setSecret] = useState(wh.secret || '');
  const [canvas, setCanvas] = useState(wh.canvasId || activeCanvas);
  const [enabled,setEnabled]= useState(wh.enabled || false);
  const [log,    setLog]    = useState([]);
  const [testing,setTesting]= useState(false);
  const [aiText, setAiText] = useState('');
  const [parsing,setParsing]= useState(false);
  const [tab,    setTab]    = useState(defaultTab || 'config'); // 'config' | 'ai'

  const save = () => onSaveSettings({ ...settings, webhook: { url, secret, enabled, canvasId: canvas } });

  const testPoll = async () => {
    setTesting(true);
    try {
      const r = await fetch(`${url}/poll?secret=${encodeURIComponent(secret)}&canvas=${canvas}`);
      const d = await r.json();
      if (d.tasks?.length) {
        onAddTasks(d.tasks);
        setLog(prev => [{ time: new Date().toLocaleTimeString(), count: d.tasks.length, titles: d.tasks.map(t=>t.title) }, ...prev.slice(0,9)]);
      } else {
        setLog(prev => [{ time: new Date().toLocaleTimeString(), count: 0 }, ...prev.slice(0,9)]);
      }
    } catch(e) {
      setLog(prev => [{ time: new Date().toLocaleTimeString(), error: e.message }, ...prev.slice(0,9)]);
    }
    setTesting(false);
  };

  const parseWithAI = async () => {
    if (!aiText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch((import.meta.env.VITE_WORKER_URL||'').replace(/\/$/, '') + '/ai-parse?secret=' + encodeURIComponent(import.meta.env.VITE_WORKER_SECRET||''), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system: `You convert any task description or JSON into a TaskBub task object.
Return ONLY valid JSON — no markdown fences, no commentary.
Required output fields (use empty string if unknown):
title, owner (first name), priority (Critical/High/Medium/Low),
status (Not Started/In Progress/Blocked/Review/Completed/Cancelled),
department, project, type, nextAction, additionalInfo,
requester, requesterName, projectedStartDate (YYYY-MM-DD), projectedEndDate (YYYY-MM-DD),
points (number), progress (0-1 float).`,
          messages: [{ role: 'user', content: aiText }],
        }),
      });
      const d = await res.json();
      const rawText = (d?.content?.[0]?.text || d?.result || d?.text || '');
      if (!rawText) throw new Error('Empty or unexpected response from AI worker');
      const raw = JSON.parse(rawText.replace(/```json|```/g,'').trim());
      const now = Date.now();
      const task = {
        id: `ai_${now.toString(36)}`,
        canvasId: activeCanvas,
        ...raw,
        x: 500 + Math.random()*400,
        y: 400 + Math.random()*300,
        updatedAt: now,
        source: 'ai-intake',
        relatedTasks: [], blockingTasks: [], subtasks: [], colorOverride: null,
      };
      onAddTasks([task]);
      setAiText('');
      setLog(prev => [{ time: new Date().toLocaleTimeString(), count: 1, titles: [task.title], source: 'AI' }, ...prev.slice(0,9)]);
    } catch(e) {
      setLog(prev => [{ time: new Date().toLocaleTimeString(), error: 'AI parse failed: ' + e.message }, ...prev.slice(0,9)]);
    }
    setParsing(false);
  };

  const iStyle = { width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 11px',
    fontSize:13, boxSizing:'border-box', outline:'none', fontFamily:"'DM Sans',sans-serif" };
  const lStyle = { display:'block', fontSize:10, fontWeight:700, color:'#64748b',
    letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:2000,
      display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:'#fff', borderRadius:16, width:460, maxHeight:'90vh',
        overflow:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.18)', fontFamily:"'DM Sans',sans-serif" }}>

        {/* Header */}
        <div style={{ padding:'20px 24px 0', borderBottom:'1px solid #f1f5f9', paddingBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:16, fontWeight:800, color:'#1e293b', fontFamily:"'Syne',sans-serif" }}>
              🔌 Webhook Intake
            </div>
            <button onClick={onClose} style={{ border:'none', background:'none', cursor:'pointer',
              fontSize:18, color:'#94a3b8', lineHeight:1 }}>✕</button>
          </div>
          {/* Tabs */}
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            {[['config','⚙ Webhook Config'],['ai','✦ AI Parse']].map(([key,label])=>(
              <button key={key} onClick={()=>setTab(key)}
                style={{ border:'none', borderRadius:6, padding:'5px 12px', cursor:'pointer',
                  fontSize:12, fontWeight:600,
                  background: tab===key ? '#6366f1' : '#f1f5f9',
                  color:      tab===key ? '#fff'    : '#64748b' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding:24 }}>
          {tab === 'config' && <>
            {/* Step hint when not yet configured */}
            {!url && (
              <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10,
                padding:'12px 14px', marginBottom:16, fontSize:12, color:'#1d4ed8', lineHeight:1.6 }}>
                <strong>First time?</strong> Deploy the Cloudflare Worker (5 min, browser-only),
                then paste your Worker URL and secret below.
                No terminal required — see the setup guide.
              </div>
            )}

            {/* Worker URL */}
            <div style={{ marginBottom:14 }}>
              <label style={lStyle}>Worker URL</label>
              <input value={url} onChange={e=>setUrl(e.target.value)}
                placeholder="https://taskbub-webhook.yourname.workers.dev"
                style={iStyle}/>
            </div>

            {/* Secret */}
            <div style={{ marginBottom:14 }}>
              <label style={lStyle}>Intake Secret</label>
              <input type="password" value={secret} onChange={e=>setSecret(e.target.value)}
                placeholder="your INTAKE_SECRET value" style={iStyle}/>
            </div>

            {/* Canvas target */}
            <div style={{ marginBottom:14 }}>
              <label style={lStyle}>Target Canvas ID</label>
              <input value={canvas} onChange={e=>setCanvas(e.target.value)}
                placeholder="default" style={iStyle}/>
            </div>

            {/* Enable toggle + save */}
            <div style={{ display:'flex', gap:10, marginBottom:20 }}>
              <button onClick={()=>{ setEnabled(e=>!e); }}
                style={{ flex:1, border:'1px solid #e2e8f0', borderRadius:8, padding:9,
                  cursor:'pointer', fontSize:13, background: enabled ? '#dcfce7' : '#f8fafc',
                  color: enabled ? '#16a34a' : '#64748b', fontWeight:600 }}>
                {enabled ? '● Polling ON' : '○ Polling OFF'}
              </button>
              <button onClick={save}
                style={{ flex:2, border:'none', borderRadius:8, padding:9, cursor:'pointer',
                  fontSize:13, fontWeight:700, background:'#6366f1', color:'#fff' }}>
                Save Config
              </button>
              <button onClick={testPoll} disabled={!url||!secret||testing}
                style={{ flex:1, border:'1px solid #e2e8f0', borderRadius:8, padding:9,
                  cursor: url&&secret&&!testing ? 'pointer' : 'not-allowed',
                  fontSize:13, background:'#f8fafc', color:'#475569' }}>
                {testing ? '…' : '▶ Poll now'}
              </button>
            </div>

            {/* Send test task */}
            {url && secret && (
              <div style={{ marginBottom:16 }}>
                <button onClick={async()=>{
                  try {
                    const r = await fetch(`${url}/intake`, {
                      method:'POST',
                      headers:{'Content-Type':'application/json','Authorization':`Bearer ${secret}`},
                      body: JSON.stringify({
                        title:'Test task from TaskBub',
                        owner:'Dan', priority:'Medium', status:'Not Started',
                        project:'Webhook test', canvasId: canvas,
                        additionalInfo:'Sent from the webhook config panel to verify the connection.'
                      })
                    });
                    const d = await r.json();
                    if(d.ok) setLog(prev=>[{time:new Date().toLocaleTimeString(),count:1,titles:['Test task from TaskBub'],source:'test send'},...prev.slice(0,9)]);
                    else setLog(prev=>[{time:new Date().toLocaleTimeString(),error:JSON.stringify(d)},...prev.slice(0,9)]);
                  } catch(e){ setLog(prev=>[{time:new Date().toLocaleTimeString(),error:e.message},...prev.slice(0,9)]); }
                }}
                  style={{ width:'100%', border:'1px dashed #94a3b8', borderRadius:8, padding:8,
                    cursor:'pointer', fontSize:12, background:'#f8fafc', color:'#64748b' }}>
                  ↗ Send a test task to verify connection
                </button>
              </div>
            )}

            {/* Bookmarklet - any user */}
            <div style={{background:'#f8fafc',borderRadius:10,padding:12,border:'1px solid #e2e8f0',marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>Bookmarklet (any user)</div>
              <div style={{fontSize:12,color:'#64748b',lineHeight:1.6}}>
                Any team member can use the bookmarklet to push tasks.<br/>
                Share the <strong>bookmarklet.html</strong> file + Worker URL + intake secret with them. They open it in a browser and drag the button to their bookmarks bar.
              </div>
            </div>

            {/* Make.com schema hint */}
            <div style={{ background:'#f8fafc', borderRadius:10, padding:14,
              border:'1px solid #e2e8f0', marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#475569',
                textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
                Make.com payload (minimum)
              </div>
              <pre style={{ margin:0, fontSize:11, color:'#475569', whiteSpace:'pre-wrap',
                fontFamily:"'DM Mono',monospace" }}>{`POST ${url||'<worker-url>'}/intake
Authorization: Bearer <secret>

{
  "title":    "{{task name}}",
  "owner":    "Dan",
  "priority": "High",
  "status":   "Not Started",
  "project":  "{{project}}",
  "canvasId": "${canvas}"
}`}</pre>
            </div>
          </>}

          {tab === 'ai' && <>
            <div style={{ marginBottom:8, fontSize:13, color:'#64748b', lineHeight:1.5 }}>
              Paste any task description, Slack message, email snippet, or raw JSON.
              Claude will parse it into a TaskBub task and drop it on the canvas.
            </div>
            <textarea value={aiText} onChange={e=>setAiText(e.target.value)}
              placeholder={`e.g.\n"Dan needs to fix the lead allocation bug in pod red by Friday, high priority, Salesforce project"\n\nor paste raw JSON from any source`}
              style={{ ...iStyle, height:160, resize:'vertical', marginBottom:12, marginTop:8 }}/>
            <button onClick={parseWithAI} disabled={!aiText.trim()||parsing}
              style={{ width:'100%', border:'none', borderRadius:8, padding:11, cursor: aiText.trim()&&!parsing ? 'pointer' : 'not-allowed',
                fontSize:14, fontWeight:700, background: aiText.trim()&&!parsing ? '#6366f1' : '#e2e8f0',
                color: aiText.trim()&&!parsing ? '#fff' : '#94a3b8' }}>
              {parsing ? '✦ Parsing…' : '✦ Parse & Add to Canvas'}
            </button>
          </>}

          {/* Intake log */}
          {log.length > 0 && (
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase',
                letterSpacing:'0.07em', marginBottom:8 }}>Recent intake</div>
              {log.map((entry, i) => (
                <div key={i} style={{ display:'flex', gap:8, padding:'6px 10px',
                  background: entry.error ? '#fef2f2' : '#f0fdf4',
                  borderRadius:6, marginBottom:4, fontSize:12 }}>
                  <span style={{ color:'#94a3b8', fontFamily:"'DM Mono',monospace", minWidth:65 }}>
                    {entry.time}
                  </span>
                  {entry.error
                    ? <span style={{ color:'#ef4444' }}>{entry.error}</span>
                    : <span style={{ color:'#16a34a' }}>
                        +{entry.count} task{entry.count!==1?'s':''}{entry.source?` via ${entry.source}`:''}
                        {entry.titles?.length ? ': ' + entry.titles.slice(0,2).join(', ') : ''}
                      </span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


