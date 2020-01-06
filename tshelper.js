'use strict';
/**
 * run `npx ets` to generate d.ts files
 * https://www.npmjs.com/package/egg-ts-helper#generator
 */
module.exports = {
    watchDirs: {
        validator: {
            directory: 'app/validator', // files directory.
            // pattern: '**/*.(ts|js)', // glob pattern, default is **/*.(ts|js). it doesn't need to configure normally.
            // ignore: '', // ignore glob pattern, default to empty.
            generator: 'auto', // generator name, eg: class、auto、function、object
            interface: 'IValidator', // interface name
            declareTo: 'Application.validator', // declare to this interface
            // watch: true, // whether need to watch files
            // caseStyle: 'upper', // caseStyle for loader
            // interfaceHandle: val => `ReturnType<typeof ${val}>`, // interfaceHandle
            // trigger: ['add', 'unlink'], // recreate d.ts when receive these events, all events: ['add', 'unlink', 'change']
        },

        api: {
            directory: 'app/api', // files directory.
            generator: 'auto', // generator name, eg: class、auto、function、object
            interface: 'IApi', // interface name
            declareTo: 'Application.api',
        },
    },
};
