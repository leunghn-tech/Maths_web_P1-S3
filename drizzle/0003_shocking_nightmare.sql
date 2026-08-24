ALTER TABLE `users` ADD `localUsername` varchar(48);--> statement-breakpoint
ALTER TABLE `users` ADD `localUsername` varchar(48);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_localUsername_unique` UNIQUE(`localUsername`);
