<div align="center">
  <h1>XOXO CRM</h1>
  <p><strong>Internal Training LMS and Recruitment Kanban for HR operations</strong></p>

  <p>
    <a href="https://tuyen-dung-steel.vercel.app"><strong>Open Live Demo</strong></a>
    ·
    <a href="#features">Features</a>
    ·
    <a href="#run-locally">Run Locally</a>
  </p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/React-19-155eef?style=for-the-badge&logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-0f766e?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-6-f59e0b?style=for-the-badge&logo=vite&logoColor=white" />
    <img alt="Vercel" src="https://img.shields.io/badge/Deployed_on-Vercel-111827?style=for-the-badge&logo=vercel&logoColor=white" />
  </p>
</div>

---

## Overview

XOXO CRM is a mobile-friendly React/Vite prototype for managing two HR workflows in one CRM-style interface:

- **Internal Training / LMS**: courses, lessons, videos, documents, assignments, progress tracking, and quiz pass/fail results.
- **Recruitment / Kanban Pipeline**: jobs, candidates, CV/files, interviews, evaluation results, activity history, and a full 10-stage hiring process.
- **Attendance**: employee check-in/check-out, GPS capture, and monthly attendance records stored in Supabase.

> The GitHub URL shows the source code and project documentation. To view the actual app interface, open the live Vercel demo: **https://tuyen-dung-steel.vercel.app**

## Features

### Training Module

- Courses grouped by Sales, Technical, and Marketing departments.
- Course level, description, assigned roles, and assigned employees.
- Video and document lessons.
- Lesson progress tracking.
- Enrollment status: not started, in progress, completed.
- Multiple-choice quizzes.
- Percentage-based scoring.
- Pass/fail evaluation with a `>= 70%` threshold.
- Demo persistence through `localStorage`.

### Recruitment Module

- Recruitment dashboard with job, candidate, interview, and hiring metrics.
- Job table with title, department, quantity needed, quantity hired, and status.
- Full 10-stage recruitment kanban:
  - New Application
  - Screened
  - Interview Scheduled
  - Interviewed
  - Technical Test
  - Decision Pending
  - Offer Accepted
  - Probation
  - Official
  - Rejected
- Drag and drop candidates between stages.
- Automatic activity history for stage changes.
- Candidate profile with contact information, applied position, source, notes, CV/file, interview schedule, and activity timeline.
- Interview scheduling and interview result recording.
- Candidate conversion to employee when moved to the official stage.

### Attendance Module

- New `Chấm công` menu item at `/attendance`.
- The original Jarviz Attendance app is embedded with an iframe so the old UI and behavior stay unchanged.
- The embedded attendance app and this CRM use the same Supabase project/database.
- The overview dashboard reads today's attendance counters from Supabase.
- GPS permission is passed to the iframe with `allow="geolocation"`.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Supabase JS
- Lucide React icons
- Motion
- Vercel deployment
- `localStorage` for training and recruitment demo persistence

## Run Locally

Prerequisite: Node.js

```bash
npm install
npm run dev
```

The app runs at:

```text
http://localhost:3000
```

Type-check and build:

```bash
npm run lint
npm run build
```

## Supabase Attendance Setup

Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor, then set these variables in `.env.local` or in Vercel Environment Variables:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_ATTENDANCE_IFRAME_URL="https://jarviz-attendance.vercel.app"
```

The local `.env.local` file is ignored by Git. The iframe URL should point to the deployed attendance app. Check-in, check-out, GPS, and the monthly attendance history are stored in Supabase table `attendance_records`, so both apps share the same data.

## Deployment

This project is configured for Vercel as a Vite single-page app.

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrite config: `vercel.json`

## Notes

This is a complete frontend prototype for demo and workflow validation based on the training and recruitment specification. The attendance module is integrated as an iframe of the original attendance app and shares the same Supabase database. For production use, it should be extended with authentication, authorization, stricter RLS policies, real file upload, and a deployment pipeline.
