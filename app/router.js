'use strict';
module.exports = app => {
    const { router, config, controller } = app;
    const selfConfig = config.self;

    const prefix = selfConfig.apiUrlPrefix;

    const index = controller.index;
    router.all(`${prefix}indexs/test`, index.test);
    router.resources(`${prefix}indexs`, index);

    const migration = controller.migration;
    router.get(`${prefix}migrations/generate`, migration.generate);
    router.get(`${prefix}migrations/generateAll`, migration.generateAll);

    const keepwork = controller.keepwork;
    // router.get(`${prefix}keepworks/issue5270`, keepwork.issue5270);
    router.post(`${prefix}keepworks/email`, keepwork.email);
    router.get(`${prefix}keepworks/captcha/:key`, keepwork.captcha);
    router.get(`${prefix}keepworks/svg_captcha`, keepwork.getSvgCaptcha);
    router.post(`${prefix}keepworks/svg_captcha`, keepwork.postSvgCaptcha);
    router.get(`${prefix}keepworks/words`, keepwork.words);
    router.get(`${prefix}keepworks/statistics`, keepwork.statistics);
    router.get(`${prefix}keepworks/ip`, keepwork.ip);
    router.post(`${prefix}keepworks/page_visit`, keepwork.postPageVisit);
    router.get(`${prefix}keepworks/page_visit`, keepwork.getPageVisit);
    router.post(
        `${prefix}keepworks/paracraft_download_count`,
        keepwork.postParacraftDownloadCount
    );
    router.get(
        `${prefix}keepworks/paracraft_download_count`,
        keepwork.getParacraftDownloadCount
    );
    router.post(
        `${prefix}keepworks/paracraft_download_url`,
        keepwork.setParacraftDownloadUrl
    );
    router.get(
        `${prefix}keepworks/paracraft_download_url`,
        keepwork.getParacraftDownloadUrl
    );

    const user = controller.user;
    router.get(`${prefix}users/rank`, user.rank);
    router.post(`${prefix}users/platform_login`, user.platformLogin);
    router.post(`${prefix}users/search`, user.search);
    router.post(`${prefix}users/:id/contributions`, user.addContributions);
    router.get(`${prefix}users/:id/contributions`, user.contributions);
    router.get(`${prefix}users/:id/detail`, user.detail);
    router.get(`${prefix}users/:id/sites`, user.sites);
    router.get(`${prefix}users/token`, user.token);
    router.get(`${prefix}users/token/info`, user.tokeninfo);
    router.post(`${prefix}users/register`, user.register);
    router.post(`${prefix}users/login`, user.login);
    router.post(`${prefix}users/logout`, user.logout);
    router.get(`${prefix}users/account`, user.account);
    router.get(`${prefix}users/profile`, user.profile);
    router.post(`${prefix}users/profile`, user.setProfile);
    router.post(`${prefix}users/info`, user.setInfo);
    router.put(`${prefix}users/pwd`, user.changepwd);
    router.get(`${prefix}users/email_captcha`, user.emailVerifyOne);
    router.post(`${prefix}users/email_captcha`, user.emailVerifyTwo);
    router.get(`${prefix}users/cellphone_captcha`, user.cellphoneVerifyOne);
    router.post(`${prefix}users/cellphone_captcha`, user.cellphoneVerifyTwo);
    router.post(`${prefix}users/reset_password`, user.resetPassword);
    router.resources(`${prefix}users`, user);

    const site = controller.site;
    router.get(`${prefix}sites/getByName`, site.getByName);
    router.get(`${prefix}sites/:id/privilege`, site.privilege);
    router.post(`${prefix}sites/:id/groups`, site.postGroups);
    router.put(`${prefix}sites/:id/groups`, site.putGroups);
    router.delete(`${prefix}sites/:id/groups`, site.deleteGroups);
    router.get(`${prefix}sites/:id/groups`, site.getGroups);
    router.resources(`${prefix}sites`, site);

    const page = controller.page;
    router.post(`${prefix}pages/save`, page.save);
    router.get(`${prefix}pages/visit`, page.visit);
    router.resources(`${prefix}pages`, page);

    const group = controller.group;
    router.post(`${prefix}groups/:id/members`, group.postMembers);
    router.delete(`${prefix}groups/:id/members`, group.deleteMembers);
    router.get(`${prefix}groups/:id/members`, group.getMembers);
    router.resources(`${prefix}groups`, group);

    const siteGroup = controller.siteGroup;
    router.resources(`${prefix}site_groups`, siteGroup);

    const domain = controller.domain;
    router.get(`${prefix}domains/exist`, domain.exist);
    router.resources(`${prefix}domains`, domain);

    const favorite = controller.favorite;
    router.post(`${prefix}favorites/search`, favorite.search);
    router.delete(`${prefix}favorites`, favorite.destroy);
    router.get(`${prefix}favorites/follows`, favorite.follows);
    router.get(`${prefix}favorites/exist`, favorite.exist);
    router.resources(`${prefix}favorites`, favorite);

    const oauthUser = controller.oauthUser;
    router.post(`${prefix}oauth_users/qq`, oauthUser.qq);
    router.post(`${prefix}oauth_users/weixin`, oauthUser.weixin);
    router.post(`${prefix}oauth_users/github`, oauthUser.github);
    router.post(`${prefix}oauth_users/xinlang`, oauthUser.xinlang);
    router.resources(`${prefix}oauth_users`, oauthUser);

    const oauthApp = controller.oauthApp;
    router.get(`${prefix}oauth_apps/oauth_code`, oauthApp.oauthCode);
    router.post(`${prefix}oauth_apps/oauth_token`, oauthApp.oauthToken);
    router.post(`${prefix}oauth_apps/login`, oauthApp.login);

    const comment = controller.comment;
    router.resources(`${prefix}comments`, comment);

    const qiniu = controller.qiniu;
    router.get(`${prefix}qinius/test`, qiniu.test);
    router.get(`${prefix}qinius/uploadToken`, qiniu.uploadToken);
    router.post(`${prefix}qinius/uploadCallback`, qiniu.uploadCallback);
    router.post(`${prefix}qinius/fop`, qiniu.fop);
    router.post(`${prefix}qinius/fopCallback`, qiniu.fopCallback);
    router.get(`${prefix}qinius/token`, qiniu.token);

    const file = controller.file;
    router.get(`${prefix}files/:id/rawurl`, file.rawurl);
    router.get(`${prefix}files/:id/token`, file.token);
    router.get(`${prefix}files/statistics`, file.statistics);
    router.get(`${prefix}files/list`, file.list);
    router.post(`${prefix}files/list`, file.list);
    router.post(`${prefix}files/qiniu`, file.qiniu);
    router.get(`${prefix}files/imageAudit`, file.imageAudit);
    router.get(`${prefix}files/videoAudit`, file.videoAudit);
    router.post(`${prefix}files/audit`, file.audit);
    router.resources(`${prefix}files`, file);

    const siteFile = controller.siteFile;
    router.post(`${prefix}siteFiles/url`, siteFile.url);
    router.get(`${prefix}siteFiles/:id/rawurl`, siteFile.rawurl);
    router.get(`${prefix}siteFiles/:id/raw`, siteFile.raw);
    router.resources(`${prefix}siteFiles`, siteFile);

    const tag = controller.tag;
    router.resources(`${prefix}tags`, tag);

    const project = controller.project;
    router.get(
        `${prefix}projects/importProjectCover`,
        project.importProjectCover
    );
    router.get(`${prefix}projects/import`, project.importProject);
    router.get(`${prefix}projects/:id/status`, project.status);
    router.get(`${prefix}projects/:id/game`, project.game);
    router.get(`${prefix}projects/join`, project.join);
    router.post(`${prefix}projects/search`, project.search);
    router.post(
        `${prefix}projects/searchForParacraft`,
        project.searchForParacraft
    );
    router.get(`${prefix}projects/:id/detail`, project.detail);
    router.get(`${prefix}projects/:id/visit`, project.visit);
    router.get(`${prefix}projects/:id/star`, project.isStar);
    router.post(`${prefix}projects/:id/star`, project.star);
    router.post(`${prefix}projects/:id/unstar`, project.unstar);
    router.resources(`${prefix}projects`, project);

    // 项目评分
    const projectRate = controller.projectRate;
    router.resources(`${prefix}projectRates`, projectRate);

    const issue = controller.issue;
    router.post(`${prefix}issues/count`, issue.count);
    router.post(`${prefix}issues/search`, issue.search);
    router.get(`${prefix}issues/statistics`, issue.statistics);
    router.resources(`${prefix}issues`, issue);

    const member = controller.member;
    router.post(`${prefix}members/bulk`, member.bulkCreate);
    router.get(`${prefix}members/exist`, member.exist);
    router.resources(`${prefix}members`, member);

    const apply = controller.apply;
    router.get(`${prefix}applies/state`, apply.state);
    router.post(`${prefix}applies/search`, apply.search);
    router.resources(`${prefix}applies`, apply);

    // 系统tag
    const systemTag = controller.systemTag;
    router.post(`${prefix}systemTags/search`, systemTag.search);
    router.resources(`${prefix}systemTags`, systemTag);

    const convert = controller.convert;
    router.get(`${prefix}converts`, convert.convert);
    router.get(
        `${prefix}converts/siteVisibility`,
        convert.convertSiteVisibility
    );
    router.get(`${prefix}converts/siteFile`, convert.convertSiteFile);
    router.get(`${prefix}converts/userEmail`, convert.userEmail);
    router.get(`${prefix}converts/users`, convert.users);
    router.get(`${prefix}converts/sites`, convert.sites);
    router.get(`${prefix}converts/groups`, convert.groups);
    router.get(`${prefix}converts/group_members`, convert.groupMembers);
    router.get(`${prefix}converts/site_groups`, convert.siteGroups);

    const admin = controller.admin;
    router.all(`${prefix}admins/query`, admin.query);
    router.post(`${prefix}admins/login`, admin.login);
    router.get(`${prefix}admins/userToken`, admin.userToken);
    router.post(`${prefix}admins/:resources/query`, admin.resourcesQuery);
    router.post(`${prefix}admins/:resources/search`, admin.search);
    router.post(`${prefix}admins/:resources/bulk`, admin.bulkCreate);
    router.put(`${prefix}admins/:resources/bulk`, admin.bulkUpdate);
    router.delete(`${prefix}admins/:resources/bulk`, admin.bulkDestroy);
    router.resources(`${prefix}admins/:resources`, admin);
    // 标签和项目相关
    router.post(`${prefix}admins/projects/:projectId/systemTags`, admin.createProjectTags);
    router.put(`${prefix}admins/projects/:projectId/systemTags/:tagId`, admin.updateProjectTag);
    router.delete(`${prefix}admins/projects/:projectId/systemTags`, admin.deleteProjectTags);

    const order = controller.order;
    router.post(`${prefix}orders/charge`, order.charge);
    router.resources(`${prefix}orders`, order);

    const trade = controller.trade;
    router.post(`${prefix}trades/search`, trade._search);
    router.resources(`${prefix}trades`, trade);

    const discount = controller.discount;
    router.resources(`${prefix}discounts`, discount);

    const goods = controller.goods;
    // router.all(`${prefix}goods/importOldData`, goods.importOldData);
    router.post(`${prefix}goods/search`, goods.search);
    router.resources(`${prefix}goods`, goods);

    const world = controller.world;
    router.post(`${prefix}worlds/save`, world.save);
    router.get(`${prefix}worlds/test`, world.test);
    router.get(`${prefix}worlds/testDelete`, world.testDelete);
    router.resources(`${prefix}worlds`, world);

    const sensitiveWord = controller.sensitiveWord;
    // router.get(`${prefix}sensitiveWords/importOldWords`, sensitiveWord.importOldWords);
    router.get(`${prefix}sensitiveWords/trim`, sensitiveWord.trim);
    router.all(`${prefix}sensitiveWords/check`, sensitiveWord.check);
    router.post(`${prefix}sensitiveWords/import`, sensitiveWord.importWords);
    router.resources(`${prefix}sensitiveWords`, sensitiveWord);

    // 探索APP
    const paracraftGameCoinKey = controller.paracraftGameCoinKey;
    const paracraftDevice = controller.paracraftDevice;
    router.get(
        `${prefix}paracraftDevices/pwdVerify`,
        paracraftDevice.pwdVerify
    );
    router.post(
        `${prefix}paracraftGameCoinKeys/active`,
        paracraftGameCoinKey.active
    );

    // paracraft 官网
    const paracraftVisitor = controller.paracraftVisitor;
    router.post(`${prefix}paracraftVisitors/upsert`, paracraftVisitor.upsert);

    const paracraftNews = controller.paracraftNews;
    router.get(`${prefix}paracraftNews`, paracraftNews.index);

    // 反馈 投诉 举报
    const feedback = controller.feedback;
    router.resources(`${prefix}feedbacks`, feedback);

    // wikicraft proxy
    router.all('/api/wiki/models/user/login', controller.proxyUser.login);
    router.all('/api/wiki/models/user/register', controller.proxyUser.register);
    router.all(
        '/api/wiki/models/user/getProfile',
        controller.proxyUser.profile
    );
    router.all('/api/wiki/models/user/changepw', controller.proxyUser.changepw);
    router.all(
        '/api/wiki/models/user/batchChangePwd',
        controller.proxyUser.batchChangePwd
    );
    router.all(
        '/api/wiki/models/user/getBaseInfoByName',
        controller.proxyUser.getBaseInfoByName
    );
    router.all(
        '/api/wiki/models/oauth_app/agreeOauth',
        controller.proxyOauthApp.agreeOauth
    );
    router.all(
        '/api/wiki/models/oauth_app/getTokenByCode',
        controller.proxyOauthApp.getTokenByCode
    );

    // NPL 大赛
    const game = controller.game;
    router.get(`${prefix}games/projects`, game.projects);
    router.get(`${prefix}games/members`, game.members);
    router.post(`${prefix}games/search`, game.search);

    // NPL 大赛 作品
    const gameWorks = controller.gameWorks;
    router.get(`${prefix}gameWorks/statistics`, gameWorks.statistics);
    router.post(`${prefix}gameWorks/search`, gameWorks.search);
    router.post(`${prefix}gameWorks/snapshoot`, gameWorks.snapshoot);
    router.resources(`${prefix}gameWorks`, gameWorks);

    // LESSON three
    const lessonOrganization = controller.lessonOrganization;
    router.get(`${prefix}lessonOrganizations/token`, lessonOrganization.token);
    router.get(
        `${prefix}lessonOrganizations/packages`,
        lessonOrganization.packages
    );
    router.get(
        `${prefix}lessonOrganizations/packageDetail`,
        lessonOrganization.packageDetail
    );
    router.get(
        `${prefix}lessonOrganizations/getByName`,
        lessonOrganization.getByName
    );
    router.get(
        `${prefix}lessonOrganizations/getByUrl`,
        lessonOrganization.getByUrl
    );
    router.post(`${prefix}lessonOrganizations/login`, lessonOrganization.login);
    router.post(
        `${prefix}lessonOrganizations/search`,
        lessonOrganization.search
    );
    router.resources(`${prefix}lessonOrganizations`, lessonOrganization);
    // router.post(`${prefix}lessonOrganizations`, lessonOrganization.create);
    // router.get(`${prefix}lessonOrganizations/:id`, lessonOrganization.show);
    // router.put(`${prefix}lessonOrganizations/:id`, lessonOrganization.update);

    // organization class
    const lessonOrganizationClass = controller.lessonOrganizationClass;
    router.get(
        `${prefix}lessonOrganizationClasses`,
        lessonOrganizationClass.index
    );
    router.get(
        `${prefix}lessonOrganizationClasses/history`,
        lessonOrganizationClass.history
    );
    router.post(
        `${prefix}lessonOrganizationClasses`,
        lessonOrganizationClass.create
    );
    router.get(
        `${prefix}lessonOrganizationClasses/:id/project`,
        lessonOrganizationClass.latestProject
    );
    router.put(
        `${prefix}lessonOrganizationClasses/:id`,
        lessonOrganizationClass.update
    );
    router.delete(
        `${prefix}lessonOrganizationClasses/:id`,
        lessonOrganizationClass.destroy
    );

    // organization class member
    const lessonOrganizationClassMember =
        controller.lessonOrganizationClassMember;
    router.get(
        `${prefix}lessonOrganizationClassMembers/student`,
        lessonOrganizationClassMember.student
    );
    router.get(
        `${prefix}lessonOrganizationClassMembers/teacher`,
        lessonOrganizationClassMember.teacher
    );
    router.post(
        `${prefix}lessonOrganizationClassMembers/bulk`,
        lessonOrganizationClassMember.bulkCreate
    );
    router.resources(
        `${prefix}lessonOrganizationClassMembers`,
        lessonOrganizationClassMember
    );

    // organization activate code
    const lessonOrganizationActivateCode =
        controller.lessonOrganizationActivateCode;
    router.post(
        `${prefix}lessonOrganizationActivateCodes/activate`,
        lessonOrganizationActivateCode.activate
    );
    router.post(
        `${prefix}lessonOrganizationActivateCodes/search`,
        lessonOrganizationActivateCode.index
    );
    router.resources(
        `${prefix}lessonOrganizationActivateCodes`,
        lessonOrganizationActivateCode
    );

    // organization user
    const lessonOrganizationUser = controller.lessonOrganizationUser;
    router.post(
        `${prefix}lessonOrganizationUsers/batch`,
        lessonOrganizationUser.batchCreateUser
    );
    router.post(
        `${prefix}lessonOrganizationUsers/unbind`,
        lessonOrganizationUser.unbind
    );
    router.post(
        `${prefix}lessonOrganizationUsers/setpwd`,
        lessonOrganizationUser.setpwd
    );

    // organization form
    const lessonOrganizationForm = controller.lessonOrganizationForm;
    router.get(
        `${prefix}lessonOrganizationForms/:id/submit`,
        lessonOrganizationForm.getSubmit
    );
    router.post(
        `${prefix}lessonOrganizationForms/:id/submit`,
        lessonOrganizationForm.postSubmit
    );
    router.put(
        `${prefix}lessonOrganizationForms/:id/submit/:submitId`,
        lessonOrganizationForm.updateSubmit
    );
    router.post(
        `${prefix}lessonOrganizationForms/search`,
        lessonOrganizationForm.search
    );
    router.resources(
        `${prefix}lessonOrganizationForms`,
        lessonOrganizationForm
    );

    // organization
    const organization = controller.organization.index;
    router.post(`${prefix}organizations/log`, organization.log);
    router.post(`${prefix}organizations/changepwd`, organization.changepwd);

    // Message
    const userMessage = controller.userMessage;
    router.post(`${prefix}userMessages/state`, userMessage.setState);
    router.post(`${prefix}userMessages/allstate`, userMessage.allstate);
    router.resources(`${prefix}userMessages`, userMessage);

    // paracraft
    const pBlock = controller.pBlock;
    router.get(`${prefix}pBlocks/systemClassifies`, pBlock.systemClassifies);
    router.get(`${prefix}pBlocks/system`, pBlock.system);
    router.post(`${prefix}pBlocks/:id/use`, pBlock.use);
    router.resources(`${prefix}pBlocks`, pBlock);
};
