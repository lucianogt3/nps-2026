/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'VIEWER';

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");
