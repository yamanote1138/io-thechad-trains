(function(){
  'use strict';

  module.exports = function(app){
    app.controllers = {
      cam:          require('./cam')(app),
      devices:      require('./devices')(app),
      trains:       require('./trains')(app),
      util:         require('./util')()
    };
    var ctrlNames = [];
    for(var ctrlName in app.controllers){
      if(app.controllers.hasOwnProperty(ctrlName)) ctrlNames.push(ctrlName);
    }
    ctrlNames.sort();
    console.log(('initialized controllers: '+ctrlNames.join(',')).grey);
  };
})();