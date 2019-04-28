
use `keepwork-dev`;
use `keepwork-rls`;
use `lesson-dev`;
use `lesson-rls`;


alter table lessonOrganizationClasses add column begin datetime;
alter table lessonOrganizationClasses add column end datetime;
update lessonOrganizationClasses set begin = "2019-01-01" where id > 0;
update lessonOrganizationClasses set end = "2020-01-01" where id > 0;

CREATE TABLE `lessonOrganizationActivateCodes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `organizationId` bigint(20) DEFAULT '0',
  `classId` bigint(20) DEFAULT '0',
  `key` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `state` int(11) DEFAULT '0',
  `activateUserId` bigint(20) DEFAULT '0',
  `activateTime` datetime DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `realname` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=267 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `sender` bigint(20) DEFAULT NULL,
  `type` int(11) DEFAULT '0',
  `all` int(11) DEFAULT '0',
  `msg` json DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE `userMessages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) DEFAULT NULL,
  `messageId` bigint(20) DEFAULT NULL,
  `state` int(11) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `messageId` (`messageId`),
  CONSTRAINT `userMessages_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `userMessages_ibfk_2` FOREIGN KEY (`messageId`) REFERENCES `messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------
select * from `keepwork-rls`.users where username = "dsl4";

alter table lessonOrganizations add column location varchar(256) default "";
alter table lessonOrganizations add column visibility int default 0;
drop table tags;
CREATE TABLE `tags` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) DEFAULT NULL,
  `tagId` varchar(24) COLLATE utf8mb4_bin NOT NULL,
  `objectType` int(11) NOT NULL,
  `objectId` bigint(20) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_tag_id_object_id_object_type` (`tagId`,`objectId`,`objectType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- -------------------------------------------------------------------------
alter table lessonOrganizations add column email varchar(256);
desc lessonOrganizations;
alter table classrooms add column classId bigint default 0;
alter table classrooms add column organizationId bigint default 0;
alter table learnRecords add column classId bigint default 0;

