module.exports = app => {
    const { factory } = app;
    const tableName = 'orders';
    factory.define(tableName, app.model[tableName], async options => {
        const user = options.user || (await factory.create('users'));
        return {
            userId: user.id,
            orderNo: factory.chance('string', { length: 10 }),
            amount: factory.chance('integer', {
                min: 10,
                max: 500,
            }),
            state: 128,
            channel: 'alipay_qr',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};
