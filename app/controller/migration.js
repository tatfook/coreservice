/* eslint-disable no-magic-numbers */
'use strict';

const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const Controller = require('../core/controller.js');

class Migration extends Controller {
    generateAttrsText(attrs) {
        let text = '';

        const getType = type => {
            if (type === 'DATETIME') return 'DATE';
            else if (type === 'BIGINT(20)') return 'BIGINT';
            else if (type === 'INT(11)') return 'INTEGER';
            else if (type === 'TINYTEXT') return "TEXT('tiny')";
            else if (type === 'TINYINT(1)') return 'BOOLEAN';
            else if (type === 'LONGTEXT') return "TEXT('long')";
            return type.replace('VARCHAR', 'STRING');
        };
        for (const key in attrs) {
            const value = attrs[key];
            const type = getType(value.type);
            const defaultValue = _.isString(value.defaultValue)
                ? `"${value.defaultValue}"`
                : value.defaultValue;
            text += `
			"${key}": {
				type: ${type},
				allowNull: ${value.allowNull},
				primaryKey: ${value.primaryKey},
				autoIncrement: ${key === 'id'},
				${defaultValue == null ? '' : 'defaultValue:' + defaultValue}
			},
				`;
        }

        return `{
			${text}
		}`;
    }

    async generateText({ tableName, model }) {
        const indexes = await model
            .query(`show index from ${tableName}`, {
                type: model.QueryTypes.SHOWINDEXES,
            })
            .then(list =>
                list.map(o => ({
                    primary: o.primary,
                    fields: o.fields,
                    unique: o.unique,
                    name: o.name,
                }))
            );
        const attrs = await model.query(`describe ${tableName}`, {
            type: model.QueryTypes.DESCRIBE,
        });
        const attrstext = this.generateAttrsText(attrs);
        return `
'use strict'

const tableName = "${tableName}";
const indexes = ${JSON.stringify(indexes, null, 4)};

module.exports = {
	up: async(queryInterface, Sequelize) => {
		const {
			BIGINT,
			STRING,
			TEXT,
			BOOLEAN,
			INTEGER,
			DECIMAL,
			FLOAT,
			DOUBLE,
			REAL,
			DATE,
			JSON,
		} = Sequelize;
		await queryInterface.createTable(tableName, ${attrstext}, {
			underscored: false,
			charset: "utf8mb4",
			collate: 'utf8mb4_bin',
		});

		for (let i = 0; i < indexes.length; i++) {
			const index = indexes[i];
			if (index.primary) continue;
			await queryInterface.addIndex(tableName, index);
		}
		
		return ;
	},

	down: async(queryInterface, Sequelize) => {
		return queryInterface.dropTable(tableName);
	}
};
		`;
    }

    async generateAll() {
        const datetime = moment().format('YYYYMMDDHHmmss');
        const keepworkTables = await this.app.model.query('show tables', {
            type: this.app.model.QueryTypes.SHOWTABLES,
        });
        for (let i = 0; i < keepworkTables.length; i++) {
            const tableName = keepworkTables[i];
            if (tableName === 'SequelizeMeta') continue;
            const filename = `./database/migrations/keepwork/${datetime}-${tableName}.js`;
            const model = this.app.model;
            const text = await this.generateText({ tableName, model });
            fs.writeFile(filename, text, function() {});
        }
        const lessonTables = await this.app.lessonModel.query('show tables', {
            type: this.app.lessonModel.QueryTypes.SHOWTABLES,
        });
        for (let i = 0; i < lessonTables.length; i++) {
            const tableName = lessonTables[i];
            if (tableName === 'SequelizeMeta') continue;
            const filename = `./database/migrations/lesson/${datetime}-${tableName}.js`;
            const model = this.app.lessonModel;
            const text = await this.generateText({ tableName, model });
            fs.writeFile(filename, text, function() {});
        }
        return this.success();
    }

    async generate() {
        const datetime = moment().format('YYYYMMDDHHmmss');
        const { tableName, schema = 'keepwork' } = this.validate({
            tableName: 'string',
        });
        const model =
            schema === 'keepwork' ? this.app.model : this.app.lessonModel;
        const filename = `./database/migrations/${schema}/${datetime}-${tableName}.js`;
        const text = await this.generateText({ tableName, model });
        fs.writeFile(filename, text);

        return this.success();
    }
}

module.exports = Migration;
