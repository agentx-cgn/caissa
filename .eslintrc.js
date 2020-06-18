module.exports = {
    env: {
        browser:  true,
        commonjs: true,
        es6:      true,
        node:     true,
    },
    globals: {
        'm': true,
        'SharedArrayBuffer': true
    },
    extends: [
        'eslint:recommended',
        'plugin:mithril/recommended'
    ],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 9,
        ecmaFeatures: {
            jsx: true
        }
    },
    rules: {
        'comma-dangle':        ['error', 'always-multiline'],
        'indent':              ['error', 4, { flatTernaryExpressions: true, ignoreComments: true }],
        'linebreak-style':     ['error', 'unix'],
        'quotes':              ['error', 'single'],
        'semi':                ['error', 'always'],
        'no-unused-vars':      ['warn'],
        'no-console':          0,
        'rest-spread-spacing': ["error", "never"],
    },
};
