(function(){
  'use strict';

  var path = require('path');
  var lessMiddleware = require('less-middleware');
  var serveStatic = require('serve-static');
  var methodOverride = require('method-override');
  var morgan = require('morgan');

  module.exports = function(app){

    app.locals.moment = require('moment');

    app.set('views', path.join(__dirname,'./views'));
    app.set('view engine', 'jade');
    app.use(methodOverride());
    app.use(morgan('dev'));
    app.use(lessMiddleware(path.join(__dirname, '../public')));
    app.use(serveStatic(path.join(__dirname, '../public')));

    console.log(('http plugin initialized').grey);
  };
})();