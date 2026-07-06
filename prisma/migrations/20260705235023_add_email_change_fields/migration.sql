-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingEmail" TEXT,
ADD COLUMN     "emailChangeToken" TEXT,
ADD COLUMN     "emailChangeTokenExpiry" TIMESTAMP(3);
