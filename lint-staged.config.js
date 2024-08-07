// eslint-disable-next-line import/no-extraneous-dependencies
const { ESLint } = require("eslint");

const removeIgnoredFiles = async (files) => {
    const eslint = new ESLint();
    const ignoredFiles = await Promise.all(
        files.map((file) => eslint.isPathIgnored(file)),
    );
    const filteredFiles = files.filter((_, i) => !ignoredFiles[i]);
    return filteredFiles.join(" ");
};

module.exports = {
    "*.js": async (files) => {
        const filesToLint = await removeIgnoredFiles(files);
        return [`eslint --cache --max-warnings=0 ${filesToLint}`];
    },
};
