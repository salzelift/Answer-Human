# Database Seeding Guide

This directory contains the seed script to populate the database with dummy data.

## What Gets Seeded

The seed script creates:

1. **Categories** (18 categories in a hierarchical structure)
   - Design (with UI/UX, Graphic Design subcategories)
   - Technology (with Web Development, Mobile Development subcategories)
   - Career & Growth (with Interview Prep, Resume Review subcategories)

2. **Users & Knowledge Providers (Experts)** (5 experts)
   - Sarah Chen - UI/UX Designer
   - Michael Rodriguez - Full Stack Developer
   - Emily Johnson - Career Coach
   - David Kim - Mobile Developer
   - Lisa Wang - Graphic Designer

3. **Users & Knowledge Seekers** (2 seekers)
   - John Doe - Technology enthusiast
   - Jane Doe - Design enthusiast

4. **Questions** (3 questions)
   - Various questions from seekers

5. **Admin User** (1 admin)
   - Username: `admin`
   - Email: `admin@example.com`

## Running the Seed

### Prerequisites

1. Make sure your database is set up and the schema is synced:
   ```bash
   npx prisma db push
   ```

2. Ensure your `.env` file has the correct `DATABASE_URL` configured.

### Run the Seed

```bash
npm run seed
```

Or using Prisma directly:

```bash
npx prisma db seed
```

## Default Credentials

All seeded users have the same password for testing:
- **Password**: `password123`

### Test Accounts

**Experts (Knowledge Providers):**
- `sarahchen` / `sarah.chen@example.com`
- `mrodriguez` / `michael.rodriguez@example.com`
- `emilyjohnson` / `emily.johnson@example.com`
- `davidkim` / `david.kim@example.com`
- `lisawang` / `lisa.wang@example.com`

**Seekers (Knowledge Seekers):**
- `johndoe` / `john.doe@example.com`
- `janedoe` / `jane.doe@example.com`

**Admin:**
- `admin` / `admin@example.com`

## Important Notes

⚠️ **Warning**: The seed script will **delete all existing data** before seeding. Do not run this in production!

To modify the seed data, edit `prisma/seed.ts`.

