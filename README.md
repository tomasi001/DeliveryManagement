# ArtTrack Delivery Management System

A professional-grade delivery management system built with Next.js 15, Tailwind CSS v4, and Shadcn UI.

## 🔐 Role-Based Access Control (RBAC)

The system features three distinct roles with secure redirections and endpoint protection:

-   **Super Admin**: Full system control. Can add and remove internal users (Admins and Drivers).
    -   *Special Note*: The email `tom.shields001@gmail.com` is automatically granted this role.
-   **Admin**: Manages delivery sessions. Can upload manifests, create sessions, and review reports.
-   **Driver**: Operates the delivery workflow. Can scan artworks and update statuses in real-time.

## 🚀 Key Features

-   **AI-Powered Manifest Extraction**: Upload any delivery PDF (text or scanned) and the system automatically identifies artwork details using AI Vision.
-   **Mobile Scanner**: Drivers use a high-performance camera scanner with AI OCR to identify artworks instantly.
-   **Manual Workarounds**: Tap any item in the manifest to manually override its status if scanning isn't possible.
-   **Automated Email Reports**: Confirmation emails are sent to clients and detailed reports to the warehouse admin upon completion.

## 🛠️ Environment Variables

Required variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # REQUIRED for Super Admin User Management

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
SENDER_EMAIL=your_email@example.com
SENDER_PASSWORD=your_email_password
ADMIN_EMAIL=admin@example.com

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key
```

## 🏗️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Setup
This project uses the Supabase CLI for migrations and type generation.

> **CRITICAL NOTE**: Never manually edit or create migration files in the `supabase/migrations` folder without using the CLI. All migration files must be **timestamped and managed by the CLI** to maintain database integrity between local and remote environments.

#### One-Time Setup
1. **Login to Supabase CLI**: `npx supabase login`
2. **Link to Remote Project**: `npx supabase link --project-ref your-project-ref`
   * *Note: You will need your Database Password.*

#### Local Development Workflow
Use this workflow when adding new features or changing the database schema:

1. **Create Migration File**: 
   ```bash
   npx supabase migration new <feature_name>
   ```
2. **Add SQL**: Paste your table definitions, RLS policies, and triggers into the newly created file in `supabase/migrations/`.
3. **Apply Locally**: 
   ```bash
   npx supabase migration up
   ```
4. **Generate TypeScript Types**:
   ```bash
   npm run supa:gen-types
   ```

#### Production Deployment Workflow
When your local changes are tested and ready for the live environment:

1. **Push to Remote**:
   ```bash
   npx supabase db push
   ```
2. **Verify**: Check the Supabase Dashboard -> Table Editor to ensure tables and policies are present.

#### Initial Super Admin Creation
Since the public signup flow is disabled, use the Supabase Admin API (via `curl`) to create your first Super Admin. Replace placeholders with your actual Project URL and `SUPABASE_SERVICE_ROLE_KEY`:

```bash
curl -X POST 'https://[PROJECT_REF].supabase.co/auth/v1/admin/users' \
-H 'Authorization: Bearer [SERVICE_ROLE_KEY]' \
-H 'apikey: [SERVICE_ROLE_KEY]' \
-H 'Content-Type: application/json' \
-d '{
  "email": "tom.shields001@gmail.com",
  "password": "YOUR_SECURE_PASSWORD",
  "email_confirm": true
}'
```
*The database trigger `on_auth_user_created` will automatically assign the `super_admin` role to this specific email.*

#### Working Locally
1.  **Start Local DB:** `npm run supa:start`
2.  **Apply Migrations:** `npm run supa:migration up`
3.  **Generate Types:** `npm run supa:gen-types`

#### Connecting to Live
1.  **Link Project:** `npm run supa:link -- --project-ref your_ref`
2.  **Push Schema:** `npm run supa:push`

### 3. Development
```bash
npm run dev
```

## 📦 Deployment

### Frontend (Vercel)
Ensure all environment variables are added to your Vercel project settings.

### Backend (Supabase)
Ensure your `SUPABASE_SERVICE_ROLE_KEY` is kept secure and never exposed to the client.
