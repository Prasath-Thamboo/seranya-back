/*
  Warnings:

  - The primary key for the `Class` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `ClassUnit` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bio` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intro` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `story` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtitle` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('GALERY', 'PROFILEIMAGE', 'HEADERIMAGE', 'FOOTERIMAGE');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('SCIENCE', 'PHILO', 'UNIVERS', 'REGION');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'USER';

-- DropForeignKey
ALTER TABLE "ClassUnit" DROP CONSTRAINT "ClassUnit_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassUnit" DROP CONSTRAINT "ClassUnit_unitId_fkey";

-- AlterTable
ALTER TABLE "Class" DROP CONSTRAINT "Class_pkey",
ADD COLUMN     "bio" TEXT NOT NULL,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "intro" TEXT NOT NULL,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quote" TEXT,
ADD COLUMN     "story" TEXT NOT NULL,
ADD COLUMN     "subtitle" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Class_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Class_id_seq";

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "color" TEXT,
ADD COLUMN     "quote" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "confirmationToken" TEXT,
ADD COLUMN     "confirmationTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "isSubscribed" BOOLEAN DEFAULT false,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- DropTable
DROP TABLE "ClassUnit";

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "color" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "PostType" NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostUnit" (
    "postId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,

    CONSTRAINT "PostUnit_pkey" PRIMARY KEY ("postId","unitId")
);

-- CreateTable
CREATE TABLE "PostClass" (
    "postId" INTEGER NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "PostClass_pkey" PRIMARY KEY ("postId","classId")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "type" "UploadType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "unitId" INTEGER,
    "classId" TEXT,
    "postId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UnitUploads" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ClassUploads" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UnitClasses" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PostUploads" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserUploads" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UnitUploads_AB_unique" ON "_UnitUploads"("A", "B");

-- CreateIndex
CREATE INDEX "_UnitUploads_B_index" ON "_UnitUploads"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassUploads_AB_unique" ON "_ClassUploads"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassUploads_B_index" ON "_ClassUploads"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UnitClasses_AB_unique" ON "_UnitClasses"("A", "B");

-- CreateIndex
CREATE INDEX "_UnitClasses_B_index" ON "_UnitClasses"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PostUploads_AB_unique" ON "_PostUploads"("A", "B");

-- CreateIndex
CREATE INDEX "_PostUploads_B_index" ON "_PostUploads"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserUploads_AB_unique" ON "_UserUploads"("A", "B");

-- CreateIndex
CREATE INDEX "_UserUploads_B_index" ON "_UserUploads"("B");

-- AddForeignKey
ALTER TABLE "PostUnit" ADD CONSTRAINT "PostUnit_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostUnit" ADD CONSTRAINT "PostUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostClass" ADD CONSTRAINT "PostClass_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostClass" ADD CONSTRAINT "PostClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UnitUploads" ADD CONSTRAINT "_UnitUploads_A_fkey" FOREIGN KEY ("A") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UnitUploads" ADD CONSTRAINT "_UnitUploads_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassUploads" ADD CONSTRAINT "_ClassUploads_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassUploads" ADD CONSTRAINT "_ClassUploads_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UnitClasses" ADD CONSTRAINT "_UnitClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UnitClasses" ADD CONSTRAINT "_UnitClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostUploads" ADD CONSTRAINT "_PostUploads_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostUploads" ADD CONSTRAINT "_PostUploads_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserUploads" ADD CONSTRAINT "_UserUploads_A_fkey" FOREIGN KEY ("A") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserUploads" ADD CONSTRAINT "_UserUploads_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
