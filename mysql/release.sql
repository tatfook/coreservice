
-- fix 分组选择问题
set @@global.sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';


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
