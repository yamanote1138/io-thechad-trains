var async = require('async'),
	FoscamHdClient = require('foscamhd-client');

module.exports = function(app){

	var config = app.config.get('jmri');

	var cacheDuration = config.cacheDuration,
		foscamClient = new FoscamHdClient(app.config.get('cam').pointblank);

	function _getCamStreamUrl(done){

		var key = 'pointblank.streamUrl';

		app.cache.get(key, function(err, record){
			if(record) return done(err, record);

			foscamClient.getStreamUrl(function(err, streamUrl){
				app.cache.set(key, streamUrl);
				app.cache.expire(key, cacheDuration);
				done(err, streamUrl);
			});
		});

	}

	var ctrl = {
		index: function(req, res, next){
			async.parallel(
				{
					streamUrl:		_getCamStreamUrl,
					roster:				app.services.jmri.getRoster,
					turnouts:			app.services.jmri.getTurnouts
				},
				function(err, data){
					res.render('trains', {
						title:			'Trains',
						roster: 		data.roster,
						turnouts:		data.turnouts,
						streamUrl:	data.streamUrl
					});
				}
			);
		},
		power: function(req, res, next){
			if(req.params.value){
				app.services.jmri.setPower(req.params.value, function(){
					res.write(req.params.value);
					res.end();
				});
			}else{
				app.services.jmri.getPower(function(err, data){
					res.write(data);
					res.end();
				});
			}
		},
		throttle:	function(req, res, next){
			app.services.jmri.setThrottleSpeed(req.params.address, req.params.value, function(){
				res.write(req.params.value);
				res.end();
			});
		},
		setFunction: function(req, res, next){
			app.services.jmri.setThrottleFunction(req.params.address, req.params.functionid, req.params.value, function(){
				res.write(req.params.value);
				res.end();
			});
		},
		setDirection: function(req, res, next){
			app.services.jmri.setThrottleDirection(req.params.address, req.params.value, function(){
				res.write(req.params.value);
				res.end();
			});
		}
	};

	return ctrl;
};
