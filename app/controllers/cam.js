(function(){
  'use strict';

	var async = require('async'),
		FoscamHdClient = require('foscamhd-client');

	module.exports = function(app){

		var client = new FoscamHdClient(app.config.get('cam').pointblank);

		return {
			status: function(req, res, next){
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
			preset: function(req, res, next){
				client.gotoPreset(req.params.name, function(){
					res.end();
				});
			},
			ir: function(req, res, next){
				async.series(
					[
						function(cb){ client.setIrMode('manual', cb); },
						function(cb){ client.setIrState(req.params.status, cb); },
						function(cb){ client.setIrMode('auto', cb); }
					],function(err, results){
						res.end();
					}
				);
			}
		};
	};
})();