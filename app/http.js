(function(){
  'use strict';

  const path = require('path'),
        lessMiddleware = require('less-middleware'),
        serveStatic = require('serve-static');

  module.exports = function(app){

    app.locals.moment = require('moment');

    app.set('views', path.join(__dirname,'./views'));
    app.set('view engine', 'pug');
    app.use(lessMiddleware(path.join(__dirname, '../public')));
    app.use(serveStatic(path.join(__dirname, '../public')));

    app.logger.trace('http plugin initialized');
  };
})();