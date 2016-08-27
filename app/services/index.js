(function(){
  'use strict';

  module.exports = function(app){
    app.services = {
      jmri:  require('./jmri')(app)
    };
    app.logger.trace('services initialized');
  };
})();