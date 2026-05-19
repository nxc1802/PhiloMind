UI/UX Design Document

Project: “PhiloMind” — AI Philosophy Learning Platform

⸻

1. Product Overview

Product Type

AI-native educational web application.

Primary Goal

Transform philosophy learning from:

* passive reading
    → interactive conceptual exploration.

UX Goal

Người dùng phải cảm thấy:

* dễ hiểu hơn
* ít “ngợp”
* có định hướng học rõ ràng
* hứng thú khám phá

⸻

2. Design Principles

2.1 Progressive Learning

Không hiển thị toàn bộ nội dung ngay lập tức.

Hiển thị:

* từ tổng quan → chi tiết
* từ dễ → khó
* từ macro → micro

⸻

2.2 Low Cognitive Load

Triết học vốn đã “nặng”.

UI phải:

* nhiều khoảng trắng
* typography dễ đọc
* hierarchy rõ ràng
* giảm text overload

⸻

2.3 Visual First

Ưu tiên:

* graph
* card
* diagram
* animation nhẹ

hơn:

* block text dài

⸻

2.4 Exploration-based Learning

Người dùng phải có cảm giác:

“khám phá tri thức”

không phải:

“đọc PDF”.

⸻

2.5 Context Preservation

Luôn cho người dùng biết:

* mình đang học gì
* thuộc chapter nào
* liên hệ với concept nào

⸻

3. Information Architecture

Workspace
│
├── Dashboard
│
├── Courses
│     └── Learning Journey
│             └── Concept Node
│
├── Flashcards
│
├── Podcasts
│
├── AI Debate
│
└── Settings

⸻

4. Main User Flow

Upload PDF
    ↓
AI processing
    ↓
Generate Learning Journey
    ↓
Explore Mindmap
    ↓
Select Concept Node
    ↓
Learn via:
    • Summary
    • Original content
    • Visuals
    • Audio
    • Debate
    • Flashcards

⸻

5. Global Layout System

Desktop Layout

┌────────────────────────────────────┐
│ Top Navigation                     │
├─────────────┬──────────────────────┤
│ Sidebar     │ Main Content         │
│             │                      │
│             │                      │
└─────────────┴──────────────────────┘

⸻

6. Navigation Design

Top Navigation

Contains

* Logo
* Search
* Current Course
* Notifications
* Profile

UX Notes

* Sticky top bar
* Minimal height
* Focus on workspace

⸻

Sidebar Navigation

Sections

* Dashboard
* Learning Journey
* Flashcards
* Podcasts
* Debate
* Progress
* Settings

UX

* collapsible
* icon + label
* active section highlight

⸻

7. Dashboard Screen

Goal

Provide:

* quick resume
* progress overview
* recommended learning path

⸻

Layout

Welcome Header
Continue Learning Card
Progress Overview
Recent Concepts
Recommended Next Nodes
Daily Flashcards

⸻

Key Components

Continue Learning Card

Shows:

* current node
* chapter
* completion %
* resume button

⸻

Progress Heatmap

GitHub-style learning activity.

⸻

Learning Streak

Gamification nhẹ.

⸻

8. Learning Journey Screen

Đây là core screen quan trọng nhất.

⸻

Layout

┌────────────────────────────────────┐
│ Journey Toolbar                    │
├────────────────────────────────────┤
│                                    │
│      Interactive Mindmap           │
│                                    │
└────────────────────────────────────┘

⸻

Mindmap Interaction

Node States

Locked

* gray
* low opacity

Available

* highlighted

In Progress

* glowing border

Completed

* green check

⸻

Node Design

Structure

┌─────────────────┐
│ Concept Title   │
│ Difficulty      │
│ Progress Bar    │
└─────────────────┘

⸻

Node Interaction

Hover

* preview summary
* estimated study time

Click

Open Concept Learning Panel.

⸻

Zoom Behavior

Zoom out

Shows:

* chapters only

Medium zoom

Shows:

* concepts

Deep zoom

Shows:

* sub-concepts

⸻

UX Goal

Create:

“knowledge universe feeling”.

⸻

9. Concept Learning Screen

Most important UX area.

⸻

Layout

