(function(){
  'use strict';

  //require('newrelic');
  var App = require('broadway'),
    colors = require('colors'),
    fs = require('fs'),
    express = require('express'),
    config = require('config');

  config.http = process.env.PORT || 3000;

  var app = new App(config);

  app.mixin(express());

  app.cache = require('redis').createClient(process.env.REDISCLOUD_URL||{});

  app.preboot(function (app, options, next) {
    require('express-jsend');
    require('./app/http')(app);
    require('./app/auth')(app);
    require('./app/services')(app);
    require('./app/controllers')(app);
    require('./app/routes')(app);
    next();
  });

  app.start(function(err) {
    if (err) {
      console.error('error on startup: %s', err.message);
      return process.exit(1);
    }

    console.log('listening over http on port %s', this.given.http);

    // init any post-startup plugins
    //require('./app/plugins/biscuitron.js')(app);
  });
})();