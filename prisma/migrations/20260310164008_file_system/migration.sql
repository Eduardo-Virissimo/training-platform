/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[avatarFileId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `File` ADD COLUMN `key` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatarFileId` VARCHAR(36) NULL;

-- CreateTable
CREATE TABLE `FileUsage` (
    `id` VARCHAR(36) NOT NULL,
    `fileId` VARCHAR(36) NOT NULL,
    `usageType` ENUM('TRAINING', 'TRACK', 'QUIZ', 'AVATAR') NOT NULL,
    `usageId` VARCHAR(36) NOT NULL,

    UNIQUE INDEX `FileUsage_fileId_key`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `File_key_key` ON `File`(`key`);

-- CreateIndex
CREATE UNIQUE INDEX `User_avatarFileId_key` ON `User`(`avatarFileId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_avatarFileId_fkey` FOREIGN KEY (`avatarFileId`) REFERENCES `FileUsage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileUsage` ADD CONSTRAINT `FileUsage_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
