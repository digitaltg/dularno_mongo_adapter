const esModules = [].join("|");

/** @type {import('jest').Config} */
const config = {
    verbose: true,
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};

module.exports = config;
