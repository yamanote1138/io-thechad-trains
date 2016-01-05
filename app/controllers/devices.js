(function(){
  'use strict';

  var IndigoClient = require('indigo-client'),
  	url = require('url');

  module.exports = function(app){

  	var indigoClient = new IndigoClient(app.config.get('indigo'));

  	return {
      index: function(req, res, next){
    		var qs = url.parse(req.url, true).query;
    		indigoClient.setDeviceValue( qs.id, qs.key, qs.val, function(err, response, body){
    			res.end();
    		});
    	}
    };
  };
})();
