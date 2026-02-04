# Database setup (Neon)

This project uses **Neon** PostgreSQL. The Prisma schema is configured for Neon:

- **DATABASE_URL** – pooled connection (for the app / Prisma Client).
- **DIRECT_URL** – direct connection (for `prisma db push` and `prisma migrate`).

Both are set in `.env`. To push schema changes:

```bash
pnpm db:push
```

To run migrations:

```bash
pnpm prisma:migrate
```

Connection strings are in your Neon project dashboard under **Connection details**.
