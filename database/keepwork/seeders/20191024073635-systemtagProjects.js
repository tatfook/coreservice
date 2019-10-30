'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // 查询出来所有的项目
            let projects = await queryInterface.sequelize.query(
                'SELECT id, classifyTags FROM projects;',
                { type: Sequelize.QueryTypes.SELECT, transaction }
            );
            let systemTagProjects = [];
            for (let i = 0; i < projects.length; i++) {
                let project = projects[i];
                let classifyTags =
                    project.classifyTags && project.classifyTags.split('|');
                classifyTags =
                    classifyTags &&
                    classifyTags.filter(tag => {
                        if (tag) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                if (classifyTags && classifyTags.length) {
                    let tags = await queryInterface.sequelize.query(
                        'SELECT id FROM systemTags where classify=1 and tagname in (?);',
                        {
                            replacements: [classifyTags],
                            type: Sequelize.QueryTypes.SELECT,
                            transaction,
                        }
                    );
                    tags.forEach(tag => {
                        systemTagProjects.push({
                            systemTagId: tag.id,
                            projectId: project.id,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });
                    });
                } else {
                    continue;
                }
            }
            if (systemTagProjects.length) {
                await queryInterface.bulkInsert(
                    'systemTagProjects',
                    systemTagProjects,
                    { transaction }
                );
            }

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkDelete('systemTagProjects', null, {
                transaction,
            });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw err;
        }
    },
};
