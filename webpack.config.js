const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AppCachePlugin = require('appcache-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json'],
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.webpack.html',
      inject: 'body',
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    new AppCachePlugin({
      cache: [],
      network: ['*'],  // No network access allowed!
      // fallback: [],
      // settings: ['prefer-online'],
      exclude: [/.*\.js$/, /.*\.map$/, 'index.html'],  // Exclude .js, .map files
      output: 'cache.manifest',
    }),
  ],
  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    path.join(__dirname, './app/index.jsx'),
  ],
  output: {
    path: path.join(__dirname, '/assets/'),
    filename: 'js/[name].js',
    publicPath: '/',
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
        plugins: [
          ['react-transform', {
            transforms: [{
              transform: 'react-transform-hmr',
              imports: ['react'],
              locals: ['module'],
            }],
          }],
        ],
      },
    }, {
      test: /\.json?$/,
      loader: 'json',
    }, {
      test: /\.scss$/,
      loaders: ['style', 'css?sourceMap', 'sass?sourceMap'],
    }],
  },
};
