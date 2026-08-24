CREATE TABLE `student_access_grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`viewerUserId` int NOT NULL,
	`viewerRole` enum('parent','teacher') NOT NULL,
	`status` enum('pending','active','revoked') NOT NULL DEFAULT 'pending',
	`inviteCode` varchar(16) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`revokedAt` timestamp,
	CONSTRAINT `student_access_grants_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_access_grants_inviteCode_unique` UNIQUE(`inviteCode`),
	CONSTRAINT `student_access_grant_relationship_unique` UNIQUE(`studentId`,`viewerUserId`,`viewerRole`)
);
--> statement-breakpoint
CREATE TABLE `student_daily_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`practicedOn` date NOT NULL,
	`practiceKey` varchar(120) NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_daily_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_daily_record_unique` UNIQUE(`studentId`,`practicedOn`,`practiceKey`)
);
--> statement-breakpoint
CREATE TABLE `student_pinned_practices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`practiceKey` varchar(120) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_pinned_practices_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_pinned_practice_unique` UNIQUE(`studentId`,`practiceKey`)
);
--> statement-breakpoint
CREATE TABLE `student_practice_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`practiceKey` varchar(120) NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`bestScore` int NOT NULL DEFAULT 0,
	`perfectRun` boolean NOT NULL DEFAULT false,
	CONSTRAINT `student_practice_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_practice_progress_unique` UNIQUE(`studentId`,`practiceKey`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(80),
	`timezone` varchar(64) NOT NULL DEFAULT 'Asia/Hong_Kong',
	`dailyTarget` int NOT NULL DEFAULT 3,
	`migrationVersion` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `student_review_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`practiceKey` varchar(120) NOT NULL,
	`grade` varchar(8) NOT NULL,
	`title` varchar(160) NOT NULL,
	`href` varchar(255) NOT NULL,
	`misses` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_review_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_review_record_unique` UNIQUE(`studentId`,`practiceKey`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `student_access_grants` ADD CONSTRAINT `student_access_grants_studentId_student_profiles_id_fk` FOREIGN KEY (`studentId`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_access_grants` ADD CONSTRAINT `student_access_grants_viewerUserId_users_id_fk` FOREIGN KEY (`viewerUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_daily_records` ADD CONSTRAINT `student_daily_records_studentId_student_profiles_id_fk` FOREIGN KEY (`studentId`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_pinned_practices` ADD CONSTRAINT `student_pinned_practices_studentId_student_profiles_id_fk` FOREIGN KEY (`studentId`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_practice_progress` ADD CONSTRAINT `student_practice_progress_studentId_student_profiles_id_fk` FOREIGN KEY (`studentId`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_review_records` ADD CONSTRAINT `student_review_records_studentId_student_profiles_id_fk` FOREIGN KEY (`studentId`) REFERENCES `student_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `student_access_grants_student_idx` ON `student_access_grants` (`studentId`,`status`);--> statement-breakpoint
CREATE INDEX `student_access_grants_viewer_idx` ON `student_access_grants` (`viewerUserId`,`status`);--> statement-breakpoint
CREATE INDEX `student_daily_records_student_date_idx` ON `student_daily_records` (`studentId`,`practicedOn`);--> statement-breakpoint
CREATE INDEX `student_pinned_practices_student_position_idx` ON `student_pinned_practices` (`studentId`,`position`);--> statement-breakpoint
CREATE INDEX `student_practice_progress_student_idx` ON `student_practice_progress` (`studentId`);--> statement-breakpoint
CREATE INDEX `student_review_records_student_idx` ON `student_review_records` (`studentId`);