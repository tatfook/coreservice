select count(*) from logs;
select * from logs;
show procedure status;
select * from users where id = 137;
select * from illegals;
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


-- 封停项目
delimiter //
create procedure p_disable_project(In x_projectId bigint) comment '封停项目' modifies sql data
begin
    -- 备份项目信息
    replace into illegalProjects select * from projects where id = x_projectId;
    delete from projects where id = x_projectId;
	
    -- 备份项目收藏信息
    replace into illegalFavorites select * from favorites where id > 0 and (objectType = 5 and objectId = x_projectId);
    delete from favorites where id > 0 and (objectType = 5 and objectId = x_projectId);
end //
delimiter ;
drop procedure p_disable_project;
select * from projects where userId = 137;
call p_disable_project(318);
select * from illegalProjects;

-- 解封项目
delimiter //
create procedure p_enable_project(In x_projectId bigint) comment '解封项目' modifies sql data
begin
    -- 备份项目信息
    replace into projects select * from illegalProjects where id = x_projectId;
    delete from illegalProjects where id = x_projectId;
	
    -- 备份项目收藏信息
    replace into favorites select * from illegalFavorites where id > 0 and (objectType = 5 and objectId = x_projectId);
    delete from illegalFavorites where id > 0 and (objectType = 5 and objectId = x_projectId);
end //
delimiter ;
drop procedure p_enable_project;
call p_enable_project(318);
select * from illegalProjects;


-- 封停网站
delimiter //
create procedure p_disable_site(In x_siteId bigint) comment '封停网站' modifies sql data
begin
    -- 备份项目信息
    replace into illegalSites select * from sites where id = x_siteId;
    delete from sites where id = x_siteId;
end //
delimiter ;
drop procedure p_disable_site;
select * from sites where userId = 137;
call p_disable_site(714);
select * from illegalSites;

-- 解封网站
delimiter //
create procedure p_enable_site(In x_siteId bigint) comment '解封网站' modifies sql data
begin
    -- 备份项目信息
    replace into sites select * from illegalSites where id = x_siteId;
    delete from illegalSites where id = x_siteId;
end //
delimiter ;
drop procedure p_enable_site;
call p_enable_site(714);
select * from illegalSites;

