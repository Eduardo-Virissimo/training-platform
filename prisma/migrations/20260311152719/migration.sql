/*
  Warnings:

  - Added the required column `familyId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RefreshToken` ADD COLUMN `familyId` VARCHAR(36) NOT NULL,
    ADD COLUMN `fingerprint` VARCHAR(255) NULL,
    ADD COLUMN `isUsed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `blockedAt` DATETIME(3) NULL,
    ADD COLUMN `blockedReason` VARCHAR(500) NULL,
    ADD COLUMN `isBlocked` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `SecurityLog` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `detail` TEXT NULL,
    `ip` VARCHAR(45) NULL,
    `userAgent` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SecurityLog_userId_idx`(`userId`),
    INDEX `SecurityLog_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `RefreshToken_familyId_idx` ON `RefreshToken`(`familyId`);

-- AddForeignKey
ALTER TABLE `SecurityLog` ADD CONSTRAINT `SecurityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `RefreshToken` RENAME INDEX `RefreshToken_userId_fkey` TO `RefreshToken_userId_idx`;
