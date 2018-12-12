"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function deserializeError(serializedError) {
    const err = new Error();
    err.code = serializedError.code;
    err.message = serializedError.message;
    err.stack = serializedError.stack;
    return err;
}
function formatAssets(assetsList) {
    return [["Name", "Size"]]
        .concat(assetsList)
        .concat([["Total", assetsList.length]]);
}
exports.default = {
    deserializeError,
    formatAssets,
};
