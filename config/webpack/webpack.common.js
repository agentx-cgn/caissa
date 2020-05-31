const webpack = require('webpack');
const paths   = require('./paths');
const rules   = require('./rules');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    context: paths.contextPath,
    entry: {
        main: paths.entryPath,
    },
    module: {
        rules,
    },
    resolve: {
        modules:    ['src', 'node_modules'],
        extensions: ['*', '.js', '.scss', '.css'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: paths.templatePath,
        }),
        new webpack.ProvidePlugin({
            m: 'mithril', //Global access
        }),
        new CopyPlugin([
            { from: 'assets/static', to: 'static/', force: true},
        ]),
    ],
};
