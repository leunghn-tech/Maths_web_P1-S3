ALTER TABLE `student_profiles` ADD `classCode` varchar(32);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `classCode` varchar(32);--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `syncRevision` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD `lastSyncedAt` timestamp;
