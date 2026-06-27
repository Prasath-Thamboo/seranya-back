-- CreateTable
CREATE TABLE "Definition" (
    "id" SERIAL NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "category" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Definition_pkey" PRIMARY KEY ("id")
);
