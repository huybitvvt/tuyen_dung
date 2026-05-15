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

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Lucide React icons
- Motion
- Vercel deployment
- `localStorage` for demo persistence

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

## Deployment

This project is configured for Vercel as a Vite single-page app.

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrite config: `vercel.json`

## Notes

This is a complete frontend prototype for demo and workflow validation based on the training and recruitment specification. For production use, it should be extended with a real backend/API, database, authentication, authorization, real file upload, and a deployment pipeline.