CREATE TABLE `lessonOrganizationClasses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `organizationId` bigint(20) DEFAULT '0',
  `name` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lesson_organization_classes_organization_id_name` (`organizationId`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE `lessonOrganizationClassMembers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `organizationId` bigint(20) DEFAULT '0',
  `classId` bigint(20) DEFAULT '0',
  `memberId` bigint(20) DEFAULT '0',
  `realname` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `roleId` int(11) DEFAULT '0',
  `privilege` int(11) DEFAULT '0',
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `organizationId-classId-memberId` (`organizationId`,`classId`,`memberId`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE `lessonOrganizationPackages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `organizationId` bigint(20) DEFAULT '0',
  `classId` bigint(20) DEFAULT '0',
  `packageId` bigint(20) DEFAULT '0',
  `lessons` json DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lesson_organization_packages_organization_id_class_id_package_id` (`organizationId`,`classId`,`packageId`)
) ENGINE=InnoDB AUTO_INCREMENT=178 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE `lessonOrganizations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_bin DEFAULT '',
  `logo` longtext COLLATE utf8mb4_bin,
  `cellphone` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `loginUrl` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `userId` bigint(20) DEFAULT '0',
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `state` int(11) DEFAULT NULL,
  `count` int(11) DEFAULT '0',
  `privilege` int(11) DEFAULT '0',
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `eamil` varchar(256) COLLATE utf8mb4_bin DEFAULT NULL,
  `email` varchar(256) COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `loginUrl` (`loginUrl`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE `paracraftVisitors` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `realname` varchar(64) COLLATE utf8mb4_bin DEFAULT '',
  `cellphone` varchar(24) COLLATE utf8mb4_bin DEFAULT '',
  `email` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `organization` varchar(255) COLLATE utf8mb4_bin DEFAULT '',
  `description` varchar(255) COLLATE utf8mb4_bin DEFAULT '',
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cellphone` (`cellphone`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- -------------------------------------------------------------------------------


use `keepwork`;

-- fix 分组选择问题
set @@global.sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
CREATE TABLE `games` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` int(11) DEFAULT '0',
  `name` varchar(48) COLLATE utf8mb4_bin DEFAULT NULL,
  `no` int(11) DEFAULT NULL,
  `startDate` varchar(24) COLLATE utf8mb4_bin DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `state` int(11) DEFAULT '0',
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `gameWorks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL,
  `gameId` bigint(20) NOT NULL,
  `projectId` bigint(20) NOT NULL,
  `worksName` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `worksSubject` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `worksLogo` varchar(512) COLLATE utf8mb4_bin DEFAULT NULL,
  `worksDescription` varchar(2048) COLLATE utf8mb4_bin DEFAULT NULL,
  `worksRate` int(11) DEFAULT NULL,
  `worksRateCount` int(11) DEFAULT NULL,
  `reward` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_works_project_id` (`projectId`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `userinfos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL,
  `name` varchar(48) COLLATE utf8mb4_bin DEFAULT NULL,
  `qq` varchar(24) COLLATE utf8mb4_bin DEFAULT NULL,
  `birthdate` datetime DEFAULT NULL,
  `school` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

select userId from projects where id = 712;
insert into games(`name`, `no`, startDate, endDate, createdAt, updatedAt) values("NPL大赛", 1, "2018-12-01", "2018-12-31", current_time(), current_time());
insert into gameWorks(userId, gameId, projectId, createdAt, updatedAt) values
(1234, 1, 709, current_time(), current_time()),
(88, 1, 821, current_time(), current_time()),
(180, 1, 840, current_time(), current_time()),
(35571, 1, 779, current_time(), current_time()),
(15653, 1, 717, current_time(), current_time()),
(7054, 1, 736, current_time(), current_time()),
(1, 1, 677, current_time(), current_time()),
(20322, 1, 712, current_time(), current_time());
-- -------------------------------------------------------------------------------
use `keepwork-dev`;
use `keepwork-rls`;

alter table illegalProjects add column rate float default 0;    -- 评分值
alter table illegalProjects add column rateCount int default 0; -- 评分数量
alter table illegalProjects add column classifyTags varchar(255) default "|";
alter table projects add column rate float default 0;    -- 评分值
alter table projects add column rateCount int default 0; -- 评分数量
alter table projects add column classifyTags varchar(255) default "|";

CREATE TABLE `projectRates` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) DEFAULT '0',
  `projectId` bigint(20) DEFAULT '0',
  `rate` int(11) DEFAULT '0',
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_rates_user_id_project_id` (`userId`,`projectId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `systemTags` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `classify` int(11) DEFAULT NULL,
  `tagname` varchar(24) COLLATE utf8mb4_bin NOT NULL,
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_tags_classify_tagname` (`classify`,`tagname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


insert into projectRates(userId, projectId, rate, createdAt, updatedAt) values
(300, 1, 60, current_time(), current_time()),
(137, 1, 80, current_time(), current_time()),
(300, 2, 60, current_time(), current_time()),
(137, 2, 100, current_time(), current_time()),
(300, 3, 80, current_time(), current_time()),
(137, 3, 40, current_time(), current_time());

select avg(rate) from projectRates;



-- release
CREATE TABLE `paracraftDevices` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `deviceId` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '123456',
  `username` varchar(64) COLLATE utf8mb4_bin DEFAULT '',
  `cellphone` varchar(24) COLLATE utf8mb4_bin DEFAULT '',
  `price` int(11) DEFAULT '0',
  `purchaseTime` datetime DEFAULT NULL,
  `gameCoin` int(11) DEFAULT '0',
  `description` varchar(255) COLLATE utf8mb4_bin DEFAULT '',
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `deviceId` (`deviceId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `paracraftGameCoinKeys` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `price` int(11) DEFAULT '0',
  `active` int(11) DEFAULT '0',
  `activeTime` datetime DEFAULT NULL,
  `gameCoin` int(11) DEFAULT '0',
  `deviceId` varchar(255) COLLATE utf8mb4_bin DEFAULT '',
  `identity` int(11) DEFAULT '0',
  `purchase` int(11) DEFAULT '0',
  `purchaseName` varchar(255) COLLATE utf8mb4_bin DEFAULT '',
  `purchaseCellphone` varchar(24) COLLATE utf8mb4_bin DEFAULT '',
  `purchaseTime` datetime DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_bin DEFAULT '',
  `extra` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
