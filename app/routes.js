(function(){
  'use strict';

  module.exports = function(app){
    app.get('/', app.auth, app.controllers.trains.index);

    app.get('/trains/power/:value?', app.auth, app.controllers.trains.power);
    app.get('/trains/throttle/:address/speed/:value?', app.auth, app.controllers.trains.throttle);
    app.get('/trains/throttle/:address/f/:functionid/:value?', app.auth, app.controllers.trains.setFunction);
    app.get('/trains/throttle/:address/direction/:value', app.auth, app.controllers.trains.setDirection);

    app.get('/cam/status', app.auth, app.controllers.cam.status);
    app.get('/cam/preset/:name', app.auth, app.controllers.cam.preset);
    app.get('/cam/ir/:status', app.auth, app.controllers.cam.ir);

    app.get('/devices', app.auth, app.controllers.devices.index);

    app.get('/buildinfo', app.auth, app.controllers.util.buildInfo);
  };
})();