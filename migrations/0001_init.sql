-- CreateTable
CREATE TABLE "Matchmaker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "about" TEXT,
    "emailSignature" TEXT,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MailConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchmakerId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MailConnection_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchmakerId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" DATETIME,
    "city" TEXT,
    "community" TEXT,
    "occupation" TEXT,
    "heightCm" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "parentsInfo" TEXT,
    "about" TEXT,
    "lookingFor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "profileVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Candidate_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidateFile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrivateNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrivateNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Introduction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchmakerId" TEXT NOT NULL,
    "maleId" TEXT NOT NULL,
    "femaleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "proposedBy" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Introduction_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Introduction_maleId_fkey" FOREIGN KEY ("maleId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Introduction_femaleId_fkey" FOREIGN KEY ("femaleId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchmakerId" TEXT NOT NULL,
    "maleId" TEXT,
    "femaleId" TEXT,
    "partnerName" TEXT,
    "introductionId" TEXT,
    "byMatchmaker" BOOLEAN NOT NULL DEFAULT false,
    "madeBy" TEXT,
    "engagedAt" DATETIME NOT NULL,
    "weddingDate" DATETIME,
    "weddingVenue" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Engagement_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Engagement_maleId_fkey" FOREIGN KEY ("maleId") REFERENCES "Candidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Engagement_femaleId_fkey" FOREIGN KEY ("femaleId") REFERENCES "Candidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Engagement_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "Introduction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "introductionId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Meeting_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "Introduction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntroductionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "introductionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntroductionEvent_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "Introduction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchmakerId" TEXT NOT NULL,
    "candidateId" TEXT,
    "introductionId" TEXT,
    "title" TEXT NOT NULL,
    "dueAt" DATETIME NOT NULL,
    "doneAt" DATETIME,
    "notifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reminder_matchmakerId_fkey" FOREIGN KEY ("matchmakerId") REFERENCES "Matchmaker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reminder_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reminder_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "Introduction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "otpHash" TEXT,
    "otpExpiresAt" DATETIME,
    "otpAttempts" INTEGER NOT NULL DEFAULT 0,
    "otpSends" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidateInvite_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "windowStart" DATETIME NOT NULL,
    "count" INTEGER NOT NULL
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
CREATE UNIQUE INDEX "Engagement_maleId_key" ON "Engagement"("maleId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_femaleId_key" ON "Engagement"("femaleId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_introductionId_key" ON "Engagement"("introductionId");

-- CreateIndex
CREATE INDEX "Engagement_matchmakerId_engagedAt_idx" ON "Engagement"("matchmakerId", "engagedAt");

-- CreateIndex
CREATE INDEX "Engagement_matchmakerId_weddingDate_idx" ON "Engagement"("matchmakerId", "weddingDate");

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

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");
