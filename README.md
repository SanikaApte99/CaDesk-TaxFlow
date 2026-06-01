# CaDesk — CA Firm Management Dashboard

A multi-tenant practice management dashboard for Chartered Accountant firms. Built with Next.js, Convex, and NextAuth.

## Features

- **Multi-firm, multi-role auth** — Each firm is isolated. Roles: Admin, Senior CA, Associate CA
- **Client management** — Add and manage clients with PAN, category
- **IT Notices** — Track Income Tax and GST notices per firm, with AI-generated draft replies (powered by Google Gemini)
- **Gmail Inbox** — Connect a work Gmail account to view and filter tax-related emails
- **Role-based access control** — Middleware enforces route-level permissions per role

## Tech Stack

| Layer     | Technology                  |
| --------- | --------------------------- |
| Framework | Next.js 16 (App Router)     |
| Database  | Convex                      |
| Auth      | NextAuth v4 (Credentials)   |
| Styling   | Tailwind CSS v4 + shadcn/ui |
| AI        | Google Gemini               |
| Email     | Gmail API (OAuth2)          |
| Language  | TypeScript                  |

## Getting Started

### 1. install

```bash

npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

### 3. Configure environment variables

Create a `.env.local` file — see `.env.example` for all required variables.

Generate `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Gmail OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable **Gmail API**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI:
   ```
   http://localhost:3000/api/gmails/callback
   ```
5. Copy credentials into `.env.local`

## License

Private — all rights reserved.
