(function(){
  'use strict';

	var pkg = require('../../package.json');

  module.exports = function(){
    return {
      buildInfo: function(req, res, next){
    		res.write(pkg.version);
    		res.end();
    	}
    };
  };
})();
