const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AppCachePlugin = require('appcache-webpack-plugin');

const path = require('path');
const outputPath = path.resolve(__dirname, 'assets');
const entryPath = path.resolve(__dirname, 'app', 'index.jsx');

module.exports = {
  devtool: 'source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:9002',
    entryPath,
  ],
  output: {
    path: outputPath,
    filename: '[name].js',
    publicPath: '/assets/',
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json'],
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.webpack.html',
      inject: 'body',
      filename: 'index.html',
      cache: false,
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    new AppCachePlugin({
      cache: [],
      network: ['*'],  // No network access allowed!
      // fallback: [],
      // settings: ['prefer-online'],
      exclude: [/.*\.map$/, /.*\.json$/],  // Exclude .js, .map files
      output: 'cache.manifest',
    }),
  ],
  module: {
    loaders: [{
      test: /\.js?$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ['es2015', 'react'],
      },
    }, {
      test: /\.jsx?$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ['es2015', 'react'],
      },
    }, {
      test: /\.json?$/,
      loader: 'json',
    }, {
      test: /\.scss$/,
      loaders: ['style', 'css?sourceMap', 'sass?sourceMap'],
    }, {
      test: /\.(woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=10000&minetype=application/font-woff',
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
    }],
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, './node_modules')],
  },
};
