(function(){
  'use strict';

  module.exports = function(app){
    app.controllers = {
      cam:          require('./cam')(app),
      devices:      require('./devices')(app),
      trains:       require('./trains')(app),
      util:         require('./util')()
    };
    app.logger.trace('controllers initialized');
  };
})();