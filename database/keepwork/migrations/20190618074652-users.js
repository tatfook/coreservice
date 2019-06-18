'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		/*
		  Add altering commands here.
		  Return a promise to correctly handle asynchronicity.
		
		  Example:
		  return queryInterface.createTable('users', { id: Sequelize.INTEGER });
		*/
		const {
			BIGINT,
			INTEGER,
			STRING,
			TEXT,
			BOOLEAN,
			JSON,
		} = Sequelize;
		
		const attrs = {
			id: {
				type: BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			
			username: {
				type: STRING(48),
				unique: true,
				allowNull: false,
			},
		
			password: {
				type: STRING(48),
				allowNull: false,
			},
		
			roleId: {
				type: INTEGER,
				defaultValue: 0,
			},
		
			email: {      // 邮箱
				type: STRING(64),
				unique: true,
			},
		
			cellphone: {  // 绑定手机号
				type: STRING(24),
				unique: true,
			},
		
			realname: {    // 实名手机号
				type: STRING(24),
			},
		
			nickname: {    // 昵称
				type: STRING(48),
			},
		
			portrait: {
				type: STRING(1024),
			},
		
			sex: {
				type: STRING(4),
			},
		
			description: {
				type: STRING(512),
			},
		
			extra: {
				type: JSON,
				defaultValue: {},
			},
		};
		
		const opts = {
			underscored: false,
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',
		}
		
		return queryInterface.createTable('users', attrs, opts);
	},
	
	down: (queryInterface, Sequelize) => {
	    return queryInterface.dropTable('users');
	}
};
