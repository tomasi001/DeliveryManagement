# ArtTrack Delivery Management System

A professional-grade delivery management system built for high-end art logistics.

**Tech Stack:**

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **AI/ML:** OpenAI Vision (`gpt-4o`) for document & artwork recognition
- **Email:** Nodemailer (Custom SMTP)
- **State/Feedback:** Sonner (Toasts), Server Actions

---

## 🏗️ Architecture & Key Decisions

### 1. Pure AI Document Processing

**Decision:** We removed legacy regex/text-parsing libraries (`pdf-parse`) in favor of a pure AI approach.
**Why:** Art manifests vary wildly in format. "Hard-coded" parsers are brittle. We convert PDFs to images and use OpenAI Vision to extract structured data (WAC Code, Artist, Title, Dimensions). This handles handwriting, complex layouts, and scans robustly.

### 2. Supabase "Golden Standard" Workflow

**Decision:** We strictly use the Supabase CLI for all schema changes. The Supabase Dashboard's SQL Editor is **forbidden** for schema edits to ensure our local `migrations` folder is always the source of truth.
**Why:** Keeps development environments synced and enables safe, predictable production deployments.

### 3. Role-Based Access Control (RBAC)

**Decision:** Roles are stored in a `public.profiles` table linked to `auth.users`, not in JWT metadata.
**Why:** Allows for easier real-time updates of user roles without requiring re-login. Protected via RLS policies.

---

## 🔐 Roles & Permissions

| Role            | Access Level   | Description                                                                                                                       |
| :-------------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Super Admin** | 👑 Full System | Can manage users (Add/Edit/Delete), access Admin & Driver dashboards.                                                             |
| **Admin**       | 🛡️ Managerial  | Can upload manifests, create sessions, edit artworks, view history, and finalize deliveries.                                      |
| **Driver**      | 🚛 Operational | Mobile-optimized view. Can scan artworks (AI camera), update status (`In Truck` -> `Delivered`), and trigger delivery completion. |

---

## 🛠️ Database & Migrations SOP

**⚠️ CRITICAL RULE:** NEVER manually edit a migration file in `supabase/migrations` after it has been applied.

### 1. The Development Loop

1.  **Start Local DB:**
    ```bash
    npx supabase start
    ```
2.  **Make Schema Changes:**
    - _Option A (Preferred):_ Edit your schema via SQL commands in a new migration file.
    - _Option B:_ Make changes in the local dashboard (`http://127.0.0.1:54323`), then run `npx supabase db diff -f name_of_change` to generate the migration file.
3.  **Apply Migration Locally:**
    ```bash
    npx supabase migration up
    ```
4.  **Generate Types:**
    ```bash
    npm run supa:gen-types
    ```
    _This updates `src/types/supabase.ts` for full TypeScript safety._

### 2. Deploying to Production

Once tested locally:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

_This safely applies pending migrations to the remote database._

### 3. The "Nuclear Reset" (Emergency Only)

If your local schema gets hopelessly out of sync or corrupted:

1.  Backup any critical data (seed data).
2.  Run:
    ```bash
    npx supabase db reset
    ```
3.  This drops the local database and reapplies all migrations from scratch.

---

## 🚀 Environment Setup

Create a `.env.local` file with the following keys:

```env
# ------------------------------
# SUPABASE (Found in Project Settings -> API)
# ------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-public-key
# REQUIRED for Super Admin User Management (Bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret

# ------------------------------
# EMAIL (Nodemailer)
# ------------------------------
# If using Gmail, use "smtp.gmail.com" and an App Password (NOT your login password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
SENDER_EMAIL=your-system-email@gmail.com
SENDER_PASSWORD=your-app-password
ADMIN_EMAIL=admin-receiver@example.com

# ------------------------------
# AI (OpenAI)
# ------------------------------
OPENAI_API_KEY=sk-proj-...
```

---

## 📱 Application Workflows

### Admin: Creating a Session

1.  **Upload:** Drag & drop a delivery PDF.
2.  **Processing:** AI converts pages to images, reads text, and extracts artwork details.
3.  **Review:** Admin sees a "Checkpoint" table to verify/edit extracted data (WAC, Artist, Title).
4.  **Finalize:** Session is created, status set to `Active`.

### Driver: The Delivery Loop

1.  **Dashboard:** Sees active sessions.
2.  **Loading Truck:**
    - Scans item (camera) OR taps item in list.
    - Status updates: `In Stock` -> `In Truck`.
3.  **Delivering:**
    - Scans item (camera) OR taps item in list.
    - Status updates: `In Truck` -> `Delivered`.
4.  **Complete:**
    - Clicks "Complete Delivery".
    - System generates email report -> Sends receipt to Client -> Sends manifest report to Admin.
    - Session archived.

### Super Admin: User Management

1.  **Access:** `/super-admin` (only accessible to `super_admin` role).
2.  **Create User:** Adds email/password + Role.
    - _Behind the scenes:_ Creates auth user -> Trigger fires -> `public.profiles` entry created.

---

## 🔧 Troubleshooting & Maintenance

### Adding a New Feature

1.  **Schema:** Create migration via CLI.
2.  **Types:** Run `npm run supa:gen-types`.
3.  **UI:** Build Shadcn components.
4.  **Logic:** Create Server Action in `src/app/actions/`.
5.  **Security:** Add `checkRole([...])` to the start of the Server Action.

---

## 📜 Standard Operating Procedures (SOPs)

1.  **Code Style:** Run `npm run lint` before committing.
2.  **Commit Messages:** Use conventional commits (e.g., `feat: add user modal`, `fix: rls policy`).
3.  **Dependency Management:** Always check `package.json` for version conflicts (especially with Next.js 15 RC/Canary releases).
