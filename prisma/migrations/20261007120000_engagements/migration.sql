-- AlterEnum
ALTER TYPE "CandidateStatus" ADD VALUE 'MARRIED';

-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL,
    "matchmakerId" TEXT NOT NULL,
    "maleId" TEXT,
    "femaleId" TEXT,
    "partnerName" TEXT,
    "introductionId" TEXT,
    "byMatchmaker" BOOLEAN NOT NULL DEFAULT false,
    "madeBy" TEXT,
    "engagedAt" TIMESTAMP(3) NOT NULL,
    "weddingDate" TIMESTAMP(3),
    "weddingVenue" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_maleId_key" ON "Engagement"("maleId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_femaleId_key" ON "Engagement"("femaleId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_introductionId_key" ON "Engagement"("introductionId");

-- CreateIndex
CREATE INDEX "Engagement_matchmakerId_engagedAt_idx" ON "Engagement"("matchmakerId", "engagedAt");

-- CreateIndex
CREATE INDEX "Engagement_matchmakerId_weddingDate_idx" ON "Engagement"("matchmakerId", "weddingDate");

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_maleId_fkey" FOREIGN KEY ("maleId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_femaleId_fkey" FOREIGN KEY ("femaleId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "Introduction"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Moves couples engaged through an introduction into the new table
INSERT INTO "Engagement" ("id", "matchmakerId", "maleId", "femaleId", "introductionId", "byMatchmaker", "engagedAt", "updatedAt")
SELECT 'e' || substr(md5("id"), 1, 24), "matchmakerId", "maleId", "femaleId", "id", true, COALESCE("engagedAt", "updatedAt"), CURRENT_TIMESTAMP
FROM "Introduction"
WHERE "status" = 'ENGAGED';

-- AlterTable
ALTER TABLE "Introduction" DROP COLUMN "engagedAt";
