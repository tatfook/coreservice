'use strict';
const mock = require('egg-mock');
const app = mock.app();
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await app.ready();
        const relations = await app.model.systemTagProjects.findAll();
        let projectIds = relations.map(relation => relation.projectId);
        projectIds = Array.from(new Set(projectIds));
        for (let i = 0; i < projectIds.length; i++) {
            let project = await app.model.projects.findOne({
                where: { id: projectIds[i] },
                include: [
                    {
                        model: app.model.systemTags,
                    },
                ],
            });
            if (project) {
                await app.api.projectsUpsert(project);
            }
        }
    },

    down: (queryInterface, Sequelize) => {
        /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    },
};
