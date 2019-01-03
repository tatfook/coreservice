use `keepwork-dev`;

delimiter //
create procedure in_params()
begin
declare userId bigint;
declare user varchar(48);
declare usercursor cursor for select `username` as user from users;
open usercursor;
fetch usercursor into user;
select user;
close usercursor;
end 
//
delimiter ;
drop procedure if exists in_params;
call in_params();


delimiter //
create trigger trigger_project after insert on projects for each row
begin 
update userRanks set project=project+1 where userId = NEW.userId;
end
//
delimiter ;
drop trigger trigger_project;
select * from users;
select * from userRanks where userId = 300;

insert into projects(userId, name, createdAt, updatedAt) values(300, "trigger", current_time(), current_time());

desc projects;
desc users;
select * from mysql.proc where `type` = 'FUNCTION' ;


delimiter //
create procedure p_test() modifies sql data
begin

end //
delimiter ;

show variables like '%event_scheduler%'; 
SET GLOBAL event_scheduler = ON; 
show processlist;

create event if not exists e_delele_logs on schedule every 3 day on completion preserve enable comment "日志清除" do delete from `keepwork-dev`.logs where id > 0 and createdAt < date_sub(curdate(), interval 3 day);
drop event e_delete_logs;

show events;
show procedure status;
show triggers;


use `keepwork-dev`;
delimiter //
create trigger t_logs_delete_after after delete on `keepwork-dev`.logs for each row 
begin 
	replace into `keepwork-dev`.caches(`key`, value, createdAt, updatedAt) values("trigger", json_array(OLD.id), current_time(), current_time());
end //
delimiter ;
drop trigger t_logs_delete_after;
select * from `keepwork-dev`.logs;
select * from `keepwork-dev`.caches;
delete from `keepwork-dev`.logs where id in (758,759);


use `keepwork-dev`;
select * from events;
show procedure status;
-- --------------------------------------------procedure-----------------------------------------------
-- ES用户更新 事件100
delimiter //
create procedure p_es_user_attr_update(IN x_data JSON) comment 'ES用户更新业务实现' modifies sql data
begin
	insert into `events`(eventId, value, createdAt, updatedAt) values(100, x_data, current_time(), current_time());
end //
delimiter ;
-- 删除procedure
drop procedure p_es_user_attr_update;
call p_es_user_attr_update(json_object("userId",300));

-- ES用户删除 事件101
delimiter //
create procedure p_es_user_delete(IN x_data JSON) comment 'ES用户更新业务实现' modifies sql data
begin
	insert into `events`(eventId, value, createdAt, updatedAt) values(101, x_data, current_time(), current_time());
end //
delimiter ;
-- 删除procedure
drop procedure p_es_user_delete;

-- ES项目更新 事件200
delimiter //
create procedure p_es_project_attr_update(IN x_data JSON) comment 'ES项目更新事件添加' modifies sql data
begin
	insert into `events`(eventId, value, createdAt, updatedAt) values(200, x_data, current_time(), current_time());
end //
delimiter ;
drop procedure p_es_project_attr_update;

-- ES项目更新 事件200
delimiter //
create procedure p_es_project_delete(IN x_data JSON) comment 'ES项目更新事件添加' modifies sql data
begin
	insert into `events`(eventId, value, createdAt, updatedAt) values(201, x_data, current_time(), current_time());
end //
delimiter ;
drop procedure p_es_project_delete;


-- 用户创建触发器
-- 添加ES用户更新事件100
delimiter //
create trigger t_user_insert_after after insert on users for each row
begin
	call p_es_user_attr_update(json_object("userId", NEW.id));
end //
delimiter ;
drop trigger t_user_insert_after;
select * from users;
insert into users(username, password, createdAt, updatedAt) values("wxatest", md5("wuxiangan"), current_time(), current_time());

-- 用户更新触发器
-- 添加ES用户更新事件100
delimiter //
create trigger t_user_update_after after update on users for each row
begin
	call p_es_user_attr_update(json_object("userId", NEW.id));
end //
delimiter ;
drop trigger t_user_update_after;
update users set sex = "男" where id = 326;

-- 用户删除触发器
-- 添加ES用户删除事件101
delimiter //
create trigger t_user_delete_after after delete on users for each row
begin
	call p_es_user_delete(json_object("userId", OLD.id));
end //
delimiter ;
drop trigger t_user_delete_after;
delete from users where id = 326;


