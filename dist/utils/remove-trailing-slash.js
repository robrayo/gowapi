"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTrailingSlash = void 0;
const removeTrailingSlash = (url) => {
    return url?.replace(/\/$/, '');
};
exports.removeTrailingSlash = removeTrailingSlash;
