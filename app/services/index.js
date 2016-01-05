(function(){
	'use strict';

  module.exports = function(app){
    app.services = {
      jmri:  require('./jmri')(app)
    };
    var svcNames = [];
    for(var svcName in app.services){
      if(app.services.hasOwnProperty(svcName)) svcNames.push(svcName);
    }
    svcNames.sort();
    console.log(('initialized services: '+svcNames.join(',')).grey);
  };
})();