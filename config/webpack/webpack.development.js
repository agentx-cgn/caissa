const webpack = require('webpack');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');
const paths = require('./paths');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
    node: {
        fs: 'empty',
    },
    mode: 'development',

    // https://webpack.js.org/configuration/devtool/
    // devtool: 'cheap-module-source-map',  // fast, breaks imports
    // devtool: 'inline-source-map',        // fast, usable imports
    devtool: 'eval-source-map',             // slow

    devServer: {

        // https://webpack.js.org/configuration/dev-server/#devserveropen

        hot: true,
        https: true,
        key:  fs.readFileSync('./certificates/localhost+2-key.pem'),
        cert: fs.readFileSync('./certificates/localhost.pem'),
        ca:   fs.readFileSync('./certificates/rootCA.pem'),
        port: 3000,
        host: '0.0.0.0',
        // noInfo: true,
        open: 'google-chrome',
        // open: {
        // needs wp 5.0
        //     app: ['google-chrome', '--window-position=300,0', '--window-size="1620,1080"', '--window-workspace=2'],
        // },
        compress: true,
        historyApiFallback: false,
        contentBase: paths.outputPath,
        // mimeTypes: {
        //     // 'text/html':       ['html'],
        //     'text/css':        ['css'],
        //     'text/javascript': ['js'],
        // },
        onListening: function(server) {
            const port = server.listeningApp.address().port;
            console.log('Listening on port:', port);
        },
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: {
                    loader: 'worker-loader',
                    options: {
                        fallback: false,
                        name: 'WorkerName.[hash].js',
                        publicPath: '/js/',
                    }},
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    cache: false,
                    configFile: './.eslintrc.js',
                    emitWarning: true,
                    // Fail only on errors
                    failOnWarning: false,
                    failOnError: false,
                    // Toggle autofix
                    fix: false,
                    formatter: require('eslint/lib/cli-engine/formatters/stylish'),
                },
            }],
    },
    output: {
        path: paths.outputPath,
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js',
    },
    plugins: [
        new Dotenv({
            path: paths.envDevPath, // Path to .env.development file
            expand: true ,
        }),
        new Dotenv({
            path: paths.envPath, // Path to .env file
            expand: true,
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
        }),
        new WriteFilePlugin({
            test: /static/,
            useHashIndex: false,
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
};
