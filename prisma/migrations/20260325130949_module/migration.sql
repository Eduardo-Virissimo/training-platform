/*
  Warnings:

  - You are about to drop the `QuizTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackTraining` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `QuizTrack` DROP FOREIGN KEY `QuizTrack_quizId_fkey`;

-- DropForeignKey
ALTER TABLE `QuizTrack` DROP FOREIGN KEY `QuizTrack_trackId_fkey`;

-- DropForeignKey
ALTER TABLE `TrackTraining` DROP FOREIGN KEY `TrackTraining_trackId_fkey`;

-- DropForeignKey
ALTER TABLE `TrackTraining` DROP FOREIGN KEY `TrackTraining_trainingId_fkey`;

-- DropTable
DROP TABLE `QuizTrack`;

-- DropTable
DROP TABLE `TrackTraining`;

-- CreateTable
CREATE TABLE `Module` (
    `id` VARCHAR(36) NOT NULL,
    `trackId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Module_trackId_idx`(`trackId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModuleTraining` (
    `moduleId` VARCHAR(36) NOT NULL,
    `trainingId` VARCHAR(36) NOT NULL,
    `position` INTEGER NOT NULL,

    PRIMARY KEY (`moduleId`, `trainingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModuleQuiz` (
    `moduleId` VARCHAR(36) NOT NULL,
    `quizId` VARCHAR(36) NOT NULL,
    `position` INTEGER NOT NULL,

    PRIMARY KEY (`moduleId`, `quizId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Module` ADD CONSTRAINT `Module_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleTraining` ADD CONSTRAINT `ModuleTraining_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleTraining` ADD CONSTRAINT `ModuleTraining_trainingId_fkey` FOREIGN KEY (`trainingId`) REFERENCES `Training`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleQuiz` ADD CONSTRAINT `ModuleQuiz_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModuleQuiz` ADD CONSTRAINT `ModuleQuiz_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
