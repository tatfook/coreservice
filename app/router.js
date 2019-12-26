'use strict';
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, config, controller } = app;
    const selfConfig = config.self;

    router.prefix(selfConfig.apiUrlPrefix);

    const index = controller.index;
    router.all('/indexs/test', index.test);
    router.resources('/indexs', index);

    const keepwork = controller.keepwork;

    router.post('/keepworks/email', keepwork.email);
    router.get('/keepworks/captcha/:key', keepwork.captcha);
    router.get('/keepworks/svg_captcha', keepwork.getSvgCaptcha);
    router.post('/keepworks/svg_captcha', keepwork.postSvgCaptcha);
    router.get('/keepworks/statistics', keepwork.statistics);
    router.get('/keepworks/ip', keepwork.ip);
    router.post('/keepworks/page_visit', keepwork.postPageVisit);
    router.get('/keepworks/page_visit', keepwork.getPageVisit);
    router.post(
        '/keepworks/paracraft_download_count',
        keepwork.postParacraftDownloadCount
    );
    router.get(
        '/keepworks/paracraft_download_count',
        keepwork.getParacraftDownloadCount
    );
    router.post(
        '/keepworks/paracraft_download_url',
        keepwork.setParacraftDownloadUrl
    );
    router.get(
        '/keepworks/paracraft_download_url',
        keepwork.getParacraftDownloadUrl
    );

    const user = controller.user;
    router.get('/users/rank', user.rank);
    router.post('/users/platform_login', user.platformLogin);
    router.post('/users/search', user.search);
    router.post('/users/:id/contributions', user.addContributions);
    router.get('/users/:id/contributions', user.contributions);
    router.get('/users/:id/detail', user.detail);
    router.get('/users/:id/sites', user.sites);
    router.get('/users/:id/worldLimit', user.getWorldLimit);
    router.get('/users/token', user.token);
    router.get('/users/token/info', user.tokeninfo);
    router.post('/users/register', user.register);
    router.post('/users/login', user.login);
    router.post('/users/logout', user.logout);
    router.get('/users/account', user.account);
    router.get('/users/profile', user.profile);
    router.post('/users/info', user.setInfo);
    router.put('/users/pwd', user.changepwd);
    router.get('/users/email_captcha', user.emailVerifyOne);
    router.post('/users/email_captcha', user.emailVerifyTwo);
    router.get('/users/cellphone_captcha', user.cellphoneVerifyOne);
    router.post('/users/cellphone_captcha', user.cellphoneVerifyTwo);
    router.post('/users/reset_password', user.resetPassword);
    router.resources('/users', user);

    // -------------apis for lesson_api project---------------
    const lesson = controller.lesson;
    router.get('/lessons/userdatas', lesson.getUserDatas);
    router.post('/lessons/userdatas', lesson.setUserDatas);
    router.put('/lessons/update', lesson.update);
    router.get('/lessons/accountsAndRoles', lesson.accountsAndRoles);
    router.put('/lessons/accountsIncrement', lesson.accountsIncrement);
    router.get('/lessons/accounts', lesson.getAccounts);
    router.post('/lessons/createRecord', lesson.createRecord);
    router.post('/lessons/truncate', lesson.truncate);
    router.get('/lessons/projects', lesson.getAllPrjects);
    router.get('/lessons/users/:id', lesson.getUserById);
    router.put('/lessons/users/:id', lesson.updateUserById);
    // -------------apis for lesson_api project---------------

    const site = controller.site;
    router.get('/sites/getByName', site.getByName);
    router.put('/sites/:id/updateVisibility', site.updateVisibility);
    router.get('/sites/:id/privilege', site.privilege);
    router.post('/sites/:id/groups', site.postGroups);
    router.put('/sites/:id/groups', site.putGroups);
    router.delete('/sites/:id/groups', site.deleteGroups);
    router.get('/sites/:id/groups', site.getGroups);
    router.resources('/sites', site);

    const group = controller.group;
    router.post('/groups/:id/members', group.postMembers);
    router.delete('/groups/:id/members', group.deleteMembers);
    router.get('/groups/:id/members', group.getMembers);
    router.resources('/groups', group);

    const siteGroup = controller.siteGroup;
    router.resources('/site_groups', siteGroup);

    const domain = controller.domain;
    router.get('/domains/exist', domain.exist);
    router.resources('/domains', domain);

    const favorite = controller.favorite;
    router.post('/favorites/search', favorite.search);
    router.delete('/favorites', favorite.destroy);
    router.get('/favorites/follows', favorite.follows);
    router.get('/favorites/exist', favorite.exist);
    router.resources('/favorites', favorite);

    const oauthUser = controller.oauthUser;
    router.post('/oauth_users/qq', oauthUser.qq);
    router.post('/oauth_users/weixin', oauthUser.weixin);
    router.post('/oauth_users/github', oauthUser.github);
    router.post('/oauth_users/xinlang', oauthUser.xinlang);
    router.resources('/oauth_users', oauthUser);

    const oauthApp = controller.oauthApp;
    router.get('/oauth_apps/oauth_code', oauthApp.oauthCode);
    router.post('/oauth_apps/oauth_token', oauthApp.oauthToken);
    router.post('/oauth_apps/login', oauthApp.login);

    const comment = controller.comment;
    router.resources('/comments', comment);

    const qiniu = controller.qiniu;
    router.get('/qinius/test', qiniu.test);
    router.get('/qinius/uploadToken', qiniu.uploadToken);
    router.post('/qinius/uploadCallback', qiniu.uploadCallback);
    router.post('/qinius/fop', qiniu.fop);
    router.post('/qinius/fopCallback', qiniu.fopCallback);
    router.get('/qinius/token', qiniu.token);

    const tag = controller.tag;
    router.resources('/tags', tag);

    const project = controller.project;
    router.get('/projects/:id/game', project.game);
    router.get('/projects/join', project.join);
    router.post('/projects/search', project.search);
    router.post('/projects/searchForParacraft', project.searchForParacraft);
    router.get('/projects/:id/detail', project.detail);
    router.get('/projects/:id/visit', project.visit);
    router.get('/projects/:id/star', project.isStar);
    router.post('/projects/:id/star', project.star);
    router.post('/projects/:id/unstar', project.unstar);
    router.resources('/projects', project);

    // 项目评分
    const projectRate = controller.projectRate;
    router.resources('/projectRates', projectRate);

    const issue = controller.issue;
    router.post('/issues/search', issue.search);
    router.get('/issues/statistics', issue.statistics);
    router.resources('/issues', issue);

    const member = controller.member;
    router.post('/members/bulk', member.bulkCreate);
    router.get('/members/exist', member.exist);
    router.resources('/members', member);

    const apply = controller.apply;
    router.get('/applies/state', apply.state);
    router.post('/applies/search', apply.search);
    router.resources('/applies', apply);

    // 系统tag
    const systemTag = controller.systemTag;
    router.post('/systemTags/search', systemTag.search);
    router.resources('/systemTags', systemTag);

    const admin = controller.admin;
    router.all('/admins/query', admin.query);
    router.post('/admins/login', admin.login);
    router.get('/admins/userToken', admin.userToken);
    router.post('/admins/:resources/query', admin.resourcesQuery);
    router.post('/admins/:resources/search', admin.search);
    router.post('/admins/:resources/bulk', admin.bulkCreate);
    router.put('/admins/:resources/bulk', admin.bulkUpdate);
    router.delete('/admins/:resources/bulk', admin.bulkDestroy);
    router.resources('/admins/:resources', admin);
    // 标签和项目相关
    router.post(
        '/admins/projects/:projectId/systemTags',
        admin.createProjectTags
    );
    router.put(
        '/admins/projects/:projectId/systemTags/:tagId',
        admin.updateProjectTag
    );
    router.delete(
        '/admins/projects/:projectId/systemTags',
        admin.deleteProjectTags
    );
    // esProjectTag更新
    router.get(
        '/admins/task/once/esProjectTagUpdate',
        admin.esProjectTagUpdate
    );
    // esProjectWorldTagName更新
    router.get(
        '/admins/task/once/esProjectWorldTagNameUpdate',
        admin.esProjectWorldTagNameUpdate
    );

    const order = controller.order;
    router.post('/orders/charge', order.charge);
    router.resources('/orders', order);

    const trade = controller.trade;
    router.post('/trades/search', trade._search);
    router.resources('/trades', trade);

    const discount = controller.discount;
    router.resources('/discounts', discount);

    const goods = controller.goods;
    // router.all(`goods/importOldData`, goods.importOldData);
    router.post('/goods/search', goods.search);
    router.resources('/goods', goods);

    const world = controller.world;
    router.post('/worlds/save', world.save);
    router.resources('/worlds', world);

    // repo api
    const repo = controller.repo;
    router.get('/repos/:repoPath/tree', repo.getTree);
    router.get('/repos/:repoPath/download', repo.download);
    router.get('/repos/:repoPath/commitInfo', repo.getCommitInfo);
    router.get('/repos/:repoPath/files/:filePath/info', repo.getFileInfo);
    router.get('/repos/:repoPath/files/:filePath/raw', repo.getFileRaw);
    router.get('/repos/:repoPath/files/:filePath/history', repo.getFileHistory);
    router.post('/repos/:repoPath/files/:filePath', repo.createFile);
    router.put('/repos/:repoPath/files/:filePath', repo.updateFile);
    router.delete('/repos/:repoPath/files/:filePath', repo.deleteFile);
    router.post('/repos/:repoPath/files/:filePath/rename', repo.renameFile);
    router.post('/repos/:repoPath/folders/:folderPath', repo.createFolder);
    router.delete('/repos/:repoPath/folders/:folderPath', repo.deleteFolder);
    router.post(
        '/repos/:repoPath/folders/:folderPath/rename',
        repo.renameFolder
    );

    const sensitiveWord = controller.sensitiveWord;
    router.get('/sensitiveWords/trim', sensitiveWord.trim);
    router.all('/sensitiveWords/check', sensitiveWord.check);
    router.post('/sensitiveWords/import', sensitiveWord.importWords);
    router.resources('/sensitiveWords', sensitiveWord);

    // 探索APP
    const paracraftGameCoinKey = controller.paracraftGameCoinKey;
    const paracraftDevice = controller.paracraftDevice;
    router.get('/paracraftDevices/pwdVerify', paracraftDevice.pwdVerify);
    router.post('/paracraftGameCoinKeys/active', paracraftGameCoinKey.active);

    // paracraft 官网
    const paracraftVisitor = controller.paracraftVisitor;
    router.post('/paracraftVisitors/upsert', paracraftVisitor.upsert);

    // 反馈 投诉 举报
    const feedback = controller.feedback;
    router.resources('/feedbacks', feedback);

    // NPL 大赛
    const game = controller.game;
    router.get('/games/projects', game.projects);
    router.get('/games/members', game.members);
    router.post('/games/search', game.search);

    // NPL 大赛 作品
    const gameWorks = controller.gameWorks;
    router.get('/gameWorks/statistics', gameWorks.statistics);
    router.post('/gameWorks/search', gameWorks.search);
    router.post('/gameWorks/snapshoot', gameWorks.snapshoot);
    router.resources('/gameWorks', gameWorks);

    // organization
    const organization = controller.organization.index;
    router.post('/organizations/log', organization.log);
    router.post('/organizations/changepwd', organization.changepwd);

    // paracraft
    const pBlock = controller.pBlock;
    router.get('/pBlocks/systemClassifies', pBlock.systemClassifies);
    router.get('/pBlocks/system', pBlock.system);
    router.post('/pBlocks/:id/use', pBlock.use);
    router.resources('/pBlocks', pBlock);

    // migration
    const migration = controller.admin.migration;
    router.post(
        '/admin/migration/generateSiteRepo',
        migration.generateSiteRepo
    );
    router.post(
        '/admin/migration/generateWorldRepo',
        migration.generateWorldRepo
    );
    router.post('/admin/migration/syncRepo', migration.syncRepo);
};
