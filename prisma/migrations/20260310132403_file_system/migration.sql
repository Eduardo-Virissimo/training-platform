/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `File` ADD COLUMN `key` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` VARCHAR(36) NOT NULL;

-- CreateTable
CREATE TABLE `FileUsage` (
    `id` VARCHAR(36) NOT NULL,
    `fileId` VARCHAR(36) NOT NULL,
    `usageType` ENUM('TRAINING', 'TRACK', 'QUIZ', 'USER') NOT NULL,
    `usageId` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `FileUsage_fileId_key`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `File_key_key` ON `File`(`key`);

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileUsage` ADD CONSTRAINT `FileUsage_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
