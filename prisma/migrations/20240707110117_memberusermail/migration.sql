/*
  Warnings:

  - The primary key for the `Member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Member` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupId,userEmail]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_userId_fkey";

-- AlterTable
ALTER TABLE "Member" DROP CONSTRAINT "Member_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Member_groupId_userEmail_key" ON "Member"("groupId", "userEmail");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
