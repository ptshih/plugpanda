import webpack from 'webpack';
import webpackConfig from './webpack.config.js';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
const webpackCompiler = webpack(webpackConfig);

module.exports = {
  devMiddleware: webpackDevMiddleware(webpackCompiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  }),

  hotMiddleware: webpackHotMiddleware(webpackCompiler, {
    log: console.log,
  }),
};
