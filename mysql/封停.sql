

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
    delete from projects where id = x_projectd;
	
    -- 备份项目收藏信息
    replace into illegalFavorites select * from favorites where id > 0 and (objectType = 5 and objectId = x_projectId);
    delete from favorites where id > 0 and (objectType = 5 and objectId = x_projectId);
end //
delimiter ;

-- 解封项目
delimiter //
create procedure p_disable_project(In x_projectId bigint) comment '解封项目' modifies sql data
begin
    -- 备份项目信息
    replace into projects select * from illegalProjects where id = x_projectId;
    delete from illegalProjects where id = x_projectd;
	
    -- 备份项目收藏信息
    replace into favorites select * from illegalFavorites where id > 0 and (objectType = 5 and objectId = x_projectId);
    delete from illegalFavorites where id > 0 and (objectType = 5 and objectId = x_projectId);
end //
delimiter ;

