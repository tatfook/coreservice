


use `keepwork-dev`;
use `keepwork-rls`;

select * from projects;

select id, date_format(createdAt, '%Y-%m-%d') from users ;

update projects set rate = 0 where id > 0 and rateCount < 8;

use `lesson-rls`;

select * from teachers;