const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AppCachePlugin = require('appcache-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json'],
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true,
      },
    }),
    new ExtractTextPlugin('[name].min.css?v=[hash]'),
    new HtmlWebpackPlugin({
      template: 'index.webpack.html',
      inject: 'body',
      filename: 'index.html',
      cache: false,
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
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
  entry: [
    path.join(__dirname, './app/index.jsx'),
  ],
  output: {
    path: path.join(__dirname, '/assets/'),
    filename: '[name].min.js?v=[hash]',
    publicPath: '/assets/',
  },
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
      loader: ExtractTextPlugin.extract(['css', 'sass']),
    }, {
      test: /\.(woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=10000&minetype=application/font-woff',
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
    }],
    sassLoader: {
      includePaths: [path.resolve(__dirname, './node_modules')],
    },
  },
};