-- 项目创建触发器
-- 1. 添加ES用户更新事件100  2. 添加ES项目更新事件200
delimiter //
create trigger t_project_insert_after after insert on projects for each row
begin
	call p_es_user_attr_update(json_object("userId", NEW.userId));
	call p_es_project_attr_update(json_object("projectId", NEW.id));
end //
delimiter ;
drop trigger t_project_insert_after;
select * from projects;
insert into projects(userId, name, createdAt, updatedAt) values(300, "mysql test", current_time(), current_time());
select * from events;

-- 项目更新触发器
-- 1. 添加ES项目更新事件200
delimiter //
create trigger t_project_update_after after update on projects for each row
begin
	call p_es_project_attr_update(json_object("projectId", NEW.id));
end //
delimiter ;
drop trigger t_project_update_after;
select * from projects where userId = 300;
update projects set description = "hello mysql" where id = 347;
select * from events;

-- 项目更新触发器
-- 1. 添加ES项目更新事件200
delimiter //
create trigger t_project_delete_after after delete on projects for each row
begin
	call p_es_user_attr_update(json_object("userId", OLD.userId));
	call p_es_project_delete(json_object("projectId", OLD.id));
end //
delimiter ;
drop trigger t_project_delete;
delete from projects where id = 347;


-- 封停用户
-- 将用户数据备份至非法数据表并删除用户数据
delimiter //
create procedure p_disable_user(IN x_userId bigint) comment '禁用用户' modifies sql data 
begin
	-- 备份用户信息
	replace into illegalUsers select * from users where id = x_userId;
    delete from users where id = x_userId;
    -- 备份用户项目信息
    replace into illegalProjects select * from projects where userId = x_userId;
    delete from projects where id > 0 and userId = x_userId;
    -- 备份用户网站信息
    replace into illegalSites select * from sites where userId = x_userId;
    delete from sites where id > 0 and userId = x_userId;
    -- 备份用户评论信息
    replace into illegalComments select * from comments where userId = x_userId;
    delete from comments where id > 0 and userId = x_userId;
    -- 备份用户收藏及粉丝, 及项目收藏者
    replace into illegalFavorites select * from favorites where userId = x_userId or (objectId = x_userId  and objectType = 0) or (objectType = 5 and objectId in (select id from projects where userId = x_userId));
    delete from favorites where id > 0 and (userId = x_userId or (objectId = x_userId  and objectType = 0) or (objectType = 5 and objectId in (select id from projects where userId = x_userId)));
end //
delimiter ;
drop procedure p_disable_user;
select * from illegalUsers;
select * from illegalProjects;
select * from illegalComments;
select * from illegalFavorites;
call p_disable_user(137);

-- 解封用户
delimiter //
create procedure p_enable_user(IN x_userId bigint) comment '解封用户' modifies sql data 
begin
	-- 恢复用户信息
	replace into users select * from illegalUsers where id = x_userId;
    delete from illegalUsers where id = x_userId;
    -- 恢复用户项目信息
    replace into projects select * from illegalProjects where userId = x_userId;
    delete from illegalProjects where id > 0 and userId = x_userId;
    -- 恢复用户网站信息
    replace into sites select * from illegalSites where userId = x_userId;
    delete from illegalSites where id > 0 and userId = x_userId;
    -- 恢复用户评论信息
    replace into comments select * from illegalComments where userId = x_userId;
    delete from illegalComments where id > 0 and userId = x_userId;
    -- 恢复用户收藏及粉丝, 及项目收藏者
    replace into favorites select * from illegalFavorites where userId = x_userId or (objectId = x_userId  and objectType = 0) or (objectType = 5 and objectId in (select id from projects where userId = x_userId));
    delete from illegalFavorites where id > 0 and (userId = x_userId or (objectId = x_userId  and objectType = 0) or (objectType = 5 and objectId in (select id from projects where userId = x_userId)));
end //
delimiter ;
drop procedure p_enable_user;
call p_enable_user(137);

show procedure status;


use `keepwork-dev`;
delimiter //
create procedure p_test() modifies sql data
begin
	declare x_i int default 0;
    declare x_latitude, x_longitude float(10,6);
    while x_i < 100 do
		set x_latitude = rand();
        set x_longitude = rand();
		set x_i = x_i + 1;
        -- select x_i, x_longitude, x_latitude;
        replace into locations(userId, longitude, latitude, createdAt, updatedAt) values(x_i, x_longitude, x_latitude, current_time(), current_time());
    end while;
end //
delimiter ;
drop procedure p_test;
show procedure status;
call p_test();
delete from locations where id > 0;
select * from locations;