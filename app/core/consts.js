'use strict';

module.exports = {
    EVENT_ID_ES_USER_ATTR_UPDATE: 100, // ES用户属性更新
    EVENT_ID_ES_USER_DELETE: 101, // ES用户删除

    EVENT_ID_ES_PROJECT_ATTR_UPDATE: 200, // ES项目属性更新
    EVENT_ID_ES_PROJECT_DELETE: 201, // ES项目删除

    // LOG_TYPE
    LOG_TYPE_REQUEST_ELAPSED: 1, // 请求耗时统计日志
    LOG_TYPE_SYSTEM: 2, // 系统错误日志
    LOG_TYPE_FRAME: 3, // 框架错误日志
    LOG_TYPE_APPLICATION: 4, // 应用错误日志
    LOG_TYPE_DEFAULT: 100, // 默认类型

    // 用户访问权限
    USER_ACCESS_LEVEL_READ: 32, // 读权限
    USER_ACCESS_LEVEL_WRITE: 64, // 写权限
    USER_ACCESS_LEVEL_NONE: 128, // 无权限

    // 实体类型
    ENTITY_TYPE_USER: 0, // 用户类型
    ENTITY_TYPE_SITE: 1, // 站点类型
    ENTITY_TYPE_PAGE: 2, // 页面类型
    ENTITY_TYPE_GROUP: 3, // 组
    ENTITY_TYPE_ISSUE: 4, // 问题
    ENTITY_TYPE_PROJECT: 5, // 项目
    ENTITY_TYPE_ORGANIZATION: 6, // lesson 机构
    ENTITY_TYPE_ORGANIZATION_CLASS: 7, // 机构班级
    ENTITY_TYPE_PACKAGE: 8, // 课程包
    ENTITY_TYPE_LESSON: 9, // 课程

    // 对象可见性
    ENTITY_VISIBILITY_PUBLIC: 0, // 公开
    ENTITY_VISIBILITY_PRIVATE: 1, // 私有
    ENTITY_VISIBILITY_ONLY_OWN: 2, // 仅拥有者

    // 服务类型
    OAUTH_SERVICE_TYPE_QQ: 0, // QQ
    OAUTH_SERVICE_TYPE_WEIXIN: 1, // 微信
    OAUTH_SERVICE_TYPE_GITHUB: 2, // GITHUB
    OAUTH_SERVICE_TYPE_XINLANG: 3, // 新浪
    OAUTH_SERVICE_TYPE_QQ_HALL: 4, // QQ HALL

    USER_ROLE_DEFAULT: 0, // 普通用户
    USER_ROLE_STUDENT: 1, // 学生
    USER_ROLE_TEACHER: 2, // 讲师
    USER_ROLE_ALLIANCE_MEMBER: 8, // 联盟会员
    USER_ROLE_TUTOR: 16, // 导师
    // 角色
    // USER_ROLE_NORMAL:0,     // 普通
    // USER_ROLE_EXCEPTION:1,  // 异常
    // USER_ROLE_VIP:4,        // vip
    // USER_ROLE_MANAGER:64,   // 管理者
    // USER_ROLE_ADMIN:128,    // 超管

    // 通知状态
    NOTIFICATION_STATE_UNREAD: 0, // 未读
    NOTIFICATION_STATE_READ: 1, // 已读

    // 通知类型
    NOTIFICATION_TYPE_USER: 0, // 用户级别通知
    NOTIFICATION_TYPE_SITE: 1, // 站点级别通知
    NOTIFICATION_TYPE_PAGE: 2, // 页面级别通知

    // 审核状态
    QINIU_AUDIT_STATE_NO_AUDIT: 0, // 未审核
    QINIU_AUDIT_STATE_PASS: 1, // 审核通过
    QINIU_AUDIT_STATE_NOPASS: 2, // 审核未通过
    QINIU_AUDIT_STATE_FAILED: 3, // 审核失败

    // 申请状态
    APPLY_STATE_DEFAULT: 0, // 待处理状态
    APPLY_STATE_AGREE: 1, // 同意
    APPLY_STATE_REFUSE: 2, // 拒绝

    // 申请类型
    APPLY_TYPE_MEMBER: 0, // 成员申请

    // 订单状态
    ORDER_STATE_START: 0, // 订单开始
    ORDER_STATE_PAYING: 1, // 订单支付中
    ORDER_STATE_SUCCESS: 2, // 订单成功
    ORDER_STATE_FAILED: 4, // 订单失败
    ORDER_STATE_FINISH: 8, // 订单完成
    ORDER_STATE_REFUNDING: 16, // 订单退款中
    ORDER_STATE_REFUND_SUCCESS: 32, // 订单退款完成
    ORDER_STATE_REFUND_FAILED: 64, // 退款失败
    ORDER_STATE_CHARGING: 128, // 订单充值中
    ORDER_STATE_CHARGE_SUCCESS: 256, // 订单充值完成
    ORDER_STATE_CHARGE_FAILED: 512, // 订单充值失败

    // 交易类型
    TRADE_TYPE_DEFAULT: 0, // 默认类型
    TRADE_TYPE_HAQI_EXCHANGE: 1, // 兑换
    TRADE_TYPE_PACKAGE_BUY: 2, // 购买课程包
    TRADE_TYPE_LESSON_STUDY: 3, // 课程学习

    // 物品所属平台
    GOODS_PLATFORM_KEEPWORK: 0, // keepwork
    GOODS_PLATFORM_LESSON: 1, // lesson
    GOODS_PLATFORM_HAQI: 2, // haqi
    GOODS_PLATFORM_HAQI2: 3, // haqi2

    // 优惠券类型
    DISCOUNT_TYPE_DEFAULT: 0, // 通用性
    DISCOUNT_TYPE_PACKAGE: 1, // 课程包

    // 优惠券状态
    DISCOUNT_STATE_UNUSE: 0, // 未使用
    DISCOUNT_STATE_USED: 1, // 已使用
    DISCOUNT_STATE_EXPIRED: 2, // 已过期  使用时间范围判断是否过期

    PROJECT_PRIVILEGE_RECRUIT_ENABLE: 1, // 招募 开启
    PROJECT_PRIVILEGE_RECRUIT_DISABLE: 2, // 招募 关闭
    PROJECT_PRIVILEGE_COMMENT_ALL: 4, // 评论 所有人
    PROJECT_PRIVILEGE_COMMENT_MEMBER: 8, // 评论 成员
    PROJECT_PRIVILEGE_COMMENT_NONE: 16, // 评论 禁用
    PROJECT_PRIVILEGE_ISSUE_VIEW_ALL: 32, // 白板查看 所有人
    PROJECT_PRIVILEGE_ISSUE_VIEW_MEMBER: 64, // 白板查看 成员
    PROJECT_PRIVILEGE_ISSUE_EDIT_ALL: 128, // 白板编辑 所有人
    PROJECT_PRIVILEGE_ISSUE_EDIT_MEMBER: 256, // 白板编辑 成员

    PROJECT_TYPE_SITE: 0, // 网站项目
    PROJECT_TYPE_PARACRAFT: 1, // paracraft 项目

    // 管理员角色
    ADMIN_ROLE_SUPER: 10, // 超级管理员

    TAG_CLASSIFY_USER: 0, // 用户类别TAG
    TAG_CLASSIFY_PROJECT: 1, // 项目类别TAG
    TAG_CLASSIFY_PACKAGE: 2, // 课程包类别TAG

    CLASS_MEMBER_ROLE_STUDENT: 1, // 学生
    CLASS_MEMBER_ROLE_TEACHER: 2, // 教师
    CLASS_MEMBER_ROLE_ADMIN: 64, // 管理员

    USER_ATTRS: [
        ['id', 'userId'],
        'username',
        'nickname',
        'portrait',
        'description',
        'vip',
        'tLevel',
    ], // 返回的用户的属性

    USER_LIMIT_WORLD: 100, // 用户默认可以创建的世界数
};
