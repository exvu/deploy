function deserializeError(serializedError:any){
    const err:any = new Error();
    err.code = serializedError.code;
    err.message = serializedError.message;
    err.stack = serializedError.stack;
    return err;
}

function formatAssets(assetsList:any):any{

    return [["Name", "Size"]]
    .concat(assetsList)
    .concat([["Total", assetsList.length]]);
}
export default {
    deserializeError,
    formatAssets,
}