(function(){
  'use strict';

  //set local env vars
  require('dotenv').config({silent: true});

  const App = require('broadway'),
        express = require('express'),
        config = require('config');

  config.http = process.env.PORT || 3000;

  var app = new App(config);

  app.mixin(express());

  app.cache = require('redis').createClient(process.env.REDISCLOUD_URL||{});

  app.preboot(function (app, options, next) {
    require('express-jsend');
    require('./app/logger')(app);
    require('./app/http')(app);
    require('./app/auth')(app);
    require('./app/services')(app);
    require('./app/controllers')(app);
    require('./app/routes')(app);
    next();
  });

  app.start(function(err) {
    if (err) {
      app.logger.error(`error on startup: ${err.message}`);
      return process.exit(1);
    }

    app.logger.info(`listening over http on port ${this.given.http}`);
  });
})();