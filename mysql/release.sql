
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
