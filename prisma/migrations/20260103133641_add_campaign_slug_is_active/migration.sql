/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,slug]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Campaign_tenantId_idx" ON "Campaign"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_tenantId_slug_key" ON "Campaign"("tenantId", "slug");
