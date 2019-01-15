

use `keepwork-dev`;

-- 项目评分存贮过程
delimiter //
create procedure p_project_rate(IN x_project_id bigint)
begin
    declare x_projects_avg_rate float;  -- 系统项目平均分
    declare x_project_avg_rate float;   -- 指定项目平均分
    declare x_project_rate_count int;   -- 项目评分(投票)人数
    declare x_project_rate float;       -- 项目评分
    declare x_project_rate_obj json;    -- 项目评分对象
    declare x_rate_threshold int;       -- 评分(投票)阈值
    set x_rate_threshold = 20;
    set x_project_id = NEW.id;
    select avg(rate) into x_projects_avg_rate from projectRates;
    select avg(rate), count(*) into x_project_avg_rate, x_project_rate_count from projectRates where projectId = x_project_id;
    set x_project_rate = x_project_rate_count / (x_project_rate_count + x_rate_threshold) * x_project_avg_rate + (x_rate_threshold / (x_rate_threshold + x_project_rate_count)) * x_projects_avg_rate;
    update projects set rate = x_project_rate, rateCount = x_project_rate_count where id = x_project_id;
end //
delimiter ;
drop procedure p_project_rate;

-- 评分记录增加触发器
delimiter //
create trigger t_project_rate_insert after insert on projectRates for each row
begin
	call p_project_rate(NEW.id);
end //
delimiter ;
drop trigger t_project_rate_insert;

-- 评分记录更新触发器
delimiter //
create trigger t_project_rate_update after update on projectRates for each row
begin
	call p_project_rate(NEW.id);
end //
delimiter ;
drop trigger t_project_rate_delete;

-- 评分记录删除触发器
delimiter //
create trigger t_project_rate_delete after delete on projectRates for each row
begin
	call p_project_rate(OLD.id);
end //
delimiter ;
drop trigger t_project_rate_delete;