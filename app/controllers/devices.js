(function(){
  'use strict';

  const IndigoClient = require('indigo-client'),
        url = require('url');

  module.exports = function(app){

    var indigoClient = new IndigoClient(app.config.get('indigo'));

    return {
      index: function(req, res){
        var qs = url.parse(req.url, true).query;
        indigoClient.setDeviceValue( qs.id, qs.key, qs.val, function(){
          res.end();
        });
      }
    };
  };
})();
