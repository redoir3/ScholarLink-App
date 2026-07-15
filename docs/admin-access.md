# Admin access

After running:

```bash
npm run seed:admin
```

Use the **Admin** tab on `/login`:

| Field    | Value                 |
|----------|-----------------------|
| Email    | `admin@locallink.app` |
| Password | `LocalLinkAdmin2026!` |

Change this password after first login in production. Override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local` before seeding.

Also set:

```
NEXT_PUBLIC_ADMIN_EMAIL=admin@locallink.app
```

## Required SQL

Run in Supabase SQL editor (in order):

1. `sql/001_scholarship_growth.sql` (if not already)
2. `sql/002_auth_and_saved.sql` — profiles + saved_scholarships + RLS
