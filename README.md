# XOXO CRM - Internal Training and Recruitment

A React/Vite prototype for managing two core HR workflows in one CRM-style interface:

- **Internal Training / LMS**: manage courses by department, lessons, videos, documents, employee assignments, learning progress, and quiz pass/fail results.
- **Recruitment / Kanban Pipeline**: manage jobs, candidates, CV/files, interviews, evaluation results, candidate activity history, and a full 10-stage hiring pipeline.

## Key Features

### Training Module

- Courses grouped by department: Sales, Technical, and Marketing.
- Course metadata including level, description, assigned roles, and assigned employees.
- Lessons with video and document content types.
- Learning progress tracking by lesson.
- Enrollment status: not started, in progress, completed.
- Multiple-choice quizzes.
- Percentage-based scoring.
- Pass/fail evaluation with a `>= 70%` threshold.
- Demo data persisted with `localStorage`.

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

## Notes

This is a complete frontend prototype for demo and workflow validation based on the training and recruitment specification. For production use, it should be extended with a real backend/API, database, authentication, authorization, real file upload, and a deployment pipeline.
