# Prisma Setup Instructions

## After Schema Changes

After updating the Prisma schema, you need to:

1. **Update the database schema:**
   ```bash
   cd backend
   npx prisma db push
   ```

2. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## Schema Changes Made

1. Added `username` field to `User` model (unique)
2. Added `isOnboarded` field to `KnowledgeSeeker` model (default: false)

## Note

The Prisma client needs to be regenerated for the TypeScript types to match the updated schema. After running the commands above, the backend API will work correctly.

## Model Name Reference

- `User` → `prisma.user`
- `KnowledgeSeeker` → `prisma.knowledgeSeeker`
- `KnowledgeProvider` → `prisma.knowledgeProvider`
- `Questions` → `prisma.questions` (Prisma converts to lowercase)
- `Appointment` → `prisma.appointment`

