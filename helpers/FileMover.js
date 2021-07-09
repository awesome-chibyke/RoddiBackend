const {promisify} = require('util');
const fs = require('fs');
const {join} = require('path');
const mv = promisify(fs.rename);

exports.moveFile = async (oldPath, newPath) => {
    // Move file ./bar/foo.js to ./baz/qux.js
    const original = oldPath;
    const target = newPath;
    await mv(original, target);
}

