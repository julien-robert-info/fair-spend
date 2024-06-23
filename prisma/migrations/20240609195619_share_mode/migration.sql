/*
  Warnings:

  - Added the required column `shareMode` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShareMode" AS ENUM ('FAIR', 'EGALITARIAN');

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "shareMode" "ShareMode" NOT NULL;
