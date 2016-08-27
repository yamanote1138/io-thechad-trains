(function(){
  'use strict';

  const bunyan = require('bunyan'),
        PrettyStream = require('bunyan-prettystream'),
        pkg = require('../package.json');

  function reqSerializer(req) {
    return {
      method: req.method,
      url: req.url
    };
  }

  function resSerializer(res) {
    return {
      statusCode: res.statusCode
    };
  }

  function errSerializer(err) {
    return {
      statusCode: err.statusCode,
      msg: err.msg,
      description: err.description
    };
  }


  // supported log levels:
  // "fatal" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
  // "error" (50): Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
  // "warn" (40): A note on something that should probably be looked at by an operator eventually.
  // "info" (30): Detail on regular operation.
  // "debug" (20): Anything else, i.e. too verbose to be included in "info" level.
  // "trace" (10): Logging from external libraries used by your app or very detailed application logging.

  module.exports = function(app){
    let config = app.config.get('logging');

    let options = {
      level: config ? config.level : 'info',
      name: pkg.name || 'unknown',
      serializers: {
        req: reqSerializer,
        res: resSerializer,
        err: errSerializer
      }
    };

    if(config.pretty){
      let prettyStdOut = new PrettyStream({mode:'short'});
      prettyStdOut.pipe(process.stdout);        

      options.streams = [{
        type: 'raw',
        stream: prettyStdOut
      }];
    }

    if(config.path){
      options.streams.push({
        type: 'file',
        path: config.path
      });
    }

    app.logger = bunyan.createLogger(options);
    app.logger.trace('logging initialized');
  };
})();