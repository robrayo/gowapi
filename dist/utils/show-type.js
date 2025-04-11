"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showType = void 0;
const showType = (type) => {
    if (type?.includes('episode')) {
        return 'episode';
    }
    if (type?.includes('series')) {
        return 'series';
    }
    return 'movie';
};
exports.showType = showType;
