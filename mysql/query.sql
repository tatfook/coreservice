


use `keepwork-dev`;
use `keepwork-rls`;

select * from userinfos;
select * from projects;

select @@global.sql_mode;
--  games.no as gameNo, userinfos.name as `name`, 
select games.name, games.no as gameNo, userinfos.name as `name`, count(gameWorks.userId) as worksCount, users.sex as sex, userinfos.birthdate as birthdate,
users.cellphone as cellphone, users.email as email, userinfos.qq as qq, userinfos.school as school 
from games, users, gameWorks, userinfos 
where gameWorks.userId = users.id and gameWorks.gameId = games.id and gameWorks.userId = userinfos.userId 
group by gameWorks.userId limit 10000 offset 0;

select id, date_format(createdAt, '%Y-%m-%d') from users ;

update projects set rate = 0 where id > 0 and rateCount < 8;

use `lesson-rls`;

select * from teachers;

set @@global.sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';


select * from projects where id = 213;
-- {"count":1,"rows":[{"id":213,"userId":30,"name":"华山论剑","siteId":null,"status":0,"visibility":0,"privilege":294,"type":1,"tags":"|","visit":6,"star":0,"favorite":0,"comment":0,"lastVisit":2,"lastStar":0,"lastComment":0,"stars":[],"hotNo":0,"choicenessNo":0,"description":"","rate":74.6667,"rateCount":10,"classifyTags":"paracraft专用|单人","extend":{"statistics":{"1552435200000":{"star":0,"visit":1,"comment":0},"1552521600000":{"star":0,"visit":0,"comment":0},"1552608000000":{"star":0,"visit":0,"comment":0},"1552694400000":{"star":0,"visit":0,"comment":0},"1552780800000":{"star":0,"visit":0,"comment":0},"1552867200000":{"star":0,"visit":1,"comment":0},"1552953600000":{"star":0,"visit":1,"comment":0}}},"extra":{"rate":{"3":2,"4":4,"5":4,"count":10},"imageUrl":"https://git.keepwork.com/gitlab_rls_eric/world_base32_4wgy5znrwhuk5oxfrgiq/raw/master/preview.jpg"},"createdAt":"2018-11-16T10:54:31.000Z","updatedAt":"2019-02-12T06:21:54.000Z"}]}