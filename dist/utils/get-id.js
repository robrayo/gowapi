"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getID = void 0;
const remove_trailing_slash_1 = require("./remove-trailing-slash");
const getID = (url) => {
    const editedUrl = (0, remove_trailing_slash_1.removeTrailingSlash)(url);
    return editedUrl?.split('/').pop() || null;
};
exports.getID = getID;
