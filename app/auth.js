(function(){
  'use strict';

  var basicAuth = require('basic-auth-connect');

  module.exports = function(app) {
    app.auth = basicAuth(function(user, pass) {
      var users = app.config.get('auth').users;
      return users[user] && (users[user] == pass);
    });

    app.logger.trace('initialized auth plugin');
  };
})();
