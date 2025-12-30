
# Child Care Compass - Architecture & Design Document

## 1. Product Vision & Personas
**Child Care Compass** creates a "Soft Software" experience, moving away from corporate stiffness to a nurturing, playful digital environment.
- **Visual Vibe:** Organic shapes, "Doodle" aesthetics, and pastel tones (Sky Blue/Playful Pink).
- **Core Value:** Reduces anxiety for parents via "Stories" and reduces friction for teachers via one-hand operational "Kanban" flows.

### Personas
- **Ms. Manager (Admin):** Needs control without complexity. Uses the "Control Center" to manage billing, staffing, and compliance.
- **Mr. Teacher (Staff):** Needs speed. Uses "Kanban Mode" for check-ins and "Quick Log" for activities.
- **Parent (Guardian):** Needs reassurance. Uses "Live Feed" and "Daily Stories" to feel connected.

## 2. Information Architecture & User Flows

### Primary Entities
- **Center:** Tenant root.
- **Classroom:** Grouping unit (Infants, Toddlers).
- **Child:** Core entity. Links to Guardians, Attendance, Activities.
- **Activity:** Event log (Photo, Nap, Meal, Incident).
- **Billing:** Invoices, Payments, Ledger.

### Core Flows
1.  **Teacher Daily Flow:**
    *   *Arrival:* Drag child from "Arriving" to "Checked In" (Kanban).
    *   *During Day:* Tap "Quick Action" -> "Photo" -> Snap -> Tag Children -> Post.
    *   *Departure:* Digital Handover signature -> Move to "Went Home".
2.  **Parent Engagement Flow:**
    *   *Notification:* "New Moment."
    *   *View:* Opens App -> Feeds (Scroll) -> Tap "Story Mode" for recap.
    *   *Action:* Message Teacher via BottomSheet.

## 3. Screen Inventory & Layout Patterns

### Web / Desktop (Admin & Teacher)
1.  **Admin Dashboard (3-Column Layout):**
    *   *Left:* Nav (Centers/Rooms).
    *   *Center:* List (Children/Staff) with "Nest Card" visuals.
    *   *Right:* Context Panel (Child Details/Timeline).
2.  **Control Center:** Masonry grid of widgets (Attendance, Billing, Alerts).
3.  **Classroom View:** "Broken Grid" layout showing main room stats + sub-groups.

### Mobile (Parent & Teacher)
1.  **Parent Home:** Bottom Nav + Infinite Scroll Feed. Top area shows "Stories" bubbles.
2.  **Messaging:** Chat interface + "+" button triggering a BottomSheet for structured inputs.
3.  **Onboarding:** 4-step slider with playful blob animations.

## 4. Frontend Architecture (React + TypeScript)
- **State:** `TanStack Query` (Server State) + `Zustand` (Global UI State).
- **Styling:** Tailwind CSS. Custom configuration for "blob" radius and pastel palette.
- **Router:** HashRouter (per deployment constraints).
- **Motion:** `framer-motion` for springy card interactions.

## 5. Backend Architecture (Node.js)
- **API Style:** REST for standard CRUD, WebSockets (Socket.io) for Live Feed/Chat.
- **Database:** PostgreSQL.
- **Auth:** RBAC (Role-Based Access Control) using JWT.
- **Multi-tenancy:** `center_id` column on all primary tables.

### Database Schema Outline (Simplified)
- `users` (id, email, role, password_hash)
- `children` (id, center_id, classroom_id, guardian_id, profile)
- `activities` (id, child_id, type, media_url, timestamp)
- `attendance` (id, child_id, check_in, check_out)