┌──────────────────────────────────────┐
│ Breadcrumb                           │
├───────────────┬──────────────────────┤
│ Learning Nav  │ Content Area         │
│               │                      │
│               │                      │
└───────────────┴──────────────────────┘

⸻

Left Navigation

Shows

* current chapter
* nearby concepts
* dependencies
* completion status

⸻

Content Area Structure

Ordered Sections

1. Concept Header

Contains:

* title
* difficulty
* estimated time
* tags

⸻

2. Summary Block

Purpose

Explain quickly.

UX

* max 5 lines initially
* expandable

⸻

3. Original Text Block

Purpose

Preserve academic context.

Features

* highlight important keywords
* collapsible sections
* synchronized with summary

⸻

4. Visual Explanation Block

Content Types

* Mermaid diagram
* AI illustration
* Process flow
* Concept graph

⸻

5. Podcast Block

UI

▶ Play
Audio Progress
Transcript
Speed Control

⸻

UX Notes

Features

* synchronized transcript
* highlight currently spoken sentence
* background play

⸻

6. AI Debate Block

Chat Layout

AI Tutor Messages
User Input
Suggested Questions

⸻

Suggested Questions

Examples:

* “Explain simpler”
* “Give real-life example”
* “Why is this important?”
* “What are common misunderstandings?”

⸻

Debate UX Goal

Không chỉ Q&A.

Mà là:

* reasoning
* challenging ideas
* deep understanding

⸻

7. Flashcard Block

Card UX

Front:

What is dialectical contradiction?

Back:

Unity and struggle of opposites...

⸻

Review Actions

* Again
* Hard
* Good
* Easy

⸻

10. AI Processing Experience

Upload Screen

⸻

Layout

Upload PDF Area
Processing Steps
Estimated Progress

⸻

Processing Steps Animation

✓ Parsing document
✓ Extracting structure
✓ Building concepts
✓ Creating learning journey
✓ Generating flashcards

⸻

UX Goal

Make AI feel:

* active
* intelligent
* transparent

⸻

11. Visual Design System

Design Style

Keywords

* modern
* calm
* intellectual
* futuristic
* minimal

⸻

Color Palette

Primary

Deep Indigo / Dark Blue

Accent

Soft Purple / Cyan

Background

Warm off-white
or dark graphite

⸻

Typography

Headings

Bold geometric font.

Body

Highly readable sans-serif.

Suggested:

* Inter
* Geist
* SF Pro

⸻

Spacing System

Use generous whitespace.

Avoid:

* cramped UI
* dense information blocks

⸻

12. Animation & Motion

Principles

Subtle only.

⸻

Use Motion For

* node transitions
* expand/collapse
* zooming
* hover previews
* audio sync

⸻

Avoid

* flashy effects
* excessive motion

⸻

13. Responsive Design

Mobile Strategy

Desktop-first product.

Mindmap on mobile:

* simplified
* vertical learning flow

⸻

Mobile Layout

Top Nav
Scrollable Learning Cards
Bottom Navigation

⸻

14. Accessibility

Requirements

* keyboard navigation
* readable contrast
* transcript for podcast
* adjustable text size

⸻

15. Empty States

Examples

No Course

“Upload your first philosophy document.”

No Progress

“Start your learning journey.”

⸻

16. Error UX

AI Failure

Explain:

* what failed
* retry option
* fallback mode

Never show raw errors.

⸻

17. Gamification (Lightweight)

Include

* streak
* progress %
* completion rings
* milestone badges

⸻

Avoid

* childish gamification
* excessive dopamine design

⸻

18. Suggested Tech Stack

Frontend

* Next.js￼
* React
* TypeScript

UI

* Tailwind CSS￼
* shadcn/ui￼

Graph Visualization

* React Flow￼

Animation

* Framer Motion￼

⸻

19. Recommended MVP Screens

Essential

1. Dashboard
2. Upload Screen
3. Learning Journey
4. Concept Learning Screen
5. Flashcard Review
6. AI Debate Screen

⸻

20. Final UX Philosophy

The product should feel like:

“Exploring a universe of ideas”

instead of:

“Reading a digital textbook”.