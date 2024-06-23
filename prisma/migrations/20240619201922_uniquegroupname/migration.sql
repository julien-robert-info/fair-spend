/*
  Warnings:

  - A unique constraint covering the columns `[name,ownerId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Group_name_ownerId_key" ON "Group"("name", "ownerId");
