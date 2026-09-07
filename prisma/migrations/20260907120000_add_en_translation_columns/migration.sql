-- Bilinguisme FR/EN : colonnes miroir anglaises, toutes nullables.
-- NULL => le backend renvoie la version FR (repli).

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Post" ADD COLUMN "introEn" TEXT;
ALTER TABLE "Post" ADD COLUMN "subtitleEn" TEXT;
ALTER TABLE "Post" ADD COLUMN "contentEn" TEXT;

-- AlterTable
ALTER TABLE "Tutorial" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Tutorial" ADD COLUMN "descriptionEn" TEXT;

-- AlterTable
ALTER TABLE "Definition" ADD COLUMN "termEn" TEXT;
ALTER TABLE "Definition" ADD COLUMN "definitionEn" TEXT;
ALTER TABLE "Definition" ADD COLUMN "categoryEn" TEXT;
