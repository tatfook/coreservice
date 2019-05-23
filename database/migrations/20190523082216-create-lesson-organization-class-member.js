'use strict';

const tableName = 'lessonOrganizationClassMembers';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      JSON,
      DATE,
    } = Sequelize;

    await queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      organizationId: {
        type: BIGINT,
        defaultValue: 0,
      },

      classId: { // 0 -- 则为机构成员
        type: BIGINT,
        defaultValue: 0,
      },

      memberId: { // 成员id
        type: BIGINT,
        defaultValue: 0,
      },

      realname: { // 真实姓名
        type: STRING,
      },

      roleId: { // 角色  1 -- 学生  2 -- 教师  64 -- 管理员
        type: INTEGER,
        defaultValue: 0,
      },

      privilege: { // 权限
        type: INTEGER,
        defaultValue: 0,
      },

      extra: {
        type: JSON,
        defaultValue: {},
      },

      createdAt: {
        type: DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DATE,
        allowNull: false,
      },

    }, {
      underscored: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_bin',

      indexes: [
        {
          name: 'organizationId-classId-memberId',
          unique: true,
          fields: [ 'organizationId', 'classId', 'memberId' ],
        },
      ],
    });

    return queryInterface.addIndex(
      tableName,
      [ 'organizationId', 'classId', 'memberId' ],
      { unique: true, name: 'organizationId-classId-memberId' }
    );
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
