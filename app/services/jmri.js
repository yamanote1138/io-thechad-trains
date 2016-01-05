(function(){
  'use strict';

  var JmriClient = require('jmri-client'),
      request = require('request');

  module.exports = function(app){
  
    var config = app.config.get('jmri');
    var cacheDuration = config.cacheDuration;
    var jmriClient = new JmriClient(config.host);

    var svc = {
      getRoster: function(done){
        app.cache.get('jmri.roster', function(err, record){
          if(!record){
            request.get(config.host+'/json/roster', function(err, response, data){
              var roster = JSON.parse(data) || [];
              roster.sort(function(a, b){
                return a.data.comment > b.data.comment;
              });
              roster.map(function(entry){
                entry.data.thumbnailUrl = config.host+'/roster/'+encodeURI(entry.data.name)+'/icon?maxHeight=200';
              });
              app.cache.set('jmri.roster', JSON.stringify(roster));
              app.cache.expire('jmri.roster', cacheDuration);
              done(null, roster);
            });
          }else{
            var roster = JSON.parse(record);
            done(null, roster);
          }
        });
      },
      getTurnouts: function(done){
        app.cache.get('jmri.turnouts', function(err, record){
          if(!record){
            request.get(config.host+'/json/turnouts', function(err, response, data){
              var turnouts = JSON.parse(data) || [];
              app.cache.set('jmri.turnouts', JSON.stringify(turnouts));
              app.cache.expire('jmri.turnouts', cacheDuration);
              done(null, turnouts);
            });
          }else{
            var turnouts = JSON.parse(record);
            done(null, turnouts);
          }
        });
      },
      setPower: jmriClient.setPower,
      getPower: jmriClient.getPower,
      setThrottleSpeed: jmriClient.setThrottleSpeed,
      setThrottleFunction: jmriClient.setThrottleFunction,
      setThrottleDirection: jmriClient.setThrottleDirection
    };

    return svc;
  };
})();