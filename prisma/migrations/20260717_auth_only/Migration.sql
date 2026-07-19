-- Auth-only idempotent migration
-- Safe to run against the live Hostinger schema without touching business tables.

CREATE TABLE IF NOT EXISTS `AuthToken` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `customerId` VARCHAR(191) NULL,
  `email` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `AuthToken_email_type_idx` (`email`, `type`),
  INDEX `AuthToken_tokenHash_idx` (`tokenHash`),
  INDEX `AuthToken_expiresAt_idx` (`expiresAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AuthThrottle` (
  `id` VARCHAR(191) NOT NULL,
  `scope` VARCHAR(191) NOT NULL,
  `identifier` VARCHAR(191) NOT NULL,
  `count` INTEGER NOT NULL DEFAULT 0,
  `resetAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `AuthThrottle_scope_identifier_key` (`scope`, `identifier`),
  INDEX `AuthThrottle_scope_resetAt_idx` (`scope`, `resetAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `User`
  ADD COLUMN IF NOT EXISTS `emailVerified` BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE `Customer`
  ADD COLUMN IF NOT EXISTS `customerNumber` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `passwordHash` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `emailVerified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS `otpCodeHash` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `otpExpiresAt` DATETIME(3) NULL,
  ADD COLUMN IF NOT EXISTS `otpAttempts` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `loginAttempts` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `lastLoginAttempt` DATETIME(3) NULL,
  ADD COLUMN IF NOT EXISTS `lastPasswordChange` DATETIME(3) NULL,
  ADD COLUMN IF NOT EXISTS `country` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `address` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `gstNumber` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `profilePicture` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `lastLogin` DATETIME(3) NULL;

SET @customer_idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'Customer'
    AND index_name = 'Customer_customerNumber_key'
);
SET @customer_idx_sql := IF(
  @customer_idx_exists = 0,
  'CREATE UNIQUE INDEX `Customer_customerNumber_key` ON `Customer` (`customerNumber`)',
  'SELECT 1'
);
PREPARE stmt FROM @customer_idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @auth_user_fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'AuthToken'
    AND constraint_name = 'AuthToken_userId_fkey'
);
SET @auth_user_fk_sql := IF(
  @auth_user_fk_exists = 0,
  'ALTER TABLE `AuthToken` ADD CONSTRAINT `AuthToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @auth_user_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @auth_customer_fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'AuthToken'
    AND constraint_name = 'AuthToken_customerId_fkey'
);
SET @auth_customer_fk_sql := IF(
  @auth_customer_fk_exists = 0,
  'ALTER TABLE `AuthToken` ADD CONSTRAINT `AuthToken_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @auth_customer_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
