A todo app built with Next.js, Supabase (auth + Postgres), and Prisma.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (for auth and the Postgres database)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and fill in your values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` / `DIRECT_URL` — your Supabase Postgres connection strings (found in your Supabase project's Database settings).
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase project URL and anon/publishable key (found in your Supabase project's API settings).

3. Push the Prisma schema to your database:

   ```bash
   npx prisma db push
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to `/login`, where you can sign up for a new account.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run lint` — run ESLint
- `npm run contract:emit` — emit the Prisma contract

## Deployment

Deployed on Vercel: https://my-todo-app-coral-nine.vercel.app

Pushes to `main` deploy automatically.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
