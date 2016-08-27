(function(){
  'use strict';

  const async = require('async'),
        FoscamHdClient = require('foscamhd-client');

  module.exports = function(app){

    let foscam = new FoscamHdClient(app.config.get('cam').pointblank);

    return {
      status: function(req, res){
        var data = {};
        foscam.status(function(statusData){
          data.status = statusData;
          foscam.camera_params(function(camData){
            data.params = camData;
            res.write(JSON.stringify(data, null, 2));
            res.end();
          });
        });
      },
      preset: function(req, res){
        foscam.gotoPreset(req.params.name, function(){
          res.end();
        });
      },
      ir: function(req, res){
        async.series(
          [
            function(cb){ foscam.setIrMode('manual', cb); },
            function(cb){ foscam.setIrState(req.params.status, cb); },
            function(cb){ foscam.setIrMode('auto', cb); }
          ],
          function(){
            res.end();
          }
        );
      }
    };
  };
})();