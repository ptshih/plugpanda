const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack.config.js');

const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

module.exports = function(app) {
  const webpackCompiler = webpack(webpackConfig);
  const webpackDevServer = new WebpackDevServer(webpackCompiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  });

  // Start webpack-dev-server
  webpackDevServer.listen(app.get('props').webpackPort, 'localhost', () => {
    console.log(`├── Webpack [PORT: ${app.get('props').webpackPort}]`);
  });

  // Proxy routes to webpack-dev-server
  app.all('/assets/*', (req, res) => {
    proxy.web(req, res, {
      target: 'http://localhost:9002',
      ignorePath: false,
    });
  });
  app.all('/cache.manifest', (req, res) => {
    proxy.web(req, res, {
      target: 'http://localhost:9002/assets/cache.manifest',
      ignorePath: true,
    });
  });
  app.all('*', (req, res) => {
    proxy.web(req, res, {
      target: 'http://localhost:9002/assets/index.html',
      ignorePath: true,
    });
  });

  // Proxy catch error
  proxy.on('error', (err) => {
    console.log('Could not connect to Webpack with error: %s', err.message);
  });

  // console.log(webpackDevServer.middleware.fileSystem);
  return webpackDevServer;
};
