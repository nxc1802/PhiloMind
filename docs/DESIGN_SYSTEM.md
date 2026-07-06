# Design System and UX Direction

Last code audit: 2026-07-06.

This document captures the current product UX contract for the learner frontend and admin portal. It replaces older proposal-style UI notes.

## Product Feel

PhiloMind should make philosophy feel structured, navigable, and discussable. The UI should reduce cognitive load instead of adding decorative complexity.

Principles:

- Show learning context before deep content.
- Keep reading surfaces calm and legible.
- Prefer explicit next actions over hidden progression.
- Use interactive components only when they strengthen understanding.
- Avoid exposing schema jargon to learners.
- Keep admin screens dense and operational; keep learner screens guided and reflective.

## Learner App Structure

Global learner shell:

- `PageShell` provides the main frame.
- `Navbar`, `StudyModulesSidebar`, feedback/discussion widgets, theme context, and auth context provide shared behavior.
- Routes are protected except login/register.

Primary learner routes:

| Route | UX role |
|---|---|
| `/` | Resume learning and orient the user. |
| `/lessons` | Course journey and lesson player. |
| `/practice` | Flashcards and quiz practice. |
| `/debate` | Socratic argument practice. |
| `/philosofun` | Lightweight video learning. |
| `/docs` | Reference/support material. |
| `/settings` | User preferences, including local unlock-all dev setting. |

## Lesson UX Contract

The lesson experience is the most important learner workflow.

Current contract:

- Journey view uses a mindmap-style overview.
- Opening a lesson switches into a full-height focused player.
- Locked lessons and unpublished lessons are blocked before opening.
- The player has a progress strip, reset button, media column, draggable divider, and right interactive column.
- Media belongs in the center column; learner actions belong in the right column.
- Grouped components should read as one cohesive learner activity, not as raw nested schema.
- Multiple-choice options should not look pre-answered.
- The learner must always have a clear next action after reading, answering, sorting, matching, or revealing.

Detailed implementation contract: [LESSON_COMPONENTS.md](LESSON_COMPONENTS.md).

## Visual Language

Current frontend conventions:

- Tailwind is the primary styling layer.
- Theme switching uses app context and CSS variables/classes.
- Prefer quiet surfaces, clear spacing, and readable contrast.
- Use icons for compact actions where the meaning is familiar.
- Keep cards for concrete content containers, not as decoration around entire page sections.
- Avoid dense long-form text blocks in interactive lesson steps.

## Admin UX Contract

Admin screens are operational tools:

- Prioritize scanning, editing, validation feedback, and fast navigation.
- Keep JSON authoring explicit where no structured editor exists yet.
- Use toasts for save/upload errors and success states.
- Keep destructive actions guarded by confirmation.
- Admin wording may mention schema fields; learner wording should not.

The current highest-friction admin area is lesson authoring in `admin/src/pages/Nodes.jsx`, where `lessonFlow` is still edited as JSON. Backend validation is therefore critical.

## Accessibility and Interaction Notes

- Preserve keyboard-accessible buttons and semantic controls.
- Use `aria-label` on icon-only buttons.
- Keep lesson player controls stable during progress changes.
- Do not let dynamic text resize fixed controls or overlap surrounding content.
- For media, provide `alt`, `title`, or descriptive text when available.
- Modal-style onboarding guidance should support both explicit close and outside click dismissal.
