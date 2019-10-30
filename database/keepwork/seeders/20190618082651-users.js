'use strict';
const md5 = require('blueimp-md5');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert(
            'users',
            [
                {
                    username: 'user001',
                    password: md5('123456'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    username: 'user002',
                    password: md5('123456'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    username: 'user003',
                    password: md5('123456'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    username: 'user004',
                    password: md5('123456'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    username: 'user005',
                    password: md5('123456'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    username: 'user006',
                    password: md5('123456'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {}
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('users', null, {});
    },
};
