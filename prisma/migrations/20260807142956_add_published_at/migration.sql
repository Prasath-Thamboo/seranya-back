-- AlterTable
ALTER TABLE "Post" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "Tutorial" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "Definition" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- Backfill: already-published rows get an explicit publishedAt (= updatedAt)
-- so they keep a truthful publish date; unpublished rows stay NULL (no schedule).
UPDATE "Post" SET "publishedAt" = "updatedAt" WHERE "isPublished" = true;
UPDATE "Tutorial" SET "publishedAt" = "updatedAt" WHERE "isPublished" = true;
UPDATE "Definition" SET "publishedAt" = "updatedAt" WHERE "isPublished" = true;
