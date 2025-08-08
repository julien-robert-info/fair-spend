/*
 Warnings:
 
 - You are about to drop the column `debtorId` on the `Debt` table. All the data in the column will be lost.
 - You are about to drop the column `payerId` on the `Expense` table. All the data in the column will be lost.
 - You are about to drop the column `receiverId` on the `Transfer` table. All the data in the column will be lost.
 - You are about to drop the column `senderId` on the `Transfer` table. All the data in the column will be lost.
 - Added the required column `debtorEmail` to the `Debt` table without a default value. This is not possible if the table is not empty.
 - Added the required column `groupId` to the `Debt` table without a default value. This is not possible if the table is not empty.
 - Added the required column `payerEmail` to the `Expense` table without a default value. This is not possible if the table is not empty.
 - Added the required column `receiverEmail` to the `Transfer` table without a default value. This is not possible if the table is not empty.
 - Added the required column `senderEmail` to the `Transfer` table without a default value. This is not possible if the table is not empty.
 
 */
-- DropForeignKey
ALTER TABLE "Debt" DROP CONSTRAINT "Debt_debtorId_fkey";
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_groupId_fkey";
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_payerId_fkey";
-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_groupId_fkey";
-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_receiverId_fkey";
-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_senderId_fkey";
-- AlterTable
ALTER TABLE "Debt"
ADD COLUMN "debtorEmail" TEXT,
  ADD COLUMN "groupId" INTEGER;
-- Update Debt table with data from Member table
UPDATE "Debt" d
SET "debtorEmail" = u."email",
  "groupId" = e."groupId"
FROM "User" u,
  "Expense" e
WHERE d."debtorId" = u."id"
  AND d."expenseId" = e."id";
-- AlterTable
ALTER TABLE "Debt" DROP COLUMN "debtorId",
  ALTER COLUMN "debtorEmail"
SET NOT NULL,
  ALTER COLUMN "groupId"
SET NOT NULL;
-- AlterTable
ALTER TABLE "Expense"
ADD COLUMN "payerEmail" TEXT;
-- Update Expense table with data from Member table
UPDATE "Expense" e
SET "payerEmail" = u."email"
FROM "User" u
WHERE e."payerId" = u."id";
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "payerId",
  ALTER COLUMN "payerEmail"
SET NOT NULL;
-- AlterTable
ALTER TABLE "Transfer"
ADD COLUMN "receiverEmail" TEXT,
  ADD COLUMN "senderEmail" TEXT;
-- Update Transfer table with data from Member table
UPDATE "Transfer" t
SET "receiverEmail" = u."email",
  "senderEmail" = u2."email"
FROM "User" u,
  "User" u2
WHERE t."receiverId" = u."id"
  AND t."senderId" = u2."id";
-- AlterTable
ALTER TABLE "Transfer" DROP COLUMN "receiverId",
  DROP COLUMN "senderId",
  ALTER COLUMN "receiverEmail"
SET NOT NULL,
  ALTER COLUMN "senderEmail"
SET NOT NULL;
-- AddForeignKey
ALTER TABLE "Expense"
ADD CONSTRAINT "Expense_groupId_payerEmail_fkey" FOREIGN KEY ("groupId", "payerEmail") REFERENCES "Member"("groupId", "userEmail") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Debt"
ADD CONSTRAINT "Debt_groupId_debtorEmail_fkey" FOREIGN KEY ("groupId", "debtorEmail") REFERENCES "Member"("groupId", "userEmail") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Transfer"
ADD CONSTRAINT "Transfer_groupId_senderEmail_fkey" FOREIGN KEY ("groupId", "senderEmail") REFERENCES "Member"("groupId", "userEmail") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Transfer"
ADD CONSTRAINT "Transfer_groupId_receiverEmail_fkey" FOREIGN KEY ("groupId", "receiverEmail") REFERENCES "Member"("groupId", "userEmail") ON DELETE RESTRICT ON UPDATE CASCADE;