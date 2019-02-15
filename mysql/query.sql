


use `keepwork-dev`;
use `keepwork-rls`;

select * from userinfos;
select * from projects;

select @@global.sql_mode;
--  games.no as gameNo, userinfos.name as `name`, 
select games.name, count(gameWorks.userId) as count from games, users, gameWorks, userinfos where gameWorks.userId = users.id and gameWorks.gameId = games.id and gameWorks.userId = userinfos.userId group by gameWorks.userId;
select id, date_format(createdAt, '%Y-%m-%d') from users ;

update projects set rate = 0 where id > 0 and rateCount < 8;

use `lesson-rls`;

select * from teachers;

set @@global.sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';