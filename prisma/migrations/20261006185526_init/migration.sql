-- CreateEnum
CREATE TYPE "Side" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('AVAILABLE', 'IN_PROCESS', 'PAUSED', 'ENGAGED');

-- CreateEnum
CREATE TYPE "IntroductionStatus" AS ENUM ('PROPOSED', 'CHECKING', 'MEETING', 'DECLINED', 'ENGAGED');

-- CreateEnum
CREATE TYPE "IntroductionEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'MEETING_ADDED', 'EMAIL_SENT');

-- CreateEnum
CREATE TYPE "FileKind" AS ENUM ('PHOTO', 'RESUME');

-- CreateTable
CREATE TABLE "Matchmaker" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "about" TEXT,
    "emailSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matchmaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailConnection" (
    "id" TEXT NOT NULL,
    "matchmakerId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "matchmakerId" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "city" TEXT,
    "community" TEXT,
    "occupation" TEXT,
    "heightCm" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "parentsInfo" TEXT,
    "about" TEXT,
    "lookingFor" TEXT,
    "status" "CandidateStatus" NOT NULL DEFAULT 'AVAILABLE',
    "profileVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateFile" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "kind" "FileKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateNote" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Introduction" (
    "id" TEXT NOT NULL,
    "matchmakerId" TEXT NOT NULL,
    "maleId" TEXT NOT NULL,
    "femaleId" TEXT NOT NULL,
    "status" "IntroductionStatus" NOT NULL DEFAULT 'PROPOSED',
    "proposedBy" TEXT,
    "note" TEXT,
    "engagedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Introduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "introductionId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntroductionEvent" (
    "id" TEXT NOT NULL,
    "introductionId" TEXT NOT NULL,
    "type" "IntroductionEventType" NOT NULL,
    "status" "IntroductionStatus",
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntroductionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "matchmakerId" TEXT NOT NULL,
    "candidateId" TEXT,
    "introductionId" TEXT,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "doneAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateInvite" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "otpHash" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Matchmaker_email_key" ON "Matchmaker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MailConnection_matchmakerId_key" ON "MailConnection"("matchmakerId");

-- CreateIndex
CREATE INDEX "Candidate_matchmakerId_side_status_idx" ON "Candidate"("matchmakerId", "side", "status");

-- CreateIndex
CREATE INDEX "Candidate_matchmakerId_lastName_firstName_idx" ON "Candidate"("matchmakerId", "lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateFile_storageKey_key" ON "CandidateFile"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateFile_candidateId_kind_key" ON "CandidateFile"("candidateId", "kind");

-- CreateIndex
CREATE INDEX "PrivateNote_candidateId_createdAt_idx" ON "PrivateNote"("candidateId", "createdAt");

-- CreateIndex
CREATE INDEX "Introduction_matchmakerId_status_updatedAt_idx" ON "Introduction"("matchmakerId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "Introduction_femaleId_idx" ON "Introduction"("femaleId");

-- CreateIndex
CREATE UNIQUE INDEX "Introduction_maleId_femaleId_key" ON "Introduction"("maleId", "femaleId");

-- CreateIndex
CREATE INDEX "Meeting_introductionId_date_idx" ON "Meeting"("introductionId", "date");

-- CreateIndex
CREATE INDEX "IntroductionEvent_introductionId_createdAt_idx" ON "IntroductionEvent"("introductionId", "createdAt");

-- CreateIndex
CREATE INDEX "Reminder_matchmakerId_doneAt_dueAt_idx" ON "Reminder"("matchmakerId", "doneAt", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateInvite_tokenHash_key" ON "CandidateInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "CandidateInvite_candidateId_idx" ON "CandidateInvite"("candidateId");

-- AddForeignKey
ALTER TABLE "MailConnection" ADD CONSTRAINT "MailConnection_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateFile" ADD CONSTRAINT "CandidateFile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateNote" ADD CONSTRAINT "PrivateNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Introduction" ADD CONSTRAINT "Introduction_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Introduction" ADD CONSTRAINT "Introduction_maleId_fkey" FOREIGN KEY ("maleId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Introduction" ADD CONSTRAINT "Introduction_femaleId_fkey" FOREIGN KEY ("femaleId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "Introduction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntroductionEvent" ADD CONSTRAINT "IntroductionEvent_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "Introduction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "Introduction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateInvite" ADD CONSTRAINT "CandidateInvite_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
