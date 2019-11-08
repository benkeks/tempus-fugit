const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/hw-client/game.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist/'),
        host: '127.0.0.1',
        port: 8080,
        open: true
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    performance: {
        hints: false
    },
    plugins: [
        new CopyPlugin([
            { from: path.resolve(__dirname, 'index.html'), to: 'index.html' },
        ]),
    ],
};
