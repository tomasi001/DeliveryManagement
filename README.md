# ArtTrack Delivery Management System

A professional-grade delivery management system built with Next.js 15, Tailwind CSS v4, and Shadcn UI.

## Features

- **Admin Workflow**:
  - Drag-and-drop PDF upload for delivery manifests.
  - Instant parsing of WAC codes.
  - Session review and finalization.
- **Driver Workflow**:
  - Mobile-optimized interface.
  - Camera-based barcode/QR scanning (WAC codes).
  - Real-time status updates (Loading -> Delivering).
- **Automated Communication**:
  - Instant email notifications upon delivery completion using Nodemailer.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI, Framer Motion
- **Database**: Supabase
- **Email**: Nodemailer (Custom Service)

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file. You can choose to connect to **Local** or **Live** Supabase.

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
SENDER_EMAIL=your_email@example.com
SENDER_PASSWORD=your_email_password
ADMIN_EMAIL=admin@example.com
```

### 3. Supabase Development

This project uses the Supabase CLI. You can work locally or link to a live project.

#### A. Working Locally (Recommended for Dev)
1. **Start Local DB:**
   ```bash
   npm run supa:start
   ```
   *This outputs your local `API URL` and `anon key`. Copy these to `.env.local`.*

2. **Apply Migrations:**
   Migrations are applied automatically on start. To create a new migration:
   ```bash
   npm run supa:migration:new name_of_change
   ```

#### B. Connecting to Live (Production)
1. **Login to Supabase CLI:**
   ```bash
   npm run supa:login
   ```

2. **Link Project:**
   ```bash
   npm run supa:link -- --project-ref your_project_ref
   ```
   *You can find your Project Reference in the Supabase Dashboard URL (e.g., `https://app.supabase.com/project/your_project_ref`).*

3. **Push Schema:**
   Push your local migrations to the live database:
   ```bash
   npm run supa:push
   ```

### 4. Run the App
Once your `.env.local` is set (either to local or live credentials):
```bash
npm run dev
```

## Deployment

### Vercel (Frontend)
1. Push to GitHub.
2. Import project in Vercel.
3. Add Environment Variables (Live Supabase keys & Email credentials).
4. Deploy.

### Supabase (Backend)
- Use `npm run supa:push` to keep your production database schema in sync with your local development.
