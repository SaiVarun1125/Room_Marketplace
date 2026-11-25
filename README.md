# RoomMate SGF

A student-focused marketplace for finding individual rooms, subleases and lease transfers in **Springfield, MO**. Posters list a room, seekers browse and filter, save favorites, and message the poster in-app. Admins moderate reports.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)

## Why

Room hunting for students usually happens in scattered group chats with no verification. This project puts listings, compliance details (landlord consent, lease document, transfer fee) and messaging in one place.

## Features

- **Listings:** create, browse and filter by type (private room, shared room, sublease, lease transfer, whole unit), neighborhood, rent and availability
- **Compliance info per listing:** landlord consent, lease document availability, transfer fee, prime-tenant confirmation
- **Saved listings** and **in-app chat** between seeker and poster
- **Profiles** with school, budget range, move-in date and preferences
- **Reporting and admin review** with a status workflow (open, under review, resolved, dismissed)
- **Auth** through Supabase with a callback route and protective middleware

## Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js App Router, server and client components |
| Data + auth | Supabase (Postgres, Auth, Storage) |
| Security | Row Level Security on every table; owners edit only their own listings, chat visible only to the two participants |
| Schema | `supabase/migrations/001_initial_schema.sql`: profiles, listings, listing_compliance, listing_photos, saved_listings, chat_threads, messages, reports |

## Run locally

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

In your Supabase project, run the migration in `supabase/migrations/001_initial_schema.sql`, then create the public storage bucket `listing-photos`:

```sql
insert into storage.buckets(id, name, public) values ('listing-photos', 'listing-photos', true);
```

```bash
npm run dev
```

Open http://localhost:3000.

## Status

Work in progress. Core listing, chat, saved and admin flows are implemented; no public deployment yet.
