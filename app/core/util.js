/* eslint-disable no-magic-numbers */
'use strict';
// const jwt = require("jwt-simple");
const jwt = require('./jwt.js');
const crypto = require('crypto');
const _ = require('lodash');
const Hashes = require('jshashes');
const md5 = require('blueimp-md5');

const sha1 = new Hashes.SHA1().setUTF8(true);

const util = {};

const getStringByteLength = function(str) {
    let totalLength = 0;
    let charCode;
    for (let i = 0; i < str.length; i++) {
        charCode = str.charCodeAt(i);
        if (charCode < 0x007f) {
            totalLength++;
        } else if (charCode >= 0x0080 && charCode <= 0x07ff) {
            totalLength += 2;
        } else if (charCode >= 0x0800 && charCode <= 0xffff) {
            totalLength += 3;
        } else {
            totalLength += 4;
        }
    }
    return totalLength;
};
// 与gitlab sha一致
util.hash = function(content) {
    const header = 'blob ' + getStringByteLength(content) + '\0';
    const text = header + content;
    return sha1.hex(text);
};

util.md5 = function(str) {
    return md5(str);
};

const filetypes = {
    '/': 'folders',

    '.md': 'pages',

    '.jpg': 'images',
    '.jpeg': 'images',
    '.png': 'images',
    '.svg': 'images',

    '.mp4': 'videos',
    '.webm': 'videos',

    '.mp3': 'audios',
    '.ogg': 'audios',
    '.wav': 'audios',

    '.json': 'datas',
    '.yml': 'datas',

    // unknow: "files",
};

util.jwt_encode = function(payload, key, expire = 3600 * 24 * 2) {
    payload = payload || {};
    payload.exp = Date.now() / 1000 + expire;

    return jwt.encode(payload, key, 'HS1');
};

util.jwt_decode = function(token, key, noVerify) {
    // return jwt.decode(token, key, noVerify, "HS1");
    return jwt.decode(token, key, noVerify);
};

util.getTypeByKey = function(key) {
    for (const ext in filetypes) {
        if (_.endsWith(key, ext)) return filetypes[ext];
    }

    return 'files';
};

util.isPage = function(key) {
    return this.getTypeByKey(key) === 'pages';
};

util.getUsernameByKey = function(key) {
    return key.substring(0, key.indexOf('/'));
};
// 获取目录
util.getFolderByKey = function(key) {
    return key.substring(0, key.lastIndexOf('/', key.length - 2) + 1);
};

util.getKeyByPath = function(path, filetype) {
    const paths = path.split('/');

    filetype = filetype || this.getTypeByKey(path);

    paths.splice(1, 0, filetype);

    return paths.join('/');
};

util.getPathByKey = function(key) {
    const paths = key.split('/');
    // if (paths.length < 3) return key;
    paths.splice(1, 1);

    return paths.join('/');
};

util.parseKey = function(key) {
    const obj = { key };
    obj.path = this.getPathByKey(key);
    obj.type = this.getTypeByKey(key);
    obj.url = key.substring(0, key.lastIndexOf('.'));

    const paths = obj.path.split('/');
    obj.username = paths[0];
    obj.sitename = paths[1];

    return obj;
};

util.getDate = function() {
    const date = new Date();
    const year = _.padStart(date.getFullYear(), 4, '0');
    const month = _.padStart(date.getMonth() + 1, 2, '0');
    const day = _.padStart(date.getDate(), 2, '0');
    const hour = _.padStart(date.getHours(), 2, '0');
    const minute = _.padStart(date.getMinutes(), 2, '0');
    const second = _.padStart(date.getSeconds(), 2, '0');

    const datetime = year + month + day + hour + minute + second;
    return { year, month, day, hour, minute, second, datetime };
};

util.rsaEncrypt = function(prvKey, message) {
    return crypto
        .privateEncrypt(prvKey, Buffer.from(message, 'utf8'))
        .toString('hex');
};

util.rsaDecrypt = function(pubKey, sig) {
    return crypto
        .publicDecrypt(pubKey, Buffer.from(sig, 'hex'))
        .toString('utf8');
};

module.exports = util;
