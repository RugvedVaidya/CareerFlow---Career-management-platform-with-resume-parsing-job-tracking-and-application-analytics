/*
  Warnings:

  - Added the required column `updatedAt` to the `InterviewRound` table without a default value. This is not possible if the table is not empty.
  - Made the column `result` on table `InterviewRound` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_userId_fkey";

-- AlterTable
ALTER TABLE "InterviewRound" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "result" SET NOT NULL,
ALTER COLUMN "result" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "appliedFrom" TEXT;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
