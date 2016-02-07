// This transpiles everything below this line from ES6 to ES5
// NOTE: Might not be good for production in the long run
// https://medium.com/javascript-scene/how-to-use-es6-for-isomorphic-javascript-apps-2a9c3abe5ea2
// https://medium.com/@Cuadraman/how-to-use-babel-for-production-5b95e7323c2f#.q66p95gld
require('babel-core/register');
require('./api');
